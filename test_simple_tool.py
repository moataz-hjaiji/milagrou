#!/usr/bin/env python3

import asyncio
import sys
sys.path.append('python-agent/src')
from ecommerce_agent import EcommerceAgent, HTTPMCPClient

async def test_simple_tool():
    """Test with a simple tool call"""
    print("🚀 Testing Simple Tool Call")
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
    await agent.initialize()
    
    # Test with a very simple message
    print('\n📋 Test: Simple product request')
    print("-" * 30)
    response = await agent.chat('show me products', [])
    print(f'Response: {response["response"][:100]}...')
    
    print('\n📋 Test: Product details with explicit ID')
    print("-" * 30)
    response = await agent.chat('get product details for ID 68c5fff6fb9060f2b15b6944', [])
    print(f'Response: {response["response"][:100]}...')

if __name__ == "__main__":
    asyncio.run(test_simple_tool())
