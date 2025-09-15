import asyncio
import json
import logging
import os
import re
import time
import concurrent.futures
import requests
import jwt
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
from services.chat_service import chat_service
from models.conversation import ChatRequest, Message
from database.conversation_repository import conversation_repo
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

class ClearCartInput(BaseModel):
    pass

class ClearCartInput(BaseModel):
    pass

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

def create_structured_tools(mcp_client: HTTPMCPClient):
    """Create StructuredTools for specific MCP tools"""
    
    def get_product(id: str) -> str:
        """Get single product by ID"""
        try:
            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}fexecute"
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
                    actual_user_id = decoded_token.get("user_id", "your@email.com")
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
                    actual_user_id = decoded_token.get("user_id", "your@email.com")
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
                    actual_user_id = decoded_token.get("user_id", "your@email.com")
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
                    actual_user_id = decoded_token.get("user_id", "your@email.com")
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
    
    def clear_cart() -> str:
        """Clear all items from the user's shopping cart"""
        try:
            # Extract user email from JWT token
            actual_user_id = "your@email.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    print(decoded_token)
                    actual_user_id = decoded_token.get("user_id", actual_user_id)
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}, using default user ID")
            else:
                logger.warning("No user token available, using default user ID")

            # Make direct HTTP request to MCP server
            url = f"{mcp_client.base_url}/execute"
            payload = {
                "toolName": "clear_cart",
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
            logger.error(f"Error running clear_cart: {e}")
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
        ),
        StructuredTool.from_function(
            func=clear_cart,
            name="clear_cart",
            description="Clear user shopping cart",
            args_schema=ClearCartInput
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
        self.pending_actions: Dict[str, Dict[str, Any]] = {}
        self.conversation_context: Dict[str, Any] = {}
        self.pagination_context: Dict[str, Dict[str, Any]] = {}  # Track pagination state
        
        # Initialize helper modules
        logger.info("🔧 Initializing helper modules")
        # Initialize AI-powered intent detector with Azure config and MCP client
        self.intent_detector = IntentDetector(mcp_client, self.llm)
        self.parameter_validator = ParameterValidator(mcp_client)
        self.missing_param_handler = MissingParameterHandler(self.parameter_validator)
        self.product_resolver = ProductResolver(mcp_client)
        self.response_formatter = ResponseFormatter()
        
        logger.info("✅ EcommerceAgent initialization completed")
        
        # Customer-facing operation specifications
        self.customer_operation_specs: Dict[str, List[str]] = {
            # Products & Shopping
            "browse_products": ["category"],  # filters optional
            "search_product": ["keywords"],
            "view_product_details": ["product_id"],
            "add_to_cart": ["product_id", "quantity"],
            "clear_cart": ["customer_id"],
            "view_cart": ["customer_id"],
            "remove_from_cart": ["product_id"],
            # Orders
            "place_order": ["customer_id", "cart_items", "shipping_address", "payment_method"],
            "track_order": ["order_id"],
            "cancel_order": ["order_id"],
            "view_orders": ["customer_id"],
            # Payments
            "checkout": ["order_id", "payment_method"],
            "refund_request": ["order_id", "reason"],
            # Delivery & Returns
            "delivery_status": ["order_id"],
            "return_order": ["order_id", "reason"],
        }
        
    def set_user_token(self, token: str):
        """Set the user token for authentication"""
        self.user_token = token
        self.mcp_client.user_token = token

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

    async def _analyze_request_with_llm(self, user_input: str, conversation_context: str) -> Dict[str, Any]:
        """Use LLM to analyze user request and determine intent, requirements, and missing information"""
        try:
            # Construct analysis prompt
            analysis_prompt = f"""
            You are an intelligent e-commerce assistant. Analyze the following user request and conversation context to determine:
            1. The user's intent
            2. What parameters are required
            3. What information is missing
            4. Whether authentication is required
            5. Confidence level (0.0-1.0)

            User Request: "{user_input}"
            
            Conversation Context:
            {conversation_context}

            Available intents and their requirements:
            - get_products: Optional[page, limit, category, search, minPrice, maxPrice] - Returns paginated product list
            - search_products: Required[query], Optional[limit] - Returns paginated search results
            - get_product: Required[id] - Returns single product details
            - add_to_cart: Required[productId], Optional[quantity], Requires Auth
            - remove_from_cart: Required[productId], Requires Auth
            - update_cart_item: Required[productId, quantity], Requires Auth
            - get_cart: Requires Auth
            - get_orders: Requires Auth
            - create_order: Requires Auth
            - login: Required[email, password]
            - register: Required[email, password, name]
            - general_chat: No specific requirements

            SPECIAL NOTES FOR PRODUCT INTENTS:
            - For get_products and search_products: Always consider pagination parameters (page, limit)
            - Default limit should be 10 if not specified
            - These intents must return structured product data with pagination info
            - Response should include both user-friendly text AND structured product objects

            Respond in JSON format:
            {{
                "intent": "intent_name",
                "confidence": 0.9,
                "requires_auth": true/false,
                "required_parameters": ["param1", "param2"],
                "missing_info": ["missing_param1"],
                "extracted_parameters": {{"param": "value"}},
                "reasoning": "Brief explanation of the analysis",
                "expects_paginated_response": true/false,
                "response_type": "product_list|product_detail|cart_operation|auth|general"
            }}
            """

            # Use the LLM to analyze
            llm_response = await self.llm.ainvoke(analysis_prompt)
            
            # Parse JSON response
            import json
            try:
                analysis_result = json.loads(llm_response.content)
                logger.debug(f"LLM analysis result: {analysis_result}")
                return analysis_result
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM analysis JSON: {e}")
                # Fallback analysis
                return {
                    "intent": "general_chat",
                    "confidence": 0.5,
                    "requires_auth": False,
                    "required_parameters": [],
                    "missing_info": [],
                    "extracted_parameters": {},
                    "reasoning": "Failed to parse LLM response, defaulting to general chat"
                }
                
        except Exception as e:
            logger.error(f"LLM analysis failed: {e}")
            # Return safe fallback
            return {
                "intent": "general_chat",
                "confidence": 0.3,
                "requires_auth": False,
                "required_parameters": [],
                "missing_info": [],
                "extracted_parameters": {},
                "reasoning": f"Analysis failed: {str(e)}"
            }

    def _build_conversation_context(self, conversation_messages: List) -> str:
        """Build a readable conversation context from messages"""
        if not conversation_messages:
            return "No previous conversation."
            
        context_lines = []
        context_lines.append("Recent Conversation:")
        
        # Take last 10 messages to keep context manageable
        recent_messages = conversation_messages[-10:] if len(conversation_messages) > 10 else conversation_messages
        
        for msg in recent_messages:
            try:
                role = getattr(msg, 'role', msg.get('role', 'unknown')) if hasattr(msg, 'role') or isinstance(msg, dict) else 'unknown'
                content = getattr(msg, 'content', msg.get('content', str(msg))) if hasattr(msg, 'content') or isinstance(msg, dict) else str(msg)
                
                # Truncate very long messages
                if len(content) > 200:
                    content = content[:200] + "..."
                    
                context_lines.append(f"{role.capitalize()}: {content}")
                
            except Exception as e:
                logger.debug(f"Failed to process message in context: {e}")
                continue
        
        return "\n".join(context_lines)

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
            
            # Create structured tools for key functions
            self.tools = create_structured_tools(self.mcp_client)
            
            # Create the agent
            logger.info("🤖 Creating LangChain agent")
            await self._create_agent()
            logger.info("✅ LangChain agent created successfully")
            
            logger.info(f"🎉 Agent initialized successfully with {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize agent: {e}")
            raise

    async def inject_customer_action_prompt(self, user_input: str, customer_obj: Optional[Dict[str, Any]] = None) -> str:
        """Detect customer intent, gather info from profile/cart context, and return ONLY the injected prompt string."""
        customer_obj = customer_obj or {}
        operation = self._detect_customer_operation(user_input)
        if not operation:
            return "What would you like to do: browse, search, buy, pay, track, or return?"
        required = self.customer_operation_specs.get(operation, [])
        params_from_text = self._extract_customer_params_from_text(operation, user_input)
        params = self._fill_from_customer_object(params_from_text, customer_obj)
        missing = [f for f in required if f not in params or params.get(f) in (None, "", [], {})]
        if missing:
            return self._compose_missing_question(missing)
        return self._build_customer_action_prompt(operation, params)

    def _detect_customer_operation(self, user_input: str) -> Optional[str]:
        """Lightweight keyword-based detection for customer operations."""
        text = user_input.lower()
        # Products & Shopping
        if any(k in text for k in ["browse", "show ", "all products", "categories"]):
            return "browse_products"
        if any(k in text for k in ["search", "find", "looking for"]):
            return "search_product"
        if any(k in text for k in ["details", "view product", "show details", "specs"]):
            return "view_product_details"
        if any(k in text for k in ["add to cart", "buy", "purchase", "i want to buy", "add "]):
            return "add_to_cart"
        if any(k in text for k in ["clear cart", "empty cart", "remove all", "reset cart"]):
            return "clear_cart"
        if any(k in text for k in ["view cart", "my cart", "cart"]):
            return "view_cart"
        if any(k in text for k in ["remove from cart", "remove ", "delete from cart"]):
            return "remove_from_cart"
        # Orders
        if any(k in text for k in ["place order", "checkout my cart", "complete purchase", "buy now"]):
            return "place_order"
        if any(k in text for k in ["track order", "where is my order", "delivery status", "track "]):
            return "track_order"
        if "cancel" in text and "order" in text:
            return "cancel_order"
        if any(k in text for k in ["my orders", "view orders", "order history"]):
            return "view_orders"
        # Payments
        if any(k in text for k in ["checkout", "pay", "payment"]):
            return "checkout"
        if any(k in text for k in ["refund", "money back", "return my money"]):
            return "refund_request"
        # Delivery & Returns
        if any(k in text for k in ["delivery status", "where is my", "status of order"]):
            return "delivery_status"
        if any(k in text for k in ["return order", "return it", "send back"]):
            return "return_order"
        return None

    def _extract_customer_params_from_text(self, operation: str, user_input: str) -> Dict[str, Any]:
        """Heuristic extraction from free text for common fields."""
        import re, json as _json
        text = user_input
        out: Dict[str, Any] = {}
        # Product and order identifiers
        pid = re.search(r"product\s*(?:id)?\s*[:#]?\s*([\w-]+)", text, re.I)
        if pid:
            out["product_id"] = pid.group(1)
        oid = re.search(r"order\s*(?:id)?\s*[:#]?\s*([\w-]+)", text, re.I)
        if oid:
            out["order_id"] = oid.group(1)
        qty = re.search(r"(?:qty|quantity)\s*[:=]?\s*(\d+)", text, re.I)
        if qty:
            out["quantity"] = int(qty.group(1))
        # Keywords for search
        if operation == "search_product":
            # capture quotes or trailing words after 'search'
            m = re.search(r"search(?: for)?\s+([^\n]+)", text, re.I)
            if m:
                out["keywords"] = m.group(1).strip().strip(".!")
            quotes = re.findall(r"'([^']+)'|\"([^\"]+)\"", text)
            if quotes and "keywords" not in out:
                out["keywords"] = (quotes[0][0] or quotes[0][1])
        # Category for browsing
        if operation == "browse_products":
            m = re.search(r"(?:in|category|categories?)\s+([A-Za-z &/-]+)", text, re.I)
            if m:
                out["category"] = m.group(1).strip()
        # Reasons
        if any(k in operation for k in ["refund_request", "return_order"]):
            m = re.search(r"because\s+(.+)$", text, re.I)
            if m:
                out["reason"] = m.group(1).strip()
        return out

    def _fill_from_customer_object(self, params: Dict[str, Any], customer_obj: Dict[str, Any]) -> Dict[str, Any]:
        """Fill missing fields from customer profile/cart context."""
        filled = dict(params)
        def pick(keys: List[str]):
            for k in keys:
                if k in customer_obj and customer_obj[k]:
                    return customer_obj[k]
            return None
        if "customer_id" not in filled:
            cid = pick(["customer_id", "id", "user_id"])
            if cid is not None:
                filled["customer_id"] = cid
        if "shipping_address" not in filled:
            addr = pick(["shipping_address", "default_address", "address"])
            if addr is not None:
                filled["shipping_address"] = addr
        if "payment_method" not in filled:
            pm = pick(["payment_method", "default_payment", "card"])
            if pm is not None:
                filled["payment_method"] = pm
        if "cart_items" not in filled and "cart" in customer_obj and customer_obj.get("cart"):
            filled["cart_items"] = customer_obj["cart"]
        if "order_id" not in filled and customer_obj.get("last_order_id"):
            filled["order_id"] = customer_obj["last_order_id"]
        return filled

    def _compose_missing_question(self, missing_fields: List[str]) -> str:
        readable = [f.replace("_", " ") for f in missing_fields]
        if len(readable) == 1:
            return f"Could you share your {readable[0]} to proceed?"
        if len(readable) == 2:
            return f"Could you share your {readable[0]} and {readable[1]} to proceed?"
        return f"To help you faster, could you share: {', '.join(readable[:-1])}, and {readable[-1]}?"

    def _build_customer_action_prompt(self, operation: str, p: Dict[str, Any]) -> str:
        """Build the exact final prompt strings for customer operations."""
        if operation == "browse_products":
            filters = p.get("filters", {})
            return (
                f"Show me all {p.get('category','')} with filters: {json.dumps(filters)}" if filters else
                f"Show me all {p.get('category','')}"
            )
        if operation == "search_product":
            return f"Search products matching: {p.get('keywords','')}"
        if operation == "view_product_details":
            return f"Show details for product {p.get('product_id','')}"
        if operation == "add_to_cart":
            return f"Add {p.get('quantity',1)} of product {p.get('product_id','')} to the customer’s cart"
        if operation == "clear_cart":
            return f"Clear the cart for customer {p.get('customer_id','')}"
        if operation == "view_cart":
            return f"Show current cart for customer {p.get('customer_id','')}"
        if operation == "remove_from_cart":
            return f"Remove product {p.get('product_id','')} from the cart"
        if operation == "place_order":
            return (
                f"Place a new order for customer {p.get('customer_id','')} with items: {json.dumps(p.get('cart_items', []))}, "
                f"shipping to {p.get('shipping_address','')}, paid via {p.get('payment_method','')}"
            )
        if operation == "track_order":
            return f"Track order {p.get('order_id','')}"
        if operation == "cancel_order":
            return f"Cancel order {p.get('order_id','')}"
        if operation == "view_orders":
            return f"Show all orders for customer {p.get('customer_id','')}"
        if operation == "checkout":
            return f"Process checkout for order {p.get('order_id','')} using {p.get('payment_method','')}"
        if operation == "refund_request":
            return f"Request refund for order {p.get('order_id','')} because {p.get('reason','')}"
        if operation == "delivery_status":
            return f"Get delivery status for order {p.get('order_id','')}"
        if operation == "return_order":
            return f"Request return for order {p.get('order_id','')} because {p.get('reason','')}"
        return ""

    async def handle_user_request(self, user_input: str, user_token: Optional[str] = None, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Enhanced method using LLM to analyze requests with conversation context, handle pagination, and return structured data
        """
        logger.info(f"🎯 Processing user request: '{user_input}'")
        logger.debug(f"User token provided: {'Yes' if user_token else 'No'}")
        logger.debug(f"User ID provided: {user_id}")
        
        # Initialize response structure
        response_data = {
            "response": "",
            "success": False,
            "error": None,
            "data": None,
            "pagination": None,
            "requires_input": False
        }
        
        # Extract user_id from token if not provided
        if not user_id and user_token:
            try:
                user_id = extract_user_id_from_token(user_token)
                logger.debug(f"Extracted user_id from token: {user_id}")
            except Exception as e:
                logger.warning(f"Failed to extract user_id from token: {e}")
        
        try:
            # Step 1: Retrieve complete conversation history from database
            logger.info("💾 Step 1: Retrieving complete conversation history from database")
            conversation_messages = []
            conversation_data = None
            
            if user_id:
                try:
                    # Get comprehensive conversation history
                    conversation_data = await chat_service.get_conversation_history(user_id, limit=50)
                    conversation_messages = conversation_data.messages if hasattr(conversation_data, 'messages') else []
                    logger.info(f"✅ Retrieved {len(conversation_messages)} previous messages for user {user_id}")
                    
                    # Log conversation stats
                    if conversation_data:
                        total_messages = getattr(conversation_data, 'total_messages', len(conversation_messages))
                        logger.debug(f"Total conversation messages: {total_messages}")
                        
                except Exception as e:
                    logger.error(f"❌ Failed to retrieve conversation history: {e}")
                    response_data["error"] = f"Database error: {str(e)}"
                    return response_data
            else:
                logger.info("ℹ️ No user_id available, proceeding without conversation history")
            
            # Build comprehensive conversation context
            conversation_context = self._build_conversation_context(conversation_messages)
            logger.debug(f"Built conversation context with {len(conversation_context)} characters")
            
            # Step 2: Advanced LLM analysis with error handling
            logger.info("🤖 Step 2: Using LLM to analyze request and determine requirements")
            try:
                llm_analysis  = self.intent_detector.detect_intent(user_input)
                logger.info(f"✅ Intent detected: {llm_analysis}")
            except Exception as e:
                logger.error(f"❌ LLM analysis failed: {e}")
                response_data.update({
                    "response": "I'm having trouble understanding your request. Could you please rephrase it?",
                    "error": f"LLM analysis error: {str(e)}"
                })
                return response_data
            
            # Step 3: Authentication validation with detailed logging
            logger.info("🔐 Step 3: Checking authentication requirements")
            requires_auth = bool(getattr(llm_analysis, 'requires_auth', False))
            
            if requires_auth and not user_token:
                intent_name = getattr(llm_analysis, 'tool_name', 'unknown')
                logger.warning(f"❌ Authentication required for '{intent_name}' but no token provided")
                response_data.update({
                    "response": "You need to be logged in to perform this action. Please login first with your email and password.",
                    "error": "Authentication required",
                    "requires_input": True
                })
                return response_data
            elif requires_auth:
                logger.info("✅ Authentication check passed")
            else:
                logger.info("ℹ️ No authentication required for this request")
            
            # Step 4: Handle missing information with user interaction
            logger.info("📋 Step 4: Checking for missing information and parameters")
            # IntentResult has no extracted values; default to no missing params here
            missing_info: List[str] = []
            
            if missing_info:
                logger.info(f"❌ Missing information detected: {missing_info}")
                
                # Save user message first
                if user_id:
                    try:
                        await self._save_user_message(user_id, user_input)
                    except Exception as e:
                        logger.warning(f"Failed to save user message: {e}")
                
                # Generate clarification question
                try:
                    question = await self._generate_clarification_question(
                        user_input, 
                        missing_info,
                        conversation_context,
                        getattr(llm_analysis, 'tool_name', 'unknown')
                    )
                    
                    # Save assistant question
                    if user_id and question:
                        try:
                            await self._save_assistant_message(user_id, question)
                        except Exception as e:
                            logger.warning(f"Failed to save assistant question: {e}")
                    
                    response_data.update({
                        "response": question,
                        "success": True,
                        "requires_input": True,
                        "data": {
                            "missing_parameters": missing_info,
                            "intent": getattr(llm_analysis, 'tool_name', None),
                            "context": "clarification_needed"
                        }
                    })
                    return response_data
                    
                except Exception as e:
                    logger.error(f"❌ Failed to generate clarification question: {e}")
                    response_data.update({
                        "response": f"I need more information about: {', '.join(missing_info)}. Could you please provide these details?",
                        "error": f"Question generation error: {str(e)}",
                        "requires_input": True
                    })
                    return response_data
            
            # Step 5: Execute request with comprehensive data retrieval and pagination
            logger.info("✅ Step 5: All information available, executing request with data retrieval")
            
            try:
                # Determine if this is a data retrieval request that needs pagination
                intent = getattr(llm_analysis, 'tool_name', 'unknown')
                is_data_request = intent in ['get_products', 'search_products', 'get_orders', 'get_cart']
                
                if is_data_request:
                    logger.info(f"📊 Executing data retrieval request: {intent}")
                    result = await self._execute_data_request(
                        user_input, 
                        conversation_messages, 
                        user_token, 
                        user_id,
                        {"intent": intent}
                    )
                else:
                    logger.info(f"⚡ Executing action request: {intent}")
                    result = await self._execute_action_request(
                        user_input, 
                        conversation_messages, 
                        user_token, 
                        user_id,
                        {"intent": intent}
                    )
                
                # Process and structure the result
                if isinstance(result, dict):
                    response_data.update({
                        "response": result.get('response', 'Request processed successfully'),
                        "success": result.get('success', True),
                        "error": result.get('error'),
                        "data": result.get('data'),
                        "pagination": result.get('pagination')
                    })
                else:
                    response_data.update({
                        "response": str(result),
                        "success": True
                    })
                
                # Save conversation messages
                if user_id:
                    try:
                        await self._save_conversation_messages(
                            user_id, 
                            user_input, 
                            response_data["response"]
                        )
                    except Exception as e:
                        logger.warning(f"Failed to save conversation: {e}")
                
                logger.info("✅ Request processed successfully")
                return response_data
                
            except Exception as e:
                logger.error(f"❌ Request execution failed: {e}")
                response_data.update({
                    "response": "I encountered an error while processing your request. Please try again or contact support if the issue persists.",
                    "error": f"Execution error: {str(e)}"
                })
                return response_data
                
        except Exception as e:
            logger.error(f"❌ Unexpected error in handle_user_request: {e}")
            response_data.update({
                "response": "I apologize, but I encountered an unexpected error. Please try again later.",
                "error": f"System error: {str(e)}"
            })
            return response_data

    async def _execute_data_request(self, user_input: str, conversation_messages: List, 
                                  user_token: str, user_id: str, llm_analysis: Dict) -> Dict[str, Any]:
        """Execute data retrieval requests with pagination support"""
        try:
            intent = llm_analysis.get('intent', 'unknown') if isinstance(llm_analysis, dict) else getattr(llm_analysis, 'tool_name', 'unknown')
            logger.info(f"📊 Executing data request: {intent}")
            
            # Check if agent is properly initialized
            if not self.agent_executor:
                logger.error("❌ Agent executor not initialized - calling initialize()")
                await self.initialize()
            
            # Extract pagination parameters from conversation context
            pagination_context = self._extract_pagination_context(conversation_messages)
            
            # Convert conversation to chat history format
            chat_history = self._convert_messages_to_chat_history(conversation_messages)
            
            # Execute the chat method to get data
            chat_result = await self.chat(user_input, chat_history, user_token)
            
            if not chat_result.get('success', True):
                return {
                    "response": chat_result.get('response', 'Data retrieval failed'),
                    "success": False,
                    "error": chat_result.get('error')
                }
            
            # Process response for pagination
            response_text = chat_result.get('response', '')
            json_data = chat_result.get('data')
            
            # Extract pagination info if available
            pagination_info = None
            if json_data and isinstance(json_data, dict):
                if 'pagination' in json_data:
                    pagination_info = json_data['pagination']
                elif any(key in json_data for key in ['page', 'total_pages', 'total_items', 'has_more']):
                    pagination_info = {
                        'current_page': json_data.get('page', 1),
                        'total_pages': json_data.get('total_pages'),
                        'total_items': json_data.get('total_items'),
                        'has_more': json_data.get('has_more', False),
                        'items_per_page': json_data.get('limit', json_data.get('per_page', 10))
                    }
            
            return {
                "response": response_text,
                "success": True,
                "data": json_data,
                "pagination": pagination_info,
                "context": {
                    "intent": intent,
                    "data_type": self._get_data_type_from_intent(intent)
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Data request execution failed: {e}")
            return {
                "response": "Failed to retrieve data. Please try again.",
                "success": False,
                "error": str(e)
            }

    async def _execute_action_request(self, user_input: str, conversation_messages: List,
                                    user_token: str, user_id: str, llm_analysis: Dict) -> Dict[str, Any]:
        """Execute action requests (non-data retrieval)"""
        try:
            intent = llm_analysis.get('intent', 'unknown') if isinstance(llm_analysis, dict) else getattr(llm_analysis, 'tool_name', 'unknown')
            logger.info(f"⚡ Executing action request: {intent}")
            
            # Check if agent is properly initialized
            if not self.agent_executor:
                logger.error("❌ Agent executor not initialized - calling initialize()")
                await self.initialize()
            
            # Convert conversation to chat history format
            chat_history = self._convert_messages_to_chat_history(conversation_messages)
            
            # Execute the chat method
            result = await self.chat(user_input, chat_history, user_token)
            
            return {
                "response": result.get('response', 'Action completed'),
                "success": result.get('success', True),
                "error": result.get('error'),
                "data": result.get('data'),
                "context": {
                    "intent": intent,
                    "action_type": "modification"
                }
            }
            
        except Exception as e:
            logger.error(f"❌ Action request execution failed: {e}")
            return {
                "response": "Failed to execute action. Please try again.",
                "success": False,
                "error": str(e)
            }

    def _extract_pagination_context(self, conversation_messages: List) -> Dict[str, Any]:
        """Extract pagination context from conversation history"""
        pagination_context = {
            "last_page": 1,
            "last_limit": 10,
            "last_query": None,
            "last_action": None
        }
        
        try:
            # Look through recent messages for pagination info
            for msg in reversed(conversation_messages[-10:]):  # Last 10 messages
                content = getattr(msg, 'content', '') if hasattr(msg, 'content') else msg.get('content', '')
                
                # Look for JSON data in assistant messages
                if getattr(msg, 'role', '') == 'assistant' or msg.get('role') == 'assistant':
                    if 'page' in content.lower() and ('products' in content.lower() or 'items' in content.lower()):
                        # Try to extract page info from the message
                        import re
                        page_match = re.search(r'"page":\s*(\d+)', content)
                        limit_match = re.search(r'"limit":\s*(\d+)', content)
                        
                        if page_match:
                            pagination_context["last_page"] = int(page_match.group(1))
                        if limit_match:
                            pagination_context["last_limit"] = int(limit_match.group(1))
                        
                        break
                        
        except Exception as e:
            logger.debug(f"Failed to extract pagination context: {e}")
        
        return pagination_context

    def _convert_messages_to_chat_history(self, conversation_messages: List) -> List[Dict[str, str]]:
        """Convert conversation messages to chat history format"""
        chat_history = []
        
        for msg in conversation_messages:
            try:
                if hasattr(msg, 'role') and hasattr(msg, 'content'):
                    chat_history.append({
                        "role": msg.role,
                        "content": msg.content
                    })
                elif isinstance(msg, dict):
                    role = msg.get('role', '')
                    content = msg.get('content', msg.get('message', ''))
                    if role and content:
                        chat_history.append({
                            "role": role,
                            "content": content
                        })
            except Exception as e:
                logger.debug(f"Failed to convert message: {e}")
                continue
        
        return chat_history

    def _get_data_type_from_intent(self, intent: str) -> str:
        """Get data type based on intent"""
        data_type_mapping = {
            'get_products': 'products',
            'search_products': 'products', 
            'get_cart': 'cart',
            'get_orders': 'orders',
            'get_categories': 'categories'
        }
        return data_type_mapping.get(intent, 'data')

    async def _save_user_message(self, user_id: str, content: str):
        """Save user message to conversation"""
        user_message = Message(
            role="user",
            content=content,
            timestamp=time.time()
        )
        await conversation_repo.add_message(user_id, user_message)
        logger.debug(f"Saved user message to conversation for user {user_id}")

    async def _save_assistant_message(self, user_id: str, content: str):
        """Save assistant message to conversation"""
        assistant_message = Message(
            role="assistant",
            content=content,
            timestamp=time.time()
        )
        await conversation_repo.add_message(user_id, assistant_message)
        logger.debug(f"Saved assistant message to conversation for user {user_id}")

    async def _save_conversation_messages(self, user_id: str, user_input: str, assistant_response: str):
        """Save both user and assistant messages to conversation"""
        try:
            await self._save_user_message(user_id, user_input)
            await self._save_assistant_message(user_id, assistant_response)
        except Exception as e:
            logger.warning(f"Failed to save conversation messages: {e}")
            raise

    async def _generate_clarification_question(self, user_input: str, missing_info: List[str], 
                                             conversation_context: str, intent: str) -> str:
        """Generate a natural clarification question for missing information"""
        try:
            clarification_prompt = f"""
            Generate a helpful, natural clarification question to ask the user for missing information.
            
            User's original request: "{user_input}"
            Detected intent: {intent}
            Missing information: {missing_info}
            
            Conversation context:
            {conversation_context}
            
            Create a friendly, specific question that asks for the missing information in a natural way.
            Be conversational and helpful, not robotic.
            
            Examples:
            - If missing "query" for search: "What products are you looking for? Please describe what you'd like to find."
            - If missing "productId" for cart: "Which product would you like to add to your cart? You can provide the product name or ID."
            - If missing "quantity": "How many would you like to add to your cart?"
            
            Respond with just the question, no extra formatting or quotes.
            """
            
            llm_response = await self.llm.ainvoke(clarification_prompt)
            question = llm_response.content.strip()
            
            # Clean up the response
            question = question.strip('"').strip("'")
            if not question.endswith(('?', '.', '!')):
                question += "?"
                
            return question
            
        except Exception as e:
            logger.error(f"Failed to generate clarification question: {e}")
            # Fallback question
            return f"I need more information about: {', '.join(missing_info)}. Could you please provide these details?"
    
    async def _create_agent(self):
        """Create the LangChain agent with tools"""
        try:
            logger.info("🔧 Creating LangChain agent with tools")
            
            # Create the system prompt for the agent
            system_prompt = """You are an AI assistant for an e-commerce platform. You can help users with various e-commerce operations.

CORE PRINCIPLES FOR ALL ACTIONS:

1. **Data Presentation**: For ALL read operations (getting, searching, viewing, listing data), always present the data in clean JSON format wrapped in ```json``` code blocks. The tools return structured JSON data - present this data clearly and concisely in the JSON format. Format your response as: "Here's the data you requested:" followed by the JSON block.

2. **Parameter Handling**: For ALL actions that require parameters:
   - If required parameters are missing, ask the user for them clearly and wait for their response    - Extract available information from the user's message first
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


            # Create the prompt template
            prompt = ChatPromptTemplate.from_messages([
                ("system", system_prompt),
                MessagesPlaceholder(variable_name="chat_history"),
                ("human", "{input}"),
                MessagesPlaceholder(variable_name="agent_scratchpad")
            ])

            # Create the OpenAI tools agent
            agent = create_openai_tools_agent(
                llm=self.llm,
                tools=self.tools,
                prompt=prompt
            )

            # Create the agent executor
            self.agent_executor = AgentExecutor(
                agent=agent,
                tools=self.tools,
                verbose=True,
                return_intermediate_steps=True,
                max_iterations=10,
                max_execution_time=60
            )

            logger.info(f"✅ Agent created with {len(self.tools)} tools")

        except Exception as e:
            logger.error(f"Failed to create agent: {e}")
            raise

    async def chat(self, user_input: str, chat_history: List[Dict[str, str]] = None, user_token: str = None) -> Dict[str, Any]:
        """
        Process user input using the LangChain agent and return structured response
        """
        try:
            logger.info(f"💬 Processing chat request: '{user_input[:100]}...'")
            
            # Check if agent is properly initialized
            if not self.agent_executor:
                logger.error("❌ Agent executor not initialized - attempting to initialize")
                await self.initialize()
                
                # If still not initialized after attempt, return error
                if not self.agent_executor:
                    return {
                        "response": "I'm currently unavailable. Please try again in a moment.",
                        "success": False,
                        "error": "Agent executor not initialized",
                        "data": None
                    }
            
            # Set user token for MCP client
            if user_token:
                self.mcp_client.user_token = user_token
                logger.debug("Set user token on MCP client")

            # Convert chat history to LangChain format
            langchain_history = []
            if chat_history:
                for msg in chat_history:
                    role = msg.get('role', '')
                    content = msg.get('content', '')
                    if role == 'user':
                        langchain_history.append(HumanMessage(content=content))
                    elif role == 'assistant':
                        langchain_history.append(AIMessage(content=content))

            # Execute the agent
            logger.debug("🤖 Executing LangChain agent")
            result = await self.agent_executor.ainvoke({
                "input": user_input,
                "chat_history": langchain_history
            })

            # Process the result
            response_text = result.get('output', 'No response generated')
            
            # Try to extract structured data from the response
            structured_data = None
            pagination_data = None
            
            try:
                # Look for JSON in the response - handle both single objects and arrays
                import json
                import re
                
                # Look for JSON objects in the response
                json_matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
                
                for json_str in json_matches:
                    try:
                        parsed_json = json.loads(json_str)
                        
                        # Prefer the unified schema: items + pagination
                        if 'items' in parsed_json and 'pagination' in parsed_json:
                            structured_data = parsed_json
                            pagination_data = parsed_json.get('pagination')
                            break
                        # Back-compat: products list shape
                        if 'products' in parsed_json:
                            items = parsed_json.get('products', [])
                            pg = parsed_json.get('pagination') or {
                                'page': parsed_json.get('page', 1),
                                'limit': parsed_json.get('limit', 10),
                                'total': parsed_json.get('total', len(items)),
                                'totalPages': parsed_json.get('total_pages') or parsed_json.get('totalPages'),
                                'hasMore': parsed_json.get('has_more', False)
                            }
                            structured_data = {'items': items, 'pagination': pg}
                            pagination_data = pg
                            break
                        # Single item detail
                        if '_id' in parsed_json and isinstance(parsed_json, dict):
                            structured_data = parsed_json
                            break
                            
                    except json.JSONDecodeError:
                        continue
                        
            except Exception as e:
                logger.debug(f"No structured data found in response: {e}")

            # Enhance response for product queries
            response_data = {
                "response": response_text,
                "success": True,
                "data": structured_data,
                "pagination": pagination_data,
                "intermediate_steps": result.get('intermediate_steps', [])
            }

            # Add metadata for frontend consumption
            if structured_data:
                if 'products' in structured_data:
                    response_data['type'] = 'product_list'
                    response_data['count'] = len(structured_data['products'])
                elif 'product' in structured_data:
                    response_data['type'] = 'product_detail'
                    response_data['count'] = 1
                else:
                    response_data['type'] = 'structured_data'
            else:
                response_data['type'] = 'text_only'

            logger.info("✅ Chat request processed successfully")
            logger.info(f"Response data: {response_data}")
            return response_data

        except Exception as e:
            logger.error(f"❌ Chat processing failed: {e}")
            return {
                "response": f"I encountered an error processing your request: {str(e)}",
                "success": False,
                "error": str(e),
                "data": None
            }
