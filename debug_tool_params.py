#!/usr/bin/env python3

import asyncio
import sys
import json
sys.path.append('python-agent/src')
from ecommerce_agent import EcommerceAgent, HTTPMCPClient

class DebugEcommerceTool:
    """Debug version of EcommerceTool to see what parameters are received"""
    
    def __init__(self, name, description, mcp_client, mcp_tool):
        self.name = name
        self.description = description
        self.mcp_client = mcp_client
        self.mcp_tool = mcp_tool
        self.user_token = None
    
    def _run(self, **kwargs) -> str:
        print(f"🔍 DEBUG: Tool '{self.name}' called with kwargs: {kwargs}")
        print(f"🔍 DEBUG: Required params: {self.mcp_tool.input_schema.get('required', [])}")
        print(f"🔍 DEBUG: Properties: {self.mcp_tool.input_schema.get('properties', {})}")
        return "Debug response"
    
    async def _arun(self, *args, **kwargs) -> str:
        print(f"🔍 DEBUG: Tool '{self.name}' called with args: {args}, kwargs: {kwargs}")
        print(f"🔍 DEBUG: Required params: {self.mcp_tool.input_schema.get('required', [])}")
        print(f"🔍 DEBUG: Properties: {self.mcp_tool.input_schema.get('properties', {})}")
        return "Debug response"

async def debug_agent():
    """Debug the agent to see what parameters it receives"""
    print("🚀 Debugging Agent Parameter Extraction")
    print("=" * 50)
    
    # Initialize agent
    mcp_client = HTTPMCPClient('http://localhost:3002')
    azure_config = {
        'endpoint': 'https://milagrou-openai.openai.azure.com/',
        'api_key': 'your-api-key-here',
        'deployment_name': 'gpt-4o',
        'api_version': '2024-02-15-preview'
    }
    
    agent = EcommerceAgent(mcp_client, azure_config)
    
    # Replace the get_product tool with debug version
    await agent.initialize()
    
    # Find and replace the get_product tool
    for i, tool in enumerate(agent.tools):
        if tool.name == 'get_product':
            agent.tools[i] = DebugEcommerceTool(
                tool.name, 
                tool.description, 
                tool.mcp_client, 
                tool.mcp_tool
            )
            break
    
    # Test the agent
    response = await agent.chat('give me the details of this product 68c5fff6fb9060f2b15b6944', [])
    print(f"\nResponse: {response}")

if __name__ == "__main__":
    asyncio.run(debug_agent())
