import asyncio
import json
import subprocess
import sys
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
    def __init__(self, server_command: str, server_args: List[str]):
        self.server_command = server_command
        self.server_args = server_args
        self.process = None
        self.tools: List[MCPTool] = []
        
    async def start(self):
        """Start the MCP server process"""
        try:
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
        """Stop the MCP server process"""
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
            response = await self._send_request("tools/list")
            
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
