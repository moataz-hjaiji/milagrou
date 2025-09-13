import asyncio
import json
import aiohttp
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import logging
import time

logger = logging.getLogger(__name__)

@dataclass
class MCPTool:
    name: str
    description: str
    input_schema: Dict[str, Any]

@dataclass
class MCPResponse:
    success: bool
    data: Optional[Any] = None
    error: Optional[str] = None

class HTTPMCPClient:
    def __init__(self, base_url: str = "http://mcp-server:3002", max_retries: int = 5, retry_delay: float = 1.0):
        self.base_url = base_url
        self.session: Optional[aiohttp.ClientSession] = None
        self.tools: List[MCPTool] = []
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        
    async def start(self):
        """Initialize the HTTP client session"""
        timeout = aiohttp.ClientTimeout(total=30, connect=10)
        self.session = aiohttp.ClientSession(timeout=timeout)
        await self.wait_for_server()
        await self.load_tools()
        
    async def wait_for_server(self):
        """Wait for the MCP server to be ready"""
        logger.info("Waiting for MCP server to be ready...")
        for attempt in range(self.max_retries):
            try:
                if not self.session:
                    timeout = aiohttp.ClientTimeout(total=30, connect=10)
                    self.session = aiohttp.ClientSession(timeout=timeout)
                    
                async with self.session.get(f"{self.base_url}/health") as response:
                    if response.status == 200:
                        logger.info("MCP server is ready!")
                        return
                    else:
                        logger.warning(f"MCP server not ready: HTTP {response.status} (attempt {attempt + 1}/{self.max_retries})")
            except Exception as e:
                logger.warning(f"MCP server not ready (attempt {attempt + 1}/{self.max_retries}): {e}")
                
            if attempt < self.max_retries - 1:
                delay = self.retry_delay * (2 ** attempt)
                logger.info(f"Waiting {delay} seconds before retry...")
                await asyncio.sleep(delay)
            else:
                logger.error(f"MCP server not ready after {self.max_retries} attempts")
        
    async def stop(self):
        """Close the HTTP client session"""
        if self.session:
            await self.session.close()
            
    async def load_tools(self):
        """Load available tools from the MCP server with retry mechanism"""
        for attempt in range(self.max_retries):
            try:
                if not self.session:
                    await self.start()
                    
                async with self.session.get(f"{self.base_url}/tools") as response:
                    if response.status == 200:
                        data = await response.json()
                        self.tools = [
                            MCPTool(
                                name=tool.get("name", ""),
                                description=tool.get("description", ""),
                                input_schema=tool.get("input_schema", {})
                            )
                            for tool in data.get("tools", [])
                        ]
                        logger.info(f"Loaded {len(self.tools)} tools from MCP server")
                        return
                    else:
                        logger.warning(f"Failed to load tools: HTTP {response.status} (attempt {attempt + 1}/{self.max_retries})")
            except Exception as e:
                logger.warning(f"Error loading tools (attempt {attempt + 1}/{self.max_retries}): {e}")
                
            if attempt < self.max_retries - 1:
                delay = self.retry_delay * (2 ** attempt)  # Exponential backoff
                logger.info(f"Retrying in {delay} seconds...")
                await asyncio.sleep(delay)
            else:
                logger.error(f"Failed to load tools after {self.max_retries} attempts")
            
    async def execute_tool(self, tool_name: str, args: Dict[str, Any], user_token: Optional[str] = None) -> MCPResponse:
        """Execute a tool on the MCP server with optional authentication"""
        try:
            if not self.session:
                await self.start()
                
            payload = {
                "toolName": tool_name,
                "args": args
            }
            
            # Prepare headers
            headers = {"Content-Type": "application/json"}
            if user_token:
                headers["Authorization"] = f"Bearer {user_token}"
            
            async with self.session.post(f"{self.base_url}/execute", json=payload, headers=headers) as response:
                if response.status == 200:
                    data = await response.json()
                    # MCP server returns {"result": {...}} format
                    result = data.get("result", {})
                    if result and "statusCode" in result:
                        # Check if the result indicates success (statusCode 200)
                        success = result.get("statusCode") == 200
                        return MCPResponse(
                            success=success,
                            data=result,
                            error=None if success else result.get("message", "Unknown error")
                        )
                    else:
                        # Fallback for other response formats
                        return MCPResponse(
                            success=True,
                            data=result,
                            error=None
                        )
                else:
                    error_data = await response.json()
                    return MCPResponse(
                        success=False,
                        error=f"HTTP {response.status}: {error_data.get('error', 'Unknown error')}"
                    )
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {e}")
            return MCPResponse(
                success=False,
                error=str(e)
            )
            
    def get_tools(self) -> List[MCPTool]:
        """Get the list of available tools"""
        return self.tools
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any], user_token: Optional[str] = None) -> MCPResponse:
        """Call a tool directly (alias for execute_tool)"""
        return await self.execute_tool(tool_name, arguments, user_token)
        
    async def health_check(self) -> bool:
        """Check if the MCP server is healthy with retry mechanism"""
        for attempt in range(self.max_retries):
            try:
                if not self.session:
                    await self.start()
                    
                async with self.session.get(f"{self.base_url}/health") as response:
                    if response.status == 200:
                        return True
                    else:
                        logger.warning(f"Health check failed: HTTP {response.status} (attempt {attempt + 1}/{self.max_retries})")
            except Exception as e:
                logger.warning(f"Health check failed (attempt {attempt + 1}/{self.max_retries}): {e}")
                
            if attempt < self.max_retries - 1:
                delay = self.retry_delay * (2 ** attempt)
                await asyncio.sleep(delay)
                
        return False
