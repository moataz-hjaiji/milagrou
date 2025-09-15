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
from prompt_registry import PromptRegistry

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

# New: Order-related input models
class GetOrdersInput(BaseModel):
    page: Optional[int] = None
    limit: Optional[int] = None
    status: Optional[str] = None

class GetOrderInput(BaseModel):
    id: str

class CreateOrderInput(BaseModel):
    # Required
    orderType: str  # Allowed: GIFT | RESERVATION | NORMAL
    InvoicePaymentMethods: List[int]
    deliveryType: str  # Allowed: DELIVERY | PICKUP
    # Optional/conditional
    userId: Optional[str] = None
    addressId: Optional[str] = None
    firstName: Optional[str] = None
    lastName: Optional[str] = None
    phoneNumber: Optional[str] = None
    email: Optional[str] = None
    note: Optional[str] = None
    giftMsg: Optional[str] = None
    code: Optional[str] = None
    reservationDate: Optional[str] = None  # ISO string
    browserId: Optional[str] = None

class CancelOrderInput(BaseModel):
    id: str

class TrackOrderInput(BaseModel):
    id: str

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
                if self.name in ["get_products", "get_product", "search_products", "get_categories", 
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
            actual_user_id = "youremail.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("user_id", "youremail.com")
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
            actual_user_id = "youremail.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    # Decode the JWT token to get user information
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("user_id", "youremail.com")
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
            actual_user_id = "youremail.com"  # Default fallback
            if mcp_client.user_token:
                try:
                    import jwt
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("user_id", "youremail.com")
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

    # New: Order tools implementations
    def get_orders(page: Optional[int] = None, limit: Optional[int] = None, status: Optional[str] = None) -> str:
        """Get user's orders (requires auth)."""
        try:
            # Extract user email from JWT token
            actual_user_id = None
            if mcp_client.user_token:
                try:
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("user_id")
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}")
            
            args: Dict[str, Any] = {}
            if page is not None:
                args["page"] = page
            if limit is not None:
                args["limit"] = limit
            if status:
                args["status"] = status
            if actual_user_id:
                args["userId"] = actual_user_id
            
            url = f"{mcp_client.base_url}/execute"
            payload = {"toolName": "get_orders", "args": args}
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            if "error" in result:
                return json.dumps({"success": False, "message": f"HTTP request failed: {result['error']}", "error": result['error']}, indent=2)
            
            mcp_result = result.get("result", {})
            success = mcp_result.get("statusCode") == 200 if "statusCode" in mcp_result else True
            if success:
                structured_response = ResponseMapper.map_tool_response("get_orders", mcp_result)
                return json.dumps(structured_response.dict(), indent=2)
            return json.dumps(mcp_result, indent=2)
        except Exception as e:
            logger.error(f"Error running get_orders: {e}")
            return json.dumps({"success": False, "error": str(e)}, indent=2)

    def get_order(id: str) -> str:
        """Get single order by ID (requires auth)."""
        try:
            args: Dict[str, Any] = {"id": id}
            if mcp_client.user_token:
                try:
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("user_id")
                    if actual_user_id:
                        args["userId"] = actual_user_id
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}")
            
            url = f"{mcp_client.base_url}/execute"
            payload = {"toolName": "get_order", "args": args}
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            result = make_sync_http_request(url, "POST", payload, headers)
            if "error" in result:
                return json.dumps({"success": False, "message": f"HTTP request failed: {result['error']}", "error": result['error']}, indent=2)
            mcp_result = result.get("result", {})
            success = mcp_result.get("statusCode") == 200 if "statusCode" in mcp_result else True
            if success:
                structured_response = ResponseMapper.map_tool_response("get_order", mcp_result)
                return json.dumps(structured_response.dict(), indent=2)
            return json.dumps(mcp_result, indent=2)
        except Exception as e:
            logger.error(f"Error running get_order: {e}")
            return json.dumps({"success": False, "error": str(e)}, indent=2)

    def create_order(orderType: str, InvoicePaymentMethods: List[int], deliveryType: str, userId: Optional[str] = None,
                     addressId: Optional[str] = None, firstName: Optional[str] = None, lastName: Optional[str] = None,
                     phoneNumber: Optional[str] = None, email: Optional[str] = None, note: Optional[str] = None,
                     giftMsg: Optional[str] = None, code: Optional[str] = None, reservationDate: Optional[str] = None,
                     browserId: Optional[str] = None) -> str:
        """Create a new order from the user's cart.
        Required: orderType (GIFT|RESERVATION|NORMAL), InvoicePaymentMethods (array of numbers), deliveryType (DELIVERY|PICKUP).
        If deliveryType is DELIVERY, addressId is required. If orderType is RESERVATION, reservationDate is required."""
        try:
            # Determine userId from token if not provided
            actual_user_id = userId
            if not actual_user_id and mcp_client.user_token:
                try:
                    decoded_token = jwt.decode(mcp_client.user_token, options={"verify_signature": False})
                    actual_user_id = decoded_token.get("user_id")
                except Exception as e:
                    logger.warning(f"Could not decode JWT token: {e}")
            
            args: Dict[str, Any] = {
                "orderType": orderType,
                "InvoicePaymentMethods": InvoicePaymentMethods,
                "deliveryType": deliveryType,
            }
            if actual_user_id:
                args["userId"] = actual_user_id
            # Optional fields
            if addressId is not None:
                args["addressId"] = addressId
            if firstName is not None:
                args["firstName"] = firstName
            if lastName is not None:
                args["lastName"] = lastName
            if phoneNumber is not None:
                args["phoneNumber"] = phoneNumber
            if email is not None:
                args["email"] = email
            if note is not None:
                args["note"] = note
            if giftMsg is not None:
                args["giftMsg"] = giftMsg
            if code is not None:
                args["code"] = code
            if reservationDate is not None:
                args["reservationDate"] = reservationDate
            if browserId is not None:
                args["browserId"] = browserId
            
            url = f"{mcp_client.base_url}/execute"
            payload = {"toolName": "create_order", "args": args}
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            
            result = make_sync_http_request(url, "POST", payload, headers)
            if "error" in result:
                return json.dumps({"success": False, "message": f"HTTP request failed: {result['error']}", "error": result['error']}, indent=2)
            mcp_result = result.get("result", {})
            success = mcp_result.get("statusCode") == 200 if "statusCode" in mcp_result else True
            if success:
                return json.dumps(mcp_result, indent=2)
            return json.dumps(mcp_result, indent=2)
        except Exception as e:
            logger.error(f"Error running create_order: {e}")
            return json.dumps({"success": False, "error": str(e)}, indent=2)

    def cancel_order(id: str) -> str:
        """Cancel an order by ID (requires auth)."""
        try:
            url = f"{mcp_client.base_url}/execute"
            payload = {"toolName": "cancel_order", "args": {"id": id}}
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            result = make_sync_http_request(url, "POST", payload, headers)
            if "error" in result:
                return json.dumps({"success": False, "message": f"HTTP request failed: {result['error']}", "error": result['error']}, indent=2)
            mcp_result = result.get("result", {})
            return json.dumps(mcp_result, indent=2)
        except Exception as e:
            logger.error(f"Error running cancel_order: {e}")
            return json.dumps({"success": False, "error": str(e)}, indent=2)

    def track_order(id: str) -> str:
        """Track order status by ID (requires auth)."""
        try:
            url = f"{mcp_client.base_url}/execute"
            payload = {"toolName": "track_order", "args": {"id": id}}
            headers = {"Content-Type": "application/json"}
            if mcp_client.user_token:
                headers["Authorization"] = f"Bearer {mcp_client.user_token}"
            result = make_sync_http_request(url, "POST", payload, headers)
            if "error" in result:
                return json.dumps({"success": False, "message": f"HTTP request failed: {result['error']}", "error": result['error']}, indent=2)
            mcp_result = result.get("result", {})
            return json.dumps(mcp_result, indent=2)
        except Exception as e:
            logger.error(f"Error running track_order: {e}")
            return json.dumps({"success": False, "error": str(e)}, indent=2)
    
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
        # New: order tools
        StructuredTool.from_function(
            func=get_orders,
            name="get_orders",
            description="Get user's orders (requires auth). Optional: page, limit, status",
            args_schema=GetOrdersInput
        ),
        StructuredTool.from_function(
            func=get_order,
            name="get_order",
            description="Get a single order by ID (requires auth)",
            args_schema=GetOrderInput
        ),
        StructuredTool.from_function(
            func=create_order,
            name="create_order",
            description="Create a new order. Required: orderType (GIFT|RESERVATION|NORMAL), InvoicePaymentMethods (array of numbers), deliveryType (DELIVERY|PICKUP). If deliveryType=DELIVERY then addressId is required.",
            args_schema=CreateOrderInput
        ),
        StructuredTool.from_function(
            func=cancel_order,
            name="cancel_order",
            description="Cancel an order by ID (requires auth)",
            args_schema=CancelOrderInput
        ),
        StructuredTool.from_function(
            func=track_order,
            name="track_order",
            description="Track an order by ID (requires auth)",
            args_schema=TrackOrderInput
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
        self.prompt_registry = PromptRegistry()
        self.parameter_validator = ParameterValidator(mcp_client, self.prompt_registry)
        self.missing_param_handler = MissingParameterHandler(self.parameter_validator)
        self.product_resolver = ProductResolver(mcp_client)
        self.response_formatter = ResponseFormatter()
        
        logger.info("✅ EcommerceAgent initialization completed")
        
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
                llm_analysis = await self._analyze_request_with_llm(user_input, conversation_context)
                logger.info(f"✅ LLM Analysis completed: Intent={llm_analysis.get('intent')}, Confidence={llm_analysis.get('confidence')}")
            except Exception as e:
                logger.error(f"❌ LLM analysis failed: {e}")
                response_data.update({
                    "response": "I'm having trouble understanding your request. Could you please rephrase it?",
                    "error": f"LLM analysis error: {str(e)}"
                })
                return response_data
            
            # Step 3: Authentication validation with detailed logging
            logger.info("🔐 Step 3: Checking authentication requirements")
            requires_auth = llm_analysis.get('requires_auth', False)
            
            if requires_auth and not user_token:
                logger.warning(f"❌ Authentication required for '{llm_analysis.get('intent')}' but no token provided")
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
            missing_info = llm_analysis.get('missing_info', [])
            
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
                        llm_analysis.get('intent', 'unknown')
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
                            "intent": llm_analysis.get('intent'),
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
                intent = llm_analysis.get('intent', 'unknown')
                is_data_request = intent in ['get_products', 'search_products', 'get_orders', 'get_cart']
                
                if is_data_request:
                    logger.info(f"📊 Executing data retrieval request: {intent}")
                    result = await self._execute_data_request(
                        user_input, 
                        conversation_messages, 
                        user_token, 
                        user_id,
                        llm_analysis
                    )
                else:
                    logger.info(f"⚡ Executing action request: {intent}")
                    result = await self._execute_action_request(
                        user_input, 
                        conversation_messages, 
                        user_token, 
                        user_id,
                        llm_analysis
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
            intent = llm_analysis.get('intent', 'unknown')
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
            intent = llm_analysis.get('intent', 'unknown')
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
            system_prompt = """You are a helpful e-commerce assistant that can help users:
            
            1. Browse and search products
            2. Get detailed product information
            3. Manage shopping cart (add, remove, update items)
            4. View cart contents
            5. Place and manage orders (create orders, view orders, cancel, track)
            6. Provide general assistance
            
            IMPORTANT PRODUCT RESPONSE REQUIREMENTS:
            - When users ask for products, ALWAYS use the appropriate tools to search or get product information
            - For product queries (browsing, searching, or listing products), your response MUST include:
              1. A clear, user-friendly description of the products found
              2. The complete product data in a structured format within your response
              3. Pagination information (current page, total pages, items per page) when applicable
              4. Clear indication of how many products were found and displayed
            
            - When displaying product lists, structure your response like this:
              "I found X products for you. Here are the results (page Y of Z):
              
              [User-friendly product descriptions]
              
              Product Data:
              {{\"products\": [...], \"pagination\": {{\"page\": 1, \"limit\": 10, \"total\": X, \"totalPages\": Y}}}}"
            
            - For single product details, include the complete product object in your response
            - Always mention pagination details when showing product lists
            - If no products are found, clearly state this and suggest alternatives
            
            CART AND AUTH REQUIREMENTS:
            - When users want to manage their cart, use the cart-related tools
            - If you need user authentication for cart operations, let them know they need to log in first
            - Always be helpful, friendly, and provide clear information
            
            ORDER OPERATIONS:
            - To place an order, call the create_order tool. It requires: orderType (GIFT|RESERVATION|NORMAL), InvoicePaymentMethods (array of numbers), and deliveryType (DELIVERY|PICKUP).
            - If deliveryType is DELIVERY, an addressId is required. If orderType is RESERVATION, reservationDate is required.
            - If any required info is missing, ask the user for it and list allowed values for enums.
            - For viewing or tracking orders, use get_orders, get_order, or track_order. To cancel, use cancel_order.
            
            Use the available tools to fulfill user requests and provide accurate, up-to-date information.
            Ensure that product- and order-related responses contain the actual data for frontend consumption when applicable."""

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
                
                # Look for product data patterns in the response
                json_matches = re.findall(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
                
                for json_str in json_matches:
                    try:
                        parsed_json = json.loads(json_str)
                        
                        # Check if this contains product data
                        if 'products' in parsed_json or 'product' in parsed_json:
                            structured_data = parsed_json
                            
                            # Extract pagination info if present
                            if 'pagination' in parsed_json:
                                pagination_data = parsed_json['pagination']
                            break
                            
                        # Check if this is a single product
                        elif '_id' in parsed_json and 'name' in parsed_json:
                            structured_data = {'product': parsed_json}
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
            return response_data

        except Exception as e:
            logger.error(f"❌ Chat processing failed: {e}")
            return {
                "response": f"I encountered an error processing your request: {str(e)}",
                "success": False,
                "error": str(e),
                "data": None
            }
    
    # --- Utility methods used by the API and tests ---
    async def get_available_tools(self) -> List[Dict[str, Any]]:
        """Return available MCP tools with schema."""
        try:
            tools = self.mcp_client.get_tools() or []
            result = []
            for t in tools:
                # Support both dataclass MCPTool and dict
                if isinstance(t, dict):
                    result.append({
                        "name": t.get("name"),
                        "description": t.get("description"),
                        "input_schema": t.get("input_schema") or t.get("inputSchema") or {}
                    })
                else:
                    result.append({
                        "name": getattr(t, "name", None),
                        "description": getattr(t, "description", None),
                        "input_schema": getattr(t, "input_schema", {})
                    })
            return result
        except Exception as e:
            logger.error(f"Failed to get available tools: {e}")
            return []

    async def call_tool_directly(self, tool_name: str, arguments: Dict[str, Any]) -> str:
        """Call an MCP tool directly and return JSON string result."""
        try:
            # Ensure MCP client is ready
            if not self.mcp_client.session:
                await self.mcp_client.start()
            # Execute tool with current user token if set
            token = getattr(self, "user_token", None) or self.mcp_client.user_token
            resp = await self.mcp_client.execute_tool(tool_name, arguments, user_token=token)
            if resp.success:
                try:
                    return json.dumps(resp.data, indent=2)
                except Exception:
                    return json.dumps({"result": resp.data}, indent=2)
            return json.dumps({"success": False, "error": resp.error or "Unknown error"}, indent=2)
        except Exception as e:
            logger.error(f"Direct tool call failed for {tool_name}: {e}")
            return json.dumps({"success": False, "error": str(e)}, indent=2)

    async def shutdown(self):
        """Cleanly shutdown resources (MCP client)."""
        try:
            await self.mcp_client.stop()
        except Exception as e:
            logger.warning(f"Error during shutdown: {e}")
