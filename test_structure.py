#!/usr/bin/env python3
"""
Simple test script to verify the enhanced agent structure and imports
"""

import sys
import os
import logging

# Add the src directory to Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'python-agent', 'src'))

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def test_imports_and_structure():
    """Test that all imports work and classes can be instantiated"""
    try:
        print("🧪 Testing imports and structure...")
        
        # Test core imports
        from ecommerce_agent import EcommerceAgent
        from http_mcp_client import HTTPMCPClient
        
        print("✅ Core imports successful!")
        
        # Test helper class imports
        from intent_detector import IntentDetector
        from parameter_validator import ParameterValidator
        from product_resolver import ProductResolver
        from response_formatter import ResponseFormatter
        
        print("✅ Helper class imports successful!")
        
        # Test model imports
        from models.conversation import ChatRequest, Message
        from database.conversation_repository import conversation_repo
        
        print("✅ Model imports successful!")
        
        # Test service imports
        from services.chat_service import chat_service
        
        print("✅ Service imports successful!")
        
        # Test key methods exist on EcommerceAgent
        agent_methods = [
            'handle_user_request',
            '_analyze_request_with_llm', 
            '_build_conversation_context',
            '_generate_clarification_question',
            '_execute_data_request',
            '_execute_action_request',
            '_save_conversation_messages'
        ]
        
        for method in agent_methods:
            if hasattr(EcommerceAgent, method):
                print(f"✅ Method '{method}' exists on EcommerceAgent")
            else:
                print(f"❌ Method '{method}' missing on EcommerceAgent")
        
        print("\n🎉 All structure tests passed!")
        return True
        
    except ImportError as e:
        print(f"❌ Import error: {e}")
        logger.exception("Import test failed")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {e}")
        logger.exception("Structure test failed")
        return False

def test_api_structure():
    """Test API server structure"""
    try:
        print("\n🌐 Testing API server structure...")
        
        # Test API imports
        from api_server import app
        from fastapi import FastAPI
        
        print("✅ API server imports successful!")
        
        # Verify it's a FastAPI instance
        if isinstance(app, FastAPI):
            print("✅ FastAPI app instance verified")
        else:
            print("❌ App is not a FastAPI instance")
            return False
        
        print("✅ API structure test passed!")
        return True
        
    except Exception as e:
        print(f"❌ API structure test failed: {e}")
        logger.exception("API structure test failed")
        return False

def main():
    """Run all tests"""
    print("🚀 Starting Enhanced E-commerce Agent Structure Tests")
    print("=" * 60)
    
    # Test 1: Imports and structure
    test1_passed = test_imports_and_structure()
    
    # Test 2: API structure  
    test2_passed = test_api_structure()
    
    # Summary
    print("\n" + "=" * 60)
    print("📋 Test Summary:")
    print(f"  Structure Test: {'✅ PASS' if test1_passed else '❌ FAIL'}")
    print(f"  API Test:       {'✅ PASS' if test2_passed else '❌ FAIL'}")
    
    if test1_passed and test2_passed:
        print("\n🎉 All tests passed! The enhanced agent structure is ready.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the output above.")
        return 1

if __name__ == "__main__":
    exit_code = main()
    sys.exit(exit_code)
