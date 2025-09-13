#!/usr/bin/env python3
"""
Integration test script for E-commerce MCP + Python Agent
"""

import asyncio
import json
import requests
import time
import sys
import os
from dotenv import load_dotenv

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'python-agent', 'src'))

from mcp_client import MCPClient
from ecommerce_agent import EcommerceAgent

def test_api_connection():
    """Test if the e-commerce API is accessible"""
    print("🔍 Testing e-commerce API connection...")
    
    try:
        response = requests.get("http://localhost:3000/api", timeout=5)
        if response.status_code == 200:
            print("✅ E-commerce API is accessible")
            return True
        else:
            print(f"❌ E-commerce API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to e-commerce API: {e}")
        return False

def test_agent_api():
    """Test if the Python agent API is running"""
    print("🔍 Testing Python agent API...")
    
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            data = response.json()
            print("✅ Python agent API is running")
            print(f"   Available tools: {data.get('available_tools', 0)}")
            return True
        else:
            print(f"❌ Python agent API returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Cannot connect to Python agent API: {e}")
        return False

def test_chat_endpoint():
    """Test the chat endpoint"""
    print("🔍 Testing chat endpoint...")
    
    try:
        response = requests.post(
            "http://localhost:8000/chat",
            json={"message": "Hello, can you help me?"},
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Chat endpoint working")
                print(f"   Response: {data.get('response', '')[:100]}...")
                return True
            else:
                print(f"❌ Chat endpoint returned error: {data.get('error')}")
                return False
        else:
            print(f"❌ Chat endpoint returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing chat endpoint: {e}")
        return False

def test_tools_endpoint():
    """Test the tools endpoint"""
    print("🔍 Testing tools endpoint...")
    
    try:
        response = requests.get("http://localhost:8000/tools", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            tools = data.get("tools", [])
            print(f"✅ Tools endpoint working - {len(tools)} tools available")
            
            # List some tools
            tool_names = [tool["name"] for tool in tools[:5]]
            print(f"   Sample tools: {', '.join(tool_names)}")
            return True
        else:
            print(f"❌ Tools endpoint returned status {response.status_code}")
            return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Error testing tools endpoint: {e}")
        return False

async def test_direct_mcp_connection():
    """Test direct MCP connection"""
    print("🔍 Testing direct MCP connection...")
    
    try:
        # Load environment variables
        load_dotenv()
        
        mcp_server_command = os.getenv("MCP_SERVER_COMMAND", "node")
        mcp_server_args = os.getenv("MCP_SERVER_ARGS", "../mcp-server/dist/server.js").split()
        
        # Create MCP client
        mcp_client = MCPClient(mcp_server_command, mcp_server_args)
        
        # Start MCP client
        await mcp_client.start()
        
        # Test tool listing
        tools = mcp_client.get_tools()
        print(f"✅ MCP connection working - {len(tools)} tools available")
        
        # Test a simple tool call
        if tools:
            tool_name = tools[0].name
            print(f"   Testing tool: {tool_name}")
            
            response = await mcp_client.call_tool(tool_name, {})
            if response.success:
                print("✅ Tool execution working")
            else:
                print(f"❌ Tool execution failed: {response.error}")
        
        # Stop MCP client
        await mcp_client.stop()
        return True
        
    except Exception as e:
        print(f"❌ MCP connection failed: {e}")
        return False

def test_ecommerce_operations():
    """Test specific e-commerce operations"""
    print("🔍 Testing e-commerce operations...")
    
    operations = [
        ("GET /products", "http://localhost:8000/products"),
        ("GET /cart", "http://localhost:8000/cart"),
    ]
    
    success_count = 0
    
    for name, url in operations:
        try:
            response = requests.get(url, timeout=5)
            if response.status_code == 200:
                print(f"✅ {name} working")
                success_count += 1
            else:
                print(f"❌ {name} failed with status {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"❌ {name} error: {e}")
    
    return success_count == len(operations)

async def main():
    """Run all integration tests"""
    print("🧪 E-commerce MCP + Python Agent Integration Tests")
    print("=" * 55)
    
    # Load environment variables
    load_dotenv()
    
    tests = [
        ("E-commerce API Connection", test_api_connection),
        ("Python Agent API", test_agent_api),
        ("Chat Endpoint", test_chat_endpoint),
        ("Tools Endpoint", test_tools_endpoint),
        ("E-commerce Operations", test_ecommerce_operations),
        ("Direct MCP Connection", test_direct_mcp_connection),
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n📋 {test_name}")
        print("-" * 30)
        
        try:
            if asyncio.iscoroutinefunction(test_func):
                result = await test_func()
            else:
                result = test_func()
            
            if result:
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} ERROR: {e}")
    
    print("\n" + "=" * 55)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! Integration is working correctly.")
        return 0
    else:
        print("⚠️  Some tests failed. Please check the errors above.")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())
    sys.exit(exit_code)
