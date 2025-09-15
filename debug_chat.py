#!/usr/bin/env python3
"""
Debug script to check the EcommerceAgent chat method
"""

import sys
import os
import asyncio
import logging

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python-agent', 'src'))

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def debug_chat_method():
    """Debug the chat method issue"""
    try:
        from ecommerce_agent import EcommerceAgent
        from http_mcp_client import HTTPMCPClient
        
        print("✅ Imports successful")
        
        # Create a mock agent (without initialization)
        mock_azure_config = {
            "endpoint": "https://example.openai.azure.com/",
            "api_key": "fake-key",
            "deployment_name": "gpt-4o",
            "api_version": "2024-02-15-preview"
        }
        
        mock_mcp_client = HTTPMCPClient("http://localhost:3000")
        
        print("🔧 Creating EcommerceAgent instance")
        agent = EcommerceAgent(mock_mcp_client, mock_azure_config)
        
        print("📋 Checking agent attributes:")
        print(f"  - Has chat method: {hasattr(agent, 'chat')}")
        print(f"  - Has agent_executor: {hasattr(agent, 'agent_executor')}")
        print(f"  - agent_executor value: {agent.agent_executor}")
        print(f"  - Has tools: {hasattr(agent, 'tools')}")
        print(f"  - tools length: {len(agent.tools) if hasattr(agent, 'tools') else 'N/A'}")
        
        # Check if chat method is callable
        if hasattr(agent, 'chat'):
            print(f"  - chat method type: {type(agent.chat)}")
            print(f"  - chat method callable: {callable(agent.chat)}")
        
        print("\n🎉 Debug completed successfully!")
        
    except Exception as e:
        print(f"❌ Debug failed: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(debug_chat_method())
