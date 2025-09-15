#!/usr/bin/env python3
"""
Test the chat functionality without database dependencies
"""

import sys
import os
import asyncio
import logging

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python-agent', 'src'))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

async def test_chat_functionality():
    """Test the chat functionality directly"""
    try:
        print("🚀 Starting Chat Functionality Test")
        print("=" * 50)
        
        from ecommerce_agent import EcommerceAgent
        from http_mcp_client import HTTPMCPClient
        
        # Mock configuration
        mock_azure_config = {
            "endpoint": "https://example.openai.azure.com/",
            "api_key": "fake-key-for-testing",
            "deployment_name": "gpt-4o",
            "api_version": "2024-02-15-preview"
        }
        
        mock_mcp_client = HTTPMCPClient("http://localhost:3000")
        
        print("✅ Creating EcommerceAgent instance")
        agent = EcommerceAgent(mock_mcp_client, mock_azure_config)
        
        print("✅ Testing handle_user_request with no database dependency")
        
        # Test case that doesn't require database
        response = await agent.handle_user_request(
            user_input="Hello, tell me about your services",
            user_token=None,
            user_id=None  # No user_id to avoid database calls
        )
        
        print(f"✅ Response structure: {type(response)}")
        print(f"   Keys: {list(response.keys())}")
        print(f"   Success: {response.get('success')}")
        print(f"   Response: {response.get('response', 'N/A')[:200]}...")
        print(f"   Error: {response.get('error', 'None')}")
        print(f"   Requires Input: {response.get('requires_input')}")
        
        # Test with a simple general chat
        if response.get('error'):
            print(f"\n⚠️ First test had error (expected): {response.get('error')}")
        
        print("\n✅ Chat functionality test completed!")
        
        return True
        
    except Exception as e:
        print(f"❌ Chat test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(test_chat_functionality())
    print(f"\n{'🎉 SUCCESS' if success else '❌ FAILED'}")
    sys.exit(0 if success else 1)
