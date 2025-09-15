#!/usr/bin/env python3
"""
Test script for the enhanced e-commerce agent with conversation handling
"""

import asyncio
import json
import logging
import sys
import os

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python-agent', 'src'))

from ecommerce_agent import EcommerceAgent

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

async def test_agent():
    """Test the enhanced agent functionality"""
    try:
        print("🚀 Initializing Enhanced E-commerce Agent...")
        
        # Initialize agent
        agent = EcommerceAgent()
        await agent.ainit()
        
        print("✅ Agent initialized successfully!")
        
        # Test scenarios
        test_scenarios = [
            {
                "name": "Product Search Without Query",
                "input": "I want to find some products",
                "user_id": "test_user@example.com",
                "user_token": None
            },
            {
                "name": "Get Products Request",
                "input": "Show me all products on page 2",
                "user_id": "test_user@example.com", 
                "user_token": None
            },
            {
                "name": "General Chat",
                "input": "Hello! How are you doing today?",
                "user_id": "test_user@example.com",
                "user_token": None
            }
        ]
        
        for scenario in test_scenarios:
            print(f"\n{'='*60}")
            print(f"🧪 Testing: {scenario['name']}")
            print(f"📝 Input: {scenario['input']}")
            print(f"👤 User: {scenario['user_id']}")
            
            try:
                # Call the enhanced handler
                result = await agent.handle_user_request(
                    user_input=scenario['input'],
                    user_token=scenario['user_token'],
                    user_id=scenario['user_id']
                )
                
                print(f"\n📋 Result Structure:")
                print(f"✅ Success: {result.get('success')}")
                print(f"💬 Response: {result.get('response')}")
                print(f"❓ Requires Input: {result.get('requires_input')}")
                
                if result.get('error'):
                    print(f"⚠️ Error: {result.get('error')}")
                
                if result.get('data'):
                    print(f"📊 Data: {type(result.get('data'))}")
                
                if result.get('pagination'):
                    print(f"📄 Pagination: {result.get('pagination')}")
                
                print(f"\n🔍 Full Response:")
                print(json.dumps(result, indent=2, default=str))
                
            except Exception as e:
                print(f"❌ Test failed with error: {e}")
                logger.exception(f"Error in test scenario: {scenario['name']}")
        
        print(f"\n{'='*60}")
        print("🎉 All tests completed!")
        
    except Exception as e:
        print(f"❌ Agent initialization failed: {e}")
        logger.exception("Failed to initialize agent")

if __name__ == "__main__":
    asyncio.run(test_agent())
