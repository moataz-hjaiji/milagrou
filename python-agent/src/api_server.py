from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import asyncio
import logging
import os
from dotenv import load_dotenv

from http_mcp_client import HTTPMCPClient
from ecommerce_agent import EcommerceAgent

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

class ToolCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any]

class ToolCallResponse(BaseModel):
    result: str
    success: bool
    error: Optional[str] = None

# Global agent instance
agent: Optional[EcommerceAgent] = None

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
async def chat(request: ChatMessage):
    """Chat with the AI agent"""
    global agent
    
    if not agent:
        raise HTTPException(status_code=503, detail="Agent not initialized")
    
    try:
        response = await agent.chat(request.message, request.chat_history)
        return ChatResponse(response=response, success=True)
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            response="",
            success=False,
            error=str(e)
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
