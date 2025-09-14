import asyncio
import json
import logging
import os
import re
from typing import Dict, Any, List, Optional, Tuple
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import BaseTool, StructuredTool
from langchain_core.tools import tool
from pydantic.v1 import BaseModel, Field
from langchain_openai import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from services.chat_service import chat_service
from models.conversation import ChatRequest, Message
from database.conversation_repository import conversation_repo
import time


from http_mcp_client import HTTPMCPClient, MCPTool, MCPResponse
from intent_detector import IntentDetector, IntentResult
from parameter_validator import ParameterValidator
from product_resolver import ProductResolver
from response_formatter import ResponseFormatter
from jwt_utils import extract_user_id_from_token, extract_user_info_from_token
from intent_detector import IntentDetector
from missing import MissingParameterHandler

from response_types import ResponseType, create_response, BaseResponse
from response_mapper import ResponseMapper

logger = logging.getLogger(__name__)

def run_async_safely(coro):
    """Safely run async code from sync context"""
    import concurrent.futures
    import threading
    
    def run_in_new_loop():
        """Run the coroutine in a new event loop in a new thread"""
        new_loop = asyncio.new_event_loop()
        asyncio.set_event_loop(new_loop)
        try:
            return new_loop.run_until_complete(coro)
        finally:
            new_loop.close()
    
    # Always run in a new thread to avoid event loop conflicts
    with concurrent.futures.ThreadPoolExecutor() as executor:
        future = executor.submit(run_in_new_loop)
        return future.result(timeout=30)

def make_sync_http_request(url: str, method: str = "POST", json_data: dict = None, headers: dict = None) -> dict:
    """Make a synchronous HTTP request using requests library"""
    import requests
    
    try:
        if method.upper() == "POST":
            response = requests.post(url, json=json_data, headers=headers, timeout=30)
        else:
            response = requests.get(url, headers=headers, timeout=30)
        
        response.raise_for_status()
        return response.json()
    except Exception as e:
        logger.error(f"HTTP request error: {e}")
        return {"error": str(e)}

# Define Pydantic models for tool inputs
class GetProductInput(BaseModel):
    id: str

class SearchProductsInput(BaseModel):
    query: str
    limit: Optional[int] = None

class GetProductsInput(BaseModel):
    page: Optional[int] = None
    limit: Optional[int] = None
    category: Optional[str] = None
    search: Optional[str] = None
    minPrice: Optional[float] = None
    maxPrice: Optional[float] = None

class GetCartInput(BaseModel):
    pass

class AddToCartInput(BaseModel):
    productId: str
    quantity: Optional[int] = None

class RemoveFromCartInput(BaseModel):
    productId: str

class UpdateCartItemInput(BaseModel):
    productId: str
    quantity: int

class EcommerceTool(BaseTool):
    """LangChain tool wrapper for MCP tools"""
    
    name: str
    description: str
    mcp_client: HTTPMCPClient
    mcp_tool: MCPTool
    user_token: Optional[str] = None
    missing_param_handler: Optional[MissingParameterHandler] = None
    
    def _run(self, **kwargs) -> str:
        """Synchronous run method"""
        return asyncio.run(self._arun(**kwargs))
    
    async def _arun(self, *args, **kwargs) -> str:
        """Asynchronous run method"""
        logger.info(f"🔧 Executing tool '{self.name}' with parameters: {kwargs}")
        
        try:
            filtered_kwargs = {}
            required_params = self.mcp_tool.input_schema.get("required", [])
            properties = self.mcp_tool.input_schema.get("properties", {})
            
            logger.debug(f"Tool schema - required: {required_params}, properties: {list(properties.keys())}")
            
            # Start with a copy of input kwargs
            filtered_kwargs = {}
            
            # Filter and include valid parameters
            for key, value in kwargs.items():
                if key in properties:
                    filtered_kwargs[key] = value
                    logger.debug(f"Included parameter: {key} = {value}")
                else:
                    logger.debug(f"Filtered out parameter: {key} = {value} (not in schema)")
            
            # Handle special authentication parameters for cart and user operations
            if self.name in ['add_to_cart', 'remove_from_cart', 'update_cart_item', 'clear_cart', 
                           'get_cart', 'get_orders', 'get_order', 'create_order'] and 'userId' in properties:
                # If userId is required but not provided, extract it from JWT token
                if 'userId' not in filtered_kwargs or not filtered_kwargs['userId']:
                    if self.user_token:
                        user_id = extract_user_id_from_token(self.user_token)
                        if user_id:
                            filtered_kwargs['userId'] = user_id
                            logger.debug(f"Added userId from JWT token: {user_id}")
                        else:
                            logger.warning(f"Tool '{self.name}' requires userId but couldn't extract from token")
                            filtered_kwargs['userId'] = "unknown_user"  # Fallback
                    else:
                        logger.warning(f"Tool '{self.name}' requires userId but no user token provided")
                        # Don't add a default userId if no token - let the API handle the error
            
            # Add any missing required parameters with empty defaults
            for param in required_params:
                if param not in filtered_kwargs:
                    # Set appropriate defaults based on parameter type
                    param_def = properties.get(param, {})
                    param_type = param_def.get('type', 'string')
                    
                    if param_type == 'number':
                        default_value = param_def.get('default', 1)
                    elif param_type == 'array':
                        default_value = param_def.get('default', [])
                    elif param_type == 'boolean':
                        default_value = param_def.get('default', False)
                    else:
                        default_value = param_def.get('default', "")
                    
                    filtered_kwargs[param] = default_value
                    logger.debug(f"Added missing required parameter: {param} = {default_value}")
            
            logger.info(f"🚀 Calling MCP tool '{self.name}' with filtered parameters: {filtered_kwargs}")
            
            # Pass user token to MCP client if available
            response = await self.mcp_client.execute_tool(self.name, filtered_kwargs, user_token=self.user_token)
            
            if response.success:
                # For read actions, return structured JSON response
                if self.name in ["get_products", "get_product", "search_products", "get_categories", "get_category", 
                               "get_cart", "get_orders", "get_order", "get_profile", "get_addresses"]:
                    structured_response = ResponseMapper.map_tool_response(self.name, response.data)
                    return json.dumps(structured_response.dict(), indent=2)
                else:
                    # For other actions, return simple JSON
                    return json.dumps(response.data, indent=2)
            else:
                logger.error(f"❌ Tool '{self.name}' execution failed: {response.error}")
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"❌ Exception in tool '{self.name}': {e}")
            return f"Error: {str(e)}"
    
    def set_user_token(self, token: str):
        """Set the user token for authentication"""
        self.user_token = token
        logger.debug(f"Set user token for tool '{self.name}'")
            logger.error(f"Error running tool {self.name}: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)

def create_structured_tools(mcp_client: HTTPMCPClient):
    """Create StructuredTools for specific MCP tools"""
    
    def get_product(id: str) -> str:
        """Get single product by ID"""
        try:
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "get_product",
                "args": {"id": id}
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            if response.success:
                structured_response = ResponseMapper.map_tool_response("get_product", response.data)
                return json.dumps(structured_response.dict(), indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running get_product: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    def search_products(query: str, limit: Optional[int] = None) -> str:
        """Search products by name or description"""
        try:
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "search_products",
                "args": {"query": query, "limit": limit or 10}
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            
            if response.success:
                structured_response = ResponseMapper.map_tool_response("search_products", response.data)
                return json.dumps(structured_response.dict(), indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running search_products: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    def get_products(page: Optional[int] = None, limit: Optional[int] = None, category: Optional[str] = None, search: Optional[str] = None, minPrice: Optional[float] = None, maxPrice: Optional[float] = None) -> str:
        """Get all products with optional filters"""
        try:
            args = {"page": page or 1, "limit": limit or 10}
            if category:
                args["category"] = category
            if search:
                args["search"] = search
            if minPrice:
                args["minPrice"] = minPrice
            if maxPrice:
                args["maxPrice"] = maxPrice
                
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "get_products",
                "args": args
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            if response.success:
                structured_response = ResponseMapper.map_tool_response("get_products", response.data)
                return json.dumps(structured_response.dict(), indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running get_products: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    def get_cart() -> str:
        """Get user shopping cart"""
        try:
            # Extract user email from JWT token
            actual_user_id = "your@email.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    # Decode the JWT token to get user information
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("email", "your@email.com")
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}, using default user ID")
            else:
                logger.warning("No user token available, using default user ID")
            
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "get_cart",
                "args": {"userId": actual_user_id}
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            
            if response.success:
                structured_response = ResponseMapper.map_tool_response("get_cart", response.data)
                return json.dumps(structured_response.dict(), indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running get_cart: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    def add_to_cart(productId: str, quantity: Optional[int] = None) -> str:
        """Add item to shopping cart"""
        try:
            # Extract user email from JWT token
            actual_user_id = "your@email.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("email", "your@email.com")
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}, using default user ID")
            else:
                logger.warning("No user token available, using default user ID")
            
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "add_to_cart",
                "args": {"userId": actual_user_id, "productId": productId, "quantity": quantity or 1}
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            
            if response.success:
                return json.dumps(response.data, indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running add_to_cart: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    def remove_from_cart(productId: str) -> str:
        """Remove item from shopping cart"""
        try:
            # Extract user email from JWT token
            actual_user_id = "your@email.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    # Decode the JWT token to get user information
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("email", "your@email.com")
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}, using default user ID")
            else:
                logger.warning("No user token available, using default user ID")
            
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "remove_from_cart",
                "args": {"userId": actual_user_id, "productId": productId}
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            
            if response.success:
                return json.dumps(response.data, indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running remove_from_cart: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    def update_cart_item(productId: str, quantity: int) -> str:
        """Update quantity of item in cart"""
        try:
            # Extract user email from JWT token
            actual_user_id = "your@email.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("email", "your@email.com")
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}, using default user ID")
            else:
                logger.warning("No user token available, using default user ID")
            
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "update_cart_item",
                "args": {"userId": actual_user_id, "productId": productId, "quantity": quantity}
            }
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            
            if "error" in result:
                return json.dumps({
                    "response_type": "error",
                    "success": False,
                    "message": f"HTTP request failed: {result['error']}",
                    "data": None,
                    "error": result['error']
                }, indent=2)
            
            # Parse MCP response
            mcp_result = result.get("result", {})
            if mcp_result and "statusCode" in mcp_result:
                success = mcp_result.get("statusCode") == 200
                response = MCPResponse(
                    success=success,
                    data=mcp_result,
                    error=None if success else mcp_result.get("message", "Unknown error")
                )
            else:
                response = MCPResponse(
                    success=True,
                    data=mcp_result,
                    error=None
                )
            
            if response.success:
                return json.dumps(response.data, indent=2)
            else:
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
        except Exception as e:
            logger.error(f"Error running update_cart_item: {e}")
            error_response = create_response(
                ResponseType.ERROR,
                success=False,
                message=f"Tool execution error: {str(e)}",
                error=str(e)
            )
            return json.dumps(error_response.dict(), indent=2)
    
    # Create StructuredTools
    tools = [
        StructuredTool.from_function(
            func=get_product,
            name="get_product",
            description="Get single product by ID",
            args_schema=GetProductInput
        ),
        StructuredTool.from_function(
            func=search_products,
            name="search_products", 
            description="Search products by name or description",
            args_schema=SearchProductsInput
        ),
        StructuredTool.from_function(
            func=get_products,
            name="get_products",
            description="Get all products with optional filters",
            args_schema=GetProductsInput
        ),
        StructuredTool.from_function(
            func=get_cart,
            name="get_cart",
            description="Get user shopping cart",
            args_schema=GetCartInput
        ),
        StructuredTool.from_function(
            func=add_to_cart,
            name="add_to_cart",
            description="Add item to shopping cart",
            args_schema=AddToCartInput
        ),
        StructuredTool.from_function(
            func=remove_from_cart,
            name="remove_from_cart",
            description="Remove item from shopping cart",
            args_schema=RemoveFromCartInput
        ),
        StructuredTool.from_function(
            func=update_cart_item,
            name="update_cart_item",
            description="Update quantity of item in cart",
            args_schema=UpdateCartItemInput
        )
    ]
    
    return tools

class EcommerceAgent:
    def __init__(self, mcp_client: HTTPMCPClient, azure_config: Dict[str, str]):
        logger.info("🚀 Initializing EcommerceAgent")
        
        self.mcp_client = mcp_client
        
        # Create Azure OpenAI client with explicit parameters
        logger.info("🤖 Setting up Azure OpenAI client")
        self.llm = AzureChatOpenAI(
            azure_deployment=azure_config.get("deployment_name", "gpt-4o"),
            azure_endpoint=azure_config.get("endpoint"),
            api_key=azure_config.get("api_key"),
            api_version=azure_config.get("api_version", "2024-02-15-preview"),
            temperature=0.1
        )
        self.tools: List[EcommerceTool] = []
        self.agent_executor: Optional[AgentExecutor] = None
        
        # Initialize helper modules - REMOVE THE DUPLICATE INTENT_DETECTOR
        logger.info("🔧 Initializing helper modules")
        # Initialize AI-powered intent detector with Azure config and MCP client
        self.intent_detector = IntentDetector(mcp_client, self.llm)  # Pass azure_config first, then mcp_client
        self.parameter_validator = ParameterValidator(mcp_client)
        self.missing_param_handler = MissingParameterHandler(self.parameter_validator)
        self.product_resolver = ProductResolver(mcp_client)
        self.response_formatter = ResponseFormatter()
        
        logger.info("✅ EcommerceAgent initialization completed")

    async def send_prompt_to_user(self, prompt_message: str, user_id: str = None, user_token: str = None) -> Dict[str, Any]:
        """
        Generate AI-powered questions for missing parameters and save assistant messages
        """
        try:
            # Get previous conversation history if user_id available
            previous_messages = []
            if user_id:
                previous_messages = await chat_service.get_conversation_history(user_id, limit=10)
                previous_messages = previous_messages.messages if hasattr(previous_messages, 'messages') else []
            
            # Create context from previous messages
            conversation_context = self._build_conversation_context(previous_messages)
            
            # Generate AI-powered question using Azure OpenAI
            ai_question = await self._generate_missing_param_question(
                prompt_message, 
                conversation_context
            )
            
            # Save the assistant's question to conversation
            if user_id and ai_question:
                assistant_message = Message(
                    role="assistant", 
                    content=ai_question,
                    timestamp=time.time()
                )
                await conversation_repo.add_message(user_id, assistant_message)
                logger.info(f"Saved assistant question to conversation for user {user_id}")
            logger.info({"question": ai_question, "requires_user_input": True})
            # Return the generated question (in real implementation, this would be sent to user)
            return {"question": ai_question, "requires_user_input": True}
            
        except Exception as e:
            logger.error(f"Error in send_prompt_to_user: {e}")
            return {"question": prompt_message, "requires_user_input": True}

    def _build_conversation_context(self, messages: List) -> str:
        """Build context string from previous conversation messages"""
        if not messages:
            return "No previous conversation."
        
        context_parts = []
        for msg in messages[-5:]:  # Last 5 messages for context
            role = msg.role if hasattr(msg, 'role') else msg.get('role', 'unknown')
            content = msg.content if hasattr(msg, 'content') else msg.get('content', '')
            context_parts.append(f"{role.capitalize()}: {content}")
        
        return "\n".join(context_parts)

    async def _generate_missing_param_question(self, original_prompt: str, conversation_context: str) -> str:
        """Generate AI-powered question for missing parameters"""
        try:
            system_message = """You are a helpful e-commerce assistant. Based on the conversation context and missing parameter information, generate a natural, friendly question to ask the user for the missing information.

Guidelines:
- Be conversational and helpful
- Ask for specific missing information clearly
- Reference the conversation context if relevant
- Keep questions concise but complete
- Use friendly, customer service tone
- If multiple parameters are missing, ask for the most important one first"""

            user_message = f"""
Conversation Context:
{conversation_context}

Missing Parameter Information:
{original_prompt}

Please generate a natural question to ask the user for the missing information."""

            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ]

            # Use Azure OpenAI to generate the question
            response = await self.llm.agenerate_messages([
                [SystemMessage(content=system_message), HumanMessage(content=user_message)]
            ])
            
            generated_question = response.generations[0][0].message.content
            logger.debug(f"Generated AI question: {generated_question}")
            
            return generated_question
            
        except Exception as e:
            logger.error(f"Error generating AI question: {e}")
            # Fallback to original prompt
            return original_prompt
        self.pending_actions: Dict[str, Dict[str, Any]] = {}
        self.conversation_context: Dict[str, Any] = {}
        self.pagination_context: Dict[str, Dict[str, Any]] = {}  # Track pagination state
        
    def set_user_token(self, token: str):
        """Set the user token for authentication"""
        self.user_token = token
        self.mcp_client.user_token = token

    async def initialize(self):
        """Initialize the agent with MCP tools"""
        logger.info("🔄 Starting agent initialization process")
        
        try:
            # Start MCP client
            logger.info("📡 Starting MCP client connection")
            await self.mcp_client.start()
            logger.info("✅ MCP client connected successfully")
            
            # Create LangChain tools from MCP tools
            logger.info("🔧 Creating LangChain tools from MCP tools")
            mcp_tools = self.mcp_client.get_tools()
            self.tools = []
            
            logger.info(f"Found {len(mcp_tools)} MCP tools")
            
            for i, mcp_tool in enumerate(mcp_tools, 1):
                logger.debug(f"Creating LangChain wrapper for tool {i}/{len(mcp_tools)}: '{mcp_tool.name}'")
                
                langchain_tool = EcommerceTool(
                    name=mcp_tool.name,
                    description=mcp_tool.description,
                    mcp_client=self.mcp_client,
                    mcp_tool=mcp_tool
                )
                self.tools.append(langchain_tool)
            
            logger.info(f"✅ Created {len(self.tools)} LangChain tools")
            
            # Create the agent
            logger.info("🤖 Creating LangChain agent")
            await self._create_agent()
            logger.info("✅ LangChain agent created successfully")
            
            logger.info(f"🎉 Agent initialized successfully with {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize agent: {e}")
            raise

    async def handle_user_request(self, user_input: str, user_token: Optional[str] = None, user_id: Optional[str] = None) -> str:
        """
        Enhanced method to automatically detect intent, extract parameters, and route requests
        """
        logger.info(f"🎯 Processing user request: '{user_input}'")
        logger.debug(f"User token provided: {'Yes' if user_token else 'No'}")
        logger.debug(f"User ID provided: {user_id}")
        
        # Extract user_id from token if not provided
        if not user_id and user_token:
            user_id = extract_user_id_from_token(user_token)
        
        try:
            # Step 1: Detect intent
            logger.info("📍 Step 1: Detecting user intent")
            intent = self.intent_detector.detect_intent(user_input)
            logger.info(f" Intent detected: {intent}")
            
            logger.info(f"✅ Intent detected: '{intent.tool_name}' (confidence: {intent.confidence:.2f})")
            
            # Step 2: Check authentication
            logger.info("🔐 Step 2: Checking authentication requirements")
            if intent.requires_auth and not user_token:
                logger.warning(f"❌ Authentication required for '{intent.tool_name}' but no token provided")
                return ("You need to be logged in to do that. Please login first with your phone number and password.")
            elif intent.requires_auth:
                logger.info("✅ Authentication check passed")
            else:
                logger.info("ℹ️ No authentication required")
            
            # # Step 3: Resolve product references if needed
            logger.info("🔍 Step 3: Resolving product references")
            resolved_params = await self.product_resolver.resolve_product_references(
                intent.extracted_params, 
                user_token
            )
            if 'error' in resolved_params:
                logger.error(f"❌ Product resolution failed: {resolved_params['error']}")
                return resolved_params['error']
            
            logger.info("✅ Product reference resolution completed")
            
            # # Step 4: Validate parameters

            logger.info(f"🔍 Step 4: Validating parameters resolved params {resolved_params}")
            validated_params = self.parameter_validator.validate_tool_parameters(
                intent.tool_name, 
                    
            )
            logger.info("📋 Step 5: Checking for missing required parameters")
            user_id = extract_user_id_from_token(user_token) if user_token else None
            
            max_attempts = 3  # Prevent infinite loops
            attempts = 0
            logger.debug(f"Initial validated parameters:  attempts: {attempts} max_attempts: {max_attempts}")
            while attempts < max_attempts:
                logger.debug(f"Attempt {attempts + 1} to check for missing parameters")
                missing_params = self.parameter_validator.get_missing_parameters(
                    intent.tool_name, 
                    validated_params
                )
                
                if not missing_params:
                    logger.info("✅ All required parameters are present")
                    break
                
                attempts += 1
                logger.info(f"❌ Missing parameters (attempt {attempts}/{max_attempts}): {missing_params}")
                
                # Generate missing parameters message
                missing_msg = self.parameter_validator.format_missing_params_message(
                    intent.tool_name, 
                    missing_params
                )
                
                # Use AI to generate a better question and save it
                prompt_result = await self.send_prompt_to_user(
                    missing_msg, 
                    user_id=user_id, 
                    user_token=user_token
                )
                
                # In a real implementation, you would wait for user input here
                # For now, we'll break the loop and return the AI-generated question
                if prompt_result.get("requires_user_input"):
                    ai_question = prompt_result.get("question", missing_msg)
                    return f"I need more information to help you:\n\n{ai_question}"
            
            if attempts >= max_attempts:
                logger.warning(f"❌ Max attempts reached for missing parameters: {missing_params}")
                return "I'm having trouble getting all the information I need. Please try rephrasing your request with more details."
        
                
                
        except Exception as e:
            logger.error(f"❌ Unexpected error in handle_user_request: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"

    async def chat(self, message: str, chat_history: List[Dict[str, str]] = None, user_token: Optional[str] = None) -> str:
        """Process a chat message with optional user authentication"""
        logger.info(f"💬 Processing chat message: '{message}'")
        
        try:
            if not self.agent_executor:
                logger.error("❌ Agent not initialized")
                raise RuntimeError("Agent not initialized")
            

            # Try enhanced handling first
            logger.info("🎯 Attempting enhanced request handling")
            user_id = None
            if user_token:
                user_id = extract_user_id_from_token(user_token)
                logger.info(f"Extracted user_id: {user_id}")
                
                if user_id:
                    chat_request = ChatRequest(message=message)
                    await chat_service.send_message(user_id, chat_request)
                    logger.info("✅ Message saved to conversation")
            
            # Pass user_id to handle_user_request for better parameter handling
            enhanced_result = await self.handle_user_request(message, user_token, user_id=user_id)
            result = await self.handle_user_request(message, user_token, user_id=user_id)
            # logger.info(result)
            # logger.info("✅ LangChain agent processing completed")
            return result["output"]
            
        except Exception as e:
            logger.error(f"❌ Error processing chat message: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"
    
    async def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools"""
        logger.info("📋 Getting available tools")
        tools = [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]
        logger.info(f"✅ Retrieved {len(tools)} available tools")
        return tools
    
    async def call_tool_directly(self, tool_name: str, arguments: Dict[str, Any], user_token: Optional[str] = None) -> str:
        """Call a tool directly without going through the agent"""
        logger.info(f"🔧 Direct tool call: '{tool_name}' with arguments: {arguments}")
        
        try:
            response = await self.mcp_client.call_tool(tool_name, arguments, user_token)
            
            if response.success:
                logger.info(f"✅ Direct tool call successful: '{tool_name}'")
                return json.dumps(response.data, indent=2)
            else:
                logger.error(f"❌ Direct tool call failed: '{tool_name}' - {response.error}")
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"❌ Exception in direct tool call '{tool_name}': {e}")
            return f"Error: {str(e)}"
    
    async def shutdown(self):
        """Shutdown the agent and MCP client"""
        logger.info("🔄 Shutting down agent")
        try:
            await self.mcp_client.stop()
            logger.info("✅ Agent shutdown completed successfully")
        except Exception as e:
            logger.error(f"❌ Error during agent shutdown: {e}")

    async def _create_agent(self):
        """Create the LangChain agent"""
        logger.info("🤖 Creating LangChain agent")
        
        # Create system prompt
        system_prompt = """You are an AI assistant for an e-commerce platform. You can help users with various e-commerce operations.

CORE PRINCIPLES FOR ALL ACTIONS:

1. **Data Presentation**: For ALL read operations (getting, searching, viewing, listing data), always present the data in clean JSON format wrapped in ```json``` code blocks. The tools return structured JSON data - present this data clearly and concisely in the JSON format. Format your response as: "Here's the data you requested:" followed by the JSON block.

2. **Parameter Handling**: For ALL actions that require parameters:
   - If required parameters are missing, ask the user for them clearly and wait for their response
   - Extract available information from the user's message first
   - If you can infer missing parameters from context, do so intelligently
   - Always validate that you have all required parameters before executing an action
   - For product IDs: Look for patterns like "68c5fff6fb9060f2b15b6944" or "product 68c5fff6fb9060f2b15b6944"
   - For product names: Extract the product name from phrases like "details of this product [name]" or "show me [product name]"
   - For cart operations: Use the most recently discussed product ID from conversation history
   - CRITICAL: When user says "give me the details of this product 68c5fff6fb9060f2b15b6944", you MUST extract the ID "68c5fff6fb9060f2b15b6944" and pass it as {{"id": "68c5fff6fb9060f2b15b6944"}} to the get_product tool

3. **Error Handling**: For ALL tool executions:
   - If a tool execution fails, provide a clear error message to the user
   - Suggest alternative actions or ask for clarification
   - Never leave the user without feedback

4. **User Experience**: For ALL interactions:
   - Be conversational and helpful
   - Provide clear feedback on successful operations
   - Ask for clarification when needed
   - Guide users through multi-step processes

5. **Authentication**: For ALL actions that require user context:
   - Use the provided user token when available
   - Handle authentication errors gracefully
   - Guide users to authenticate when needed

6. **CONTEXTUAL UNDERSTANDING** (CRITICAL):
   - ALWAYS maintain conversation context and remember what the user is referring to
   - When user uses pronouns like "it", "this", "that", "the first one" - understand what they're referring to from the conversation history
   - When user says "give me more", "show me more", "next", "continue" - understand what they want more of based on the previous conversation
   - For "give me more products" - look at the last product list in conversation history and increment the page number
   - When user says "add it to cart" - use the most recently discussed product
   - When user asks "how many?" - understand they're asking about quantity for the current action
   - When user says "remove the first item" - understand they mean the first item in their cart
   - Keep track of the last action performed and continue from there
   - If context is unclear, ask specific clarifying questions rather than generic ones
   - Use the conversation history to understand references and maintain context

7. **PAGINATION HANDLING** (CRITICAL):
   - When user asks for "more products", "next page", "show more", "continue" after a product list - automatically increment the page number
   - Look at the conversation history to find the last product list response
   - Extract the page number from the previous response (it should be in the data object)
   - If the previous response showed page 1, use page 2. If page 2, use page 3, etc.
   - Always use the same limit (number of products per page) as the previous request
   - If no previous pagination context exists, start with page 1
   - When showing paginated results, always include the current page number in your response
   - If you reach the last page, inform the user that there are no more products
   - Example: If previous response had {{"page": 1, "limit": 10}}, then next request should use {{"page": 2, "limit": 10}}

AVAILABLE TOOL CATEGORIES:
- Authentication: User login, registration, logout, token refresh
- Products: Browse, search, view products and categories
- Cart: Manage shopping cart items
- Orders: Create, view, track, and manage orders
- User: Profile and address management

EXAMPLES OF PARAMETER EXTRACTION:
- User: "give me the details of this product 68c5fff6fb9060f2b15b6944" → Use get_product with {{"id": "68c5fff6fb9060f2b15b6944"}}
- User: "show me more products" → Use get_products with {{"page": 2}} (if previous was page 1)
- User: "add it to cart" → Use add_to_cart with the most recent product ID from conversation history
- User: "search for laptops" → Use search_products with {{"query": "laptops"}}

Remember: Apply these principles to ALL actions, not just specific ones. Use the available tools dynamically based on user intent, and always follow the core principles above. MOST IMPORTANTLY: Maintain conversation context and understand what the user is referring to."""

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad")
        ])
        
        # Create agent
        agent = create_openai_tools_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        # Create agent executor
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=30
        )
        
        logger.info("✅ LangChain agent created successfully")

# Example usage and testing
async def main():
    """Example usage of the enhanced EcommerceAgent"""
    import os
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Get Azure OpenAI configuration
    azure_config = {
        "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
        "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    }
    
    mcp_server_url = os.getenv("MCP_SERVER_URL", "http://mcp-server:3002")
    
    if not azure_config["api_key"] or not azure_config["endpoint"]:
        print("Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in your environment variables")
        return
    
    # Create HTTP MCP client
    mcp_client = HTTPMCPClient(mcp_server_url)
    
    # Create agent
    agent = EcommerceAgent(mcp_client, azure_config)
    
    try:
        # Initialize agent
        await agent.initialize()
        
        # Example conversation with enhanced intent detection
        print("🎉 Enhanced E-commerce Agent initialized! Type 'quit' to exit.")
        print("Try commands like:")
        print("- 'show me products'")
        print("- 'add shoes to cart'") 
        print("- 'login with phone +1234567890'")
        print("- 'place an order'")
        
        user_token = None  # Will be set after login
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'bye']:
                break
            
            # Use the enhanced handle_user_request method
            response = await agent.handle_user_request(user_input, user_token)
            
            # Handle structured response
            if isinstance(response, dict):
                print(f"\nAgent: {response['response']}")
                if response.get('data'):
                    print(f"\nData: {json.dumps(response['data'], indent=2)}")
                if response.get('error'):
                    print(f"\nError: {response['error']}")
            else:
                print(f"\nAgent: {response}")
            
            # If login was successful, extract token (simplified for demo)
            if "logged in" in response.lower() and user_token is None:
                # In a real app, you'd extract the actual token from the response['response'] if isinstance(response, dict) else response
                user_token = "sample_token_after_login"
                print("(Token saved for authenticated requests)")
    
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
