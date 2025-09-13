from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging
import os
from dotenv import load_dotenv

from http_mcp_client import HTTPMCPClient
from ecommerce_agent import EcommerceAgent
from auth_utils import get_current_user, get_optional_user, require_admin, auth_service

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Pydantic models
class ChatMessage(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = None

class ChatResponse(BaseModel):
    response: str
    success: bool
    error: Optional[str] = None
    user: Optional[Dict[str, Any]] = None

class AuthenticatedChatMessage(BaseModel):
    message: str
    chat_history: Optional[List[Dict[str, str]]] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    user: Dict[str, Any]
    success: bool
    error: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str
    password: str
    name: str

class RegisterResponse(BaseModel):
    message: str
    user: Dict[str, Any]
    success: bool
    error: Optional[str] = None

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

class ToolCallResponse(BaseModel):
    result: str
    success: bool
    error: Optional[str] = None

# Global agent instance
agent: Optional[EcommerceAgent] = None

# Dependency to get authenticated user and token
async def get_user_and_token(request: Request, current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get authenticated user and extract token from request headers"""
    authorization = request.headers.get("authorization", "")
    token = authorization.replace("Bearer ", "") if authorization.startswith("Bearer ") else None
    
    return {
        "user": current_user,
        "token": token
    }

# Create FastAPI app
app = FastAPI(
    title="E-commerce AI Agent API",
    description="API for interacting with the e-commerce AI agent",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Initialize the agent on startup"""
    global agent
    
    try:
        # Get Azure OpenAI configuration
        azure_config = {
            "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
            "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
            "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
            "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
        }
        
        mcp_server_url = os.getenv("MCP_SERVER_URL", "http://mcp-server:3002")
        
        if not azure_config["api_key"] or not azure_config["endpoint"]:
            raise ValueError("AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT must be set")
        
        # Create HTTP MCP client
        mcp_client = HTTPMCPClient(mcp_server_url)
        
        # Create agent
        agent = EcommerceAgent(mcp_client, azure_config)
        
        # Initialize agent
        await agent.initialize()
        
        logger.info("E-commerce agent initialized successfully with Azure OpenAI")
        
    except Exception as e:
        logger.error(f"Failed to initialize agent: {e}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    global agent
    
    if agent:
        await agent.shutdown()
        logger.info("Agent shutdown complete")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "E-commerce AI Agent API is running"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        tools = await agent.get_available_tools()
        return {
            "status": "healthy",
            "agent_initialized": True,
            "available_tools": len(tools),
            "tools": [tool["name"] for tool in tools]
        }
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Agent health check failed: {str(e)}")

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatMessage, user_data: Dict[str, Any] = Depends(get_user_and_token)):
    """Chat with the AI agent (requires authentication)"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        current_user = user_data["user"]
        user_token = user_data["token"]
        
        # Add authenticated user context to the message
        user_roles = current_user.get('roles', [])
        user_name = current_user.get('name', 'Unknown')
        user_email = current_user.get('email', 'Unknown')
        user_context = f"[Authenticated User: {user_name} ({user_email}) - Roles: {', '.join(user_roles)}] "
        enhanced_message = user_context + request.message
        
        # Pass the user token to the agent so it can forward it to MCP server
        response = await agent.chat(enhanced_message, request.chat_history, user_token=user_token)
        
        return ChatResponse(
            response=response, 
            success=True, 
            user=current_user
        )
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            response=f"I apologize, but I encountered an error: {str(e)}",
            success=False,
            error=str(e),
            user=user_data.get("user") if user_data else None
        )

@app.get("/tools")
async def get_tools():
    """Get list of available tools"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        tools = await agent.get_available_tools()
        return {"tools": tools, "count": len(tools)}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Authentication endpoints - proxy to auth-service
@app.post("/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Login with email and password"""
    try:
        import httpx
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{auth_service.auth_service_url}/auth/login",
                json={"email": request.email, "password": request.password}
            )
            
            if response.status_code == 200:
                data = response.json()
                return LoginResponse(
                    access_token=data["access_token"],
                    token_type=data["token_type"],
                    user=data["user"],
                    success=True
                )
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {"detail": "Login failed"}
                return LoginResponse(
                    access_token="",
                    token_type="",
                    user={},
                    success=False,
                    error=error_data.get("detail", "Login failed")
                )
                
    except Exception as e:
        logger.error(f"Login error: {e}")
        return LoginResponse(
            access_token="",
            token_type="",
            user={},
            success=False,
            error=str(e)
        )

@app.post("/auth/register", response_model=RegisterResponse)
async def register(request: RegisterRequest):
    """Register a new user"""
    try:
        import httpx
        
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                f"{auth_service.auth_service_url}/auth/signup",
                json={"email": request.email, "password": request.password, "name": request.name}
            )
            
            if response.status_code == 201:
                data = response.json()
                return RegisterResponse(
                    message="User registered successfully",
                    user=data["user"],
                    success=True
                )
            else:
                error_data = response.json() if response.headers.get("content-type", "").startswith("application/json") else {"detail": "Registration failed"}
                return RegisterResponse(
                    message="",
                    user={},
                    success=False,
                    error=error_data.get("detail", "Registration failed")
                )
                
    except Exception as e:
        logger.error(f"Registration error: {e}")
        return RegisterResponse(
            message="",
            user={},
            success=False,
            error=str(e)
        )

@app.get("/auth/me")
async def get_current_user_info(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Get current user information"""
    return current_user

@app.post("/auth/verify")
async def verify_token(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Verify JWT token"""
    return current_user

@app.post("/tools/call", response_model=ToolCallResponse)
async def call_tool(request: ToolCallRequest):
    """Call a tool directly"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        result = await agent.call_tool_directly(request.tool_name, request.arguments)
        return ToolCallResponse(result=result, success=True)
        
    except Exception as e:
        logger.error(f"Error calling tool {request.tool_name}: {e}")
        return ToolCallResponse(
            result="",
            success=False,
            error=str(e)
        )

@app.get("/tools/{tool_name}")
async def get_tool_info(tool_name: str):
    """Get information about a specific tool"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        tools = await agent.get_available_tools()
        tool_info = next((tool for tool in tools if tool["name"] == tool_name), None)
        
        if not tool_info:
            raise HTTPException(status_code=404, detail="Tool not found")
        
        return tool_info
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Example endpoints for common e-commerce operations
@app.get("/products")
async def get_products(category: Optional[str] = None, search: Optional[str] = None, limit: int = 20):
    """Get products with optional filters"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        arguments = {"limit": limit}
        if category:
            arguments["category"] = category
        if search:
            arguments["search"] = search
        
        result = await agent.call_tool_directly("get_products", arguments)
        return {"products": result, "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/cart")
async def get_cart():
    """Get user's shopping cart"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        result = await agent.call_tool_directly("get_cart", {})
        return {"cart": result, "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/cart/add")
async def add_to_cart(product_id: str, quantity: int = 1):
    """Add item to cart"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        result = await agent.call_tool_directly("add_to_cart", {
            "productId": product_id,
            "quantity": quantity
        })
        return {"result": result, "success": True}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
