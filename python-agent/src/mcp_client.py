import asyncio
import json
import subprocess
import sys
import aiohttp
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
import logging

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

class MCPClient:
    def __init__(self, server_command: str, server_args: List[str], service_urls: Optional[Dict[str, str]] = None):
        self.server_command = server_command
        self.server_args = server_args
        self.process = None
        self.tools: List[MCPTool] = []
        
        # Service URLs for direct API calls
        self.service_urls = service_urls or {
            'auth_service': 'http://auth-service:8000',
            'main_api': 'http://localhost:3000/api',
            'mcp_server': 'http://mcp-server:3002'
        }
        
        # HTTP session for making API calls
        self.session: Optional[aiohttp.ClientSession] = None
        
    async def start(self):
        """Start the MCP server process and HTTP session"""
        try:
            # Start HTTP session
            self.session = aiohttp.ClientSession()
            
            self.process = await asyncio.create_subprocess_exec(
                self.server_command,
                *self.server_args,
                stdin=asyncio.subprocess.PIPE,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            # Load available tools
            await self._load_tools()
            logger.info(f"MCP server started with {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"Failed to start MCP server: {e}")
            raise
    
    async def stop(self):
        """Stop the MCP server process and close HTTP session"""
        if self.session:
            await self.session.close()
            
        if self.process:
            self.process.terminate()
            await self.process.wait()
            logger.info("MCP server stopped")
    
    async def _send_request(self, method: str, params: Dict[str, Any] = None) -> Dict[str, Any]:
        """Send a request to the MCP server"""
        if not self.process:
            raise RuntimeError("MCP server not started")
        
        request = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params or {}
        }
        
        try:
            # Send request
            request_json = json.dumps(request) + "\n"
            self.process.stdin.write(request_json.encode())
            await self.process.stdin.drain()
            
            # Read response
            response_line = await self.process.stdout.readline()
            response = json.loads(response_line.decode().strip())
            
            return response
            
        except Exception as e:
            logger.error(f"Error communicating with MCP server: {e}")
            raise
    
    async def _load_tools(self):
        """Load available tools from the MCP server"""
        try:
            response = await self._send_request("/tools")
            logger.debug(f"Tools response: {response}")
            if "result" in response and "tools" in response["result"]:
                tools_data = response["result"]["tools"]
                self.tools = [
                    MCPTool(
                        name=tool["name"],
                        description=tool["description"],
                        input_schema=tool["inputSchema"]
                    )
                    for tool in tools_data
                ]
            else:
                logger.warning("No tools found in MCP server response")
                
        except Exception as e:
            logger.error(f"Failed to load tools: {e}")
            raise
    
    async def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> MCPResponse:
        """Call a specific tool with arguments"""
        try:
            response = await self._send_request("tools/call", {
                "name": tool_name,
                "arguments": arguments
            })
            
            if "result" in response:
                # Parse the content from the response
                result = response["result"]
                if "content" in result and len(result["content"]) > 0:
                    content = result["content"][0]
                    if content["type"] == "text":
                        try:
                            data = json.loads(content["text"])
                            return MCPResponse(success=True, data=data)
                        except json.JSONDecodeError:
                            return MCPResponse(success=True, data=content["text"])
                
                return MCPResponse(success=True, data=result)
            else:
                error_msg = response.get("error", {}).get("message", "Unknown error")
                return MCPResponse(success=False, error=error_msg)
                
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            return MCPResponse(success=False, error=str(e))
    
    async def call_service(self, service_name: str, endpoint: str, method: str = "GET", 
                          data: Optional[Dict[str, Any]] = None, 
                          headers: Optional[Dict[str, str]] = None,
                          user_token: Optional[str] = None) -> MCPResponse:
        """Call an external service directly via HTTP"""
        if not self.session:
            return MCPResponse(success=False, error="HTTP session not initialized")
        
        if service_name not in self.service_urls:
            return MCPResponse(success=False, error=f"Unknown service: {service_name}")
        
        base_url = self.service_urls[service_name]
        url = f"{base_url.rstrip('/')}/{endpoint.lstrip('/')}"
        
        # Prepare headers
        request_headers = headers or {}
        if user_token:
            request_headers['Authorization'] = f'Bearer {user_token}'
        request_headers['Content-Type'] = 'application/json'
        
        try:
            logger.info(f"🔗 Calling {method} {url}")
            
            async with self.session.request(
                method=method,
                url=url,
                json=data if data else None,
                headers=request_headers
            ) as response:
                if response.status == 200:
                    try:
                        result = await response.json()
                        logger.info(f"✅ Service call successful: {service_name}")
                        return MCPResponse(success=True, data=result)
                    except Exception as e:
                        text_result = await response.text()
                        return MCPResponse(success=True, data=text_result)
                else:
                    error_text = await response.text()
                    logger.error(f"❌ Service call failed: {response.status} - {error_text}")
                    return MCPResponse(success=False, error=f"HTTP {response.status}: {error_text}")
                    
        except Exception as e:
            logger.error(f"❌ Exception calling service {service_name}: {e}")
            return MCPResponse(success=False, error=str(e))
    
    async def call_auth_service(self, endpoint: str, data: Optional[Dict[str, Any]] = None, 
                               method: str = "POST", user_token: Optional[str] = None) -> MCPResponse:
        """Convenient method to call auth service"""
        return await self.call_service('auth_service', f"auth/{endpoint}", method, data, user_token=user_token)
    
    async def call_main_api(self, endpoint: str, data: Optional[Dict[str, Any]] = None, 
                           method: str = "GET", user_token: Optional[str] = None) -> MCPResponse:
        """Convenient method to call main API"""
        return await self.call_service('main_api', endpoint, method, data, user_token=user_token)
    
    async def call_mcp_server_http(self, endpoint: str, data: Optional[Dict[str, Any]] = None, 
                                  method: str = "GET", user_token: Optional[str] = None) -> MCPResponse:
        """Convenient method to call MCP server via HTTP"""
        return await self.call_service('mcp_server', endpoint, method, data, user_token=user_token)

    def get_tools(self) -> List[MCPTool]:
        """Get list of available tools"""
        return self.tools
    
    def get_tool_by_name(self, name: str) -> Optional[MCPTool]:
        """Get a specific tool by name"""
        for tool in self.tools:
            if tool.name == name:
                return tool
        return None
    
    def list_tool_names(self) -> List[str]:
        """Get list of tool names"""
        return [tool.name for tool in self.tools]
