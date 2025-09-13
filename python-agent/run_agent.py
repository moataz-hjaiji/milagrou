#!/usr/bin/env python3
"""
Simple script to run the e-commerce AI agent
"""

import asyncio
import os
import sys
from dotenv import load_dotenv

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

from ecommerce_agent import EcommerceAgent
from mcp_client import MCPClient

async def main():
    """Main function to run the agent"""
    # Load environment variables
    load_dotenv()
    
    # Get Azure OpenAI configuration
    azure_config = {
        "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
        "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    }
    
    mcp_server_command = os.getenv("MCP_SERVER_COMMAND", "node")
    mcp_server_args = os.getenv("MCP_SERVER_ARGS", "../mcp-server/dist/server.js").split()
    
    # Validate configuration
    missing_vars = [key for key, value in azure_config.items() if not value]
    if missing_vars:
        print("❌ Error: Missing Azure OpenAI configuration:")
        for var in missing_vars:
            print(f"   - {var}")
        print("\nPlease set all required environment variables in the .env file")
        return
    
    print("🚀 Starting E-commerce AI Agent...")
    print(f"📡 MCP Server: {mcp_server_command} {' '.join(mcp_server_args)}")
    print(f"🤖 Azure OpenAI Model: {azure_config['deployment_name']}")
    print(f"🌐 Azure Endpoint: {azure_config['endpoint']}")
    
    # Create MCP client
    mcp_client = MCPClient(mcp_server_command, mcp_server_args)
    
    # Create agent
    agent = EcommerceAgent(mcp_client, azure_config)
    
    try:
        # Initialize agent
        print("🔧 Initializing agent...")
        await agent.initialize()
        
        print("✅ Agent initialized successfully!")
        print("💬 Type your messages below. Type 'quit' to exit.")
        print("=" * 50)
        
        chat_history = []
        
        while True:
            try:
                user_input = input("\n👤 You: ").strip()
                
                if user_input.lower() in ['quit', 'exit', 'bye', 'q']:
                    print("👋 Goodbye!")
                    break
                
                if not user_input:
                    continue
                
                print("🤖 Agent: ", end="", flush=True)
                response = await agent.chat(user_input, chat_history)
                print(response)
                
                # Update chat history
                chat_history.append({"role": "user", "content": user_input})
                chat_history.append({"role": "assistant", "content": response})
                
                # Keep only last 20 messages
                if len(chat_history) > 20:
                    chat_history = chat_history[-20:]
                    
            except KeyboardInterrupt:
                print("\n👋 Goodbye!")
                break
            except Exception as e:
                print(f"\n❌ Error: {e}")
    
    except Exception as e:
        print(f"❌ Failed to initialize agent: {e}")
        print("\nTroubleshooting:")
        print("1. Make sure your e-commerce API is running on http://localhost:3000/api")
        print("2. Build the MCP server: cd ../mcp-server && npm run build")
        print("3. Check your Azure OpenAI configuration is valid")
        print("4. Verify all environment variables are set correctly")
        print("5. Ensure AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT are set")
    
    finally:
        try:
            await agent.shutdown()
        except:
            pass

if __name__ == "__main__":
    asyncio.run(main())
