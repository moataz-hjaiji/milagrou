import asyncio
import json
import logging
import os
from typing import Dict, Any, List, Optional
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import BaseTool, StructuredTool
from langchain_core.tools import tool
from pydantic.v1 import BaseModel, Field
from langchain_openai import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage

from http_mcp_client import HTTPMCPClient, MCPTool, MCPResponse
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
    
    def _run(self, **kwargs) -> str:
        """Synchronous run method"""
        return asyncio.run(self._arun(**kwargs))
    
    async def _arun(self, *args, **kwargs) -> str:
        """Asynchronous run method"""
        try:
            filtered_kwargs = {}
            required_params = self.mcp_tool.input_schema.get("required", [])
            properties = self.mcp_tool.input_schema.get("properties", {})
            
            for key, value in kwargs.items():
                if key in properties:
                    filtered_kwargs[key] = value
            
            # Add required parameters if missing
            for param in required_params:
                if param not in filtered_kwargs:
                    filtered_kwargs[param] = kwargs.get(param, "")
            
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
                error_response = create_response(
                    ResponseType.ERROR,
                    success=False,
                    message=f"Tool execution failed: {response.error}",
                    error=response.error
                )
                return json.dumps(error_response.dict(), indent=2)
                
        except Exception as e:
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
        self.mcp_client = mcp_client
        # Create Azure OpenAI client with explicit parameters
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
        
    def set_user_token(self, token: str):
        """Set the user token for authentication"""
        self.user_token = token
        self.mcp_client.user_token = token
        
    async def initialize(self):
        """Initialize the agent with MCP tools"""
        try:
            # Start MCP client
            await self.mcp_client.start()
            
            # Create structured tools for key functions
            self.tools = create_structured_tools(self.mcp_client)
            
            # Create the agent
            await self._create_agent()
            
            logger.info(f"Agent initialized with {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}")
            raise
    
    async def _create_agent(self):
        """Create the LangChain agent"""
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
            max_iterations=5
        )
    

    async def chat(self, message: str, chat_history: List[Dict[str, str]] = None, user_token: Optional[str] = None) -> Dict[str, Any]:
        """Process a chat message with optional user authentication"""
        try:
            if not self.agent_executor:
                raise RuntimeError("Agent not initialized")
            
            # Set the user token for the MCP client if provided
            if user_token:
                self.set_user_token(user_token)
            
            
            # Convert chat history to LangChain messages
            messages = []
            if chat_history:
                for msg in chat_history:
                    # Ensure the message has the required fields
                    if not isinstance(msg, dict):
                        continue
                    
                    # Check if the message has the required 'role' field
                    if "role" not in msg:
                        logger.warning(f"Chat history message missing 'role' field: {msg}")
                        continue
                    
                    # Check if the message has content
                    content = msg.get("content", msg.get("message", ""))
                    if not content:
                        logger.warning(f"Chat history message missing content: {msg}")
                        continue
                    
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=content))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=content))
                    else:
                        logger.warning(f"Unknown role in chat history: {msg['role']}")
            
            result = await self.agent_executor.ainvoke({
                "input": message,
                "chat_history": messages
            })
            
            response_text = result["output"]
            json_data = None
            
            try:
                import re
                json_pattern = r'```json\s*(\{.*?\})\s*```'
                json_match = re.search(json_pattern, response_text, re.DOTALL)
                
                if json_match:
                    json_data = json.loads(json_match.group(1))
                    response_text = re.sub(json_pattern, '', response_text, flags=re.DOTALL).strip()
            except (json.JSONDecodeError, AttributeError):
                try:
                    json_data = json.loads(response_text)
                    response_text = "Data retrieved successfully"
                except json.JSONDecodeError:
                    pass
            
            return {
                "response": response_text,
                "success": True,
                "error": None,
                "data": json_data
            }
            
        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            return {
                "response": f"I apologize, but I encountered an error: {str(e)}",
                "success": False,
                "error": str(e),
                "data": None
            }
    
    async def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools"""
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]
    
    async def call_tool_directly(self, tool_name: str, arguments: Dict[str, Any], user_token: Optional[str] = None) -> str:
        """Call a tool directly without going through the agent"""
        try:
            response = await self.mcp_client.call_tool(tool_name, arguments, user_token)
            
            if response.success:
                return json.dumps(response.data, indent=2)
            else:
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            return f"Error: {str(e)}"
    
    async def shutdown(self):
        """Shutdown the agent and MCP client"""
        try:
            await self.mcp_client.stop()
            logger.info("Agent shutdown complete")
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

# Example usage and testing
async def main():
    """Example usage of the EcommerceAgent"""
    import os
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Get Azure OpenAI configuration
    azure_config = {
        "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
        "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    }
    
    if not azure_config["api_key"] or not azure_config["endpoint"]:
        print("Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in your environment variables")
        return
    
    # Create MCP client
    mcp_client = HTTPMCPClient("http://localhost:3002")
    
    # Create agent
    agent = EcommerceAgent(mcp_client, azure_config)
    
    try:
        # Initialize agent
        await agent.initialize()
        
        # Example conversation
        print("E-commerce Agent initialized! Type 'quit' to exit.")
        print("Available tools:", [tool.name for tool in agent.tools])
        
        chat_history = []
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'bye']:
                break
            
            response = await agent.chat(user_input, chat_history)
            
            # Handle structured response
            if isinstance(response, dict):
                print(f"\nAgent: {response['response']}")
                if response.get('data'):
                    print(f"\nData: {json.dumps(response['data'], indent=2)}")
                if response.get('error'):
                    print(f"\nError: {response['error']}")
            else:
                print(f"\nAgent: {response}")
            
            # Update chat history
            chat_history.append({"role": "user", "content": user_input})
            chat_history.append({"role": "assistant", "content": response['response'] if isinstance(response, dict) else response})
            
            # Keep only last 10 messages
            if len(chat_history) > 20:
                chat_history = chat_history[-20:]
    
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
