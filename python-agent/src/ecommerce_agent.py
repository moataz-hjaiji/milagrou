import asyncio
import json
import logging
import os
from typing import Dict, Any, List, Optional
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import BaseTool
from langchain_openai import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from pydantic import BaseModel, Field

from http_mcp_client import HTTPMCPClient, MCPTool, MCPResponse

logger = logging.getLogger(__name__)

class EcommerceTool(BaseTool):
    """LangChain tool wrapper for MCP tools"""
    
    name: str
    description: str
    mcp_client: HTTPMCPClient
    mcp_tool: MCPTool
    user_token: Optional[str] = None
    
    def _run(self, **kwargs) -> str:
        """Synchronous run method"""
        return asyncio.run(self._arun(**kwargs))
    
    async def _arun(self, **kwargs) -> str:
        """Asynchronous run method"""
        try:
            # Filter arguments to only include those expected by the tool
            filtered_kwargs = {}
            required_params = self.mcp_tool.input_schema.get("required", [])
            properties = self.mcp_tool.input_schema.get("properties", {})
            
            for key, value in kwargs.items():
                if key in properties:
                    filtered_kwargs[key] = value
            
            # Add required parameters if missing
            for param in required_params:
                if param not in filtered_kwargs:
                    filtered_kwargs[param] = kwargs.get(param, "")
            
            # Pass user token to MCP client if available
            response = await self.mcp_client.execute_tool(self.name, filtered_kwargs, user_token=self.user_token)
            
            if response.success:
                return json.dumps(response.data, indent=2)
            else:
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"Error running tool {self.name}: {e}")
            return f"Error: {str(e)}"
    
    def set_user_token(self, token: str):
        """Set the user token for authentication"""
        self.user_token = token

class EcommerceAgent:
    def __init__(self, mcp_client: HTTPMCPClient, azure_config: Dict[str, str]):
        self.mcp_client = mcp_client
        # Create Azure OpenAI client with explicit parameters
        self.llm = AzureChatOpenAI(
            azure_deployment=azure_config.get("deployment_name", "gpt-4o"),
            azure_endpoint=azure_config.get("endpoint"),
            api_key=azure_config.get("api_key"),
            api_version=azure_config.get("api_version", "2024-02-15-preview"),
            temperature=0.1
        )
        self.tools: List[EcommerceTool] = []
        self.agent_executor: Optional[AgentExecutor] = None
        
    async def initialize(self):
        """Initialize the agent with MCP tools"""
        try:
            # Start MCP client
            await self.mcp_client.start()
            
            # Create LangChain tools from MCP tools
            mcp_tools = self.mcp_client.get_tools()
            self.tools = []
            
            for mcp_tool in mcp_tools:
                langchain_tool = EcommerceTool(
                    name=mcp_tool.name,
                    description=mcp_tool.description,
                    mcp_client=self.mcp_client,
                    mcp_tool=mcp_tool
                )
                self.tools.append(langchain_tool)
            
            # Create the agent
            await self._create_agent()
            
            logger.info(f"Agent initialized with {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"Failed to initialize agent: {e}")
            raise
    
    async def _create_agent(self):
        """Create the LangChain agent"""
        # Create system prompt
        system_prompt = """You are an AI assistant for an e-commerce platform. You can help users with:

1. **Product Browsing**: Search and view products, categories, and product details
2. **Shopping Cart**: Add items to cart, view cart, update quantities, remove items
3. **User Management**: View and update user profile, manage addresses
4. **Order Management**: Create orders, view order history, track orders
5. **Authentication**: Help users login, register, and manage their accounts

Always be helpful, friendly, and provide clear information. If a user asks for something you can't do, explain what you can help with instead.

Available tools:
- Authentication: login_user, register_user, logout_user, refresh_token
- Products: get_products, get_product, search_products, get_categories, get_category
- Cart: get_cart, add_to_cart, remove_from_cart, update_cart_item, clear_cart
- Orders: get_orders, get_order, create_order, cancel_order, track_order
- User: get_profile, update_profile, get_addresses, add_address, update_address, delete_address

When users ask about products, always try to get the most relevant information. For shopping cart operations, make sure to get the current cart first if needed.
"""

        # Create prompt template
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_prompt),
            MessagesPlaceholder("chat_history"),
            ("human", "{input}"),
            MessagesPlaceholder("agent_scratchpad")
        ])
        
        # Create agent
        agent = create_openai_tools_agent(
            llm=self.llm,
            tools=self.tools,
            prompt=prompt
        )
        
        # Create agent executor
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=5
        )
    
    async def chat(self, message: str, chat_history: List[Dict[str, str]] = None, user_token: Optional[str] = None) -> str:
        """Process a chat message with optional user authentication"""
        try:
            if not self.agent_executor:
                raise RuntimeError("Agent not initialized")
            
            # Set the user token for all tools if provided
            if user_token:
                for tool in self.tools:
                    if hasattr(tool, 'set_user_token'):
                        tool.set_user_token(user_token)
            
            # Convert chat history to LangChain messages
            messages = []
            if chat_history:
                for msg in chat_history:
                    # Ensure the message has the required fields
                    if not isinstance(msg, dict):
                        continue
                    
                    # Check if the message has the required 'role' field
                    if "role" not in msg:
                        logger.warning(f"Chat history message missing 'role' field: {msg}")
                        continue
                    
                    # Check if the message has content
                    content = msg.get("content", msg.get("message", ""))
                    if not content:
                        logger.warning(f"Chat history message missing content: {msg}")
                        continue
                    
                    if msg["role"] == "user":
                        messages.append(HumanMessage(content=content))
                    elif msg["role"] == "assistant":
                        messages.append(AIMessage(content=content))
                    else:
                        logger.warning(f"Unknown role in chat history: {msg['role']}")
            
            # Run the agent
            result = await self.agent_executor.ainvoke({
                "input": message,
                "chat_history": messages
            })
            
            return result["output"]
            
        except Exception as e:
            logger.error(f"Error processing chat message: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"
    
    async def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools"""
        return [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]
    
    async def call_tool_directly(self, tool_name: str, arguments: Dict[str, Any], user_token: Optional[str] = None) -> str:
        """Call a tool directly without going through the agent"""
        try:
            response = await self.mcp_client.call_tool(tool_name, arguments, user_token)
            
            if response.success:
                return json.dumps(response.data, indent=2)
            else:
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"Error calling tool {tool_name}: {e}")
            return f"Error: {str(e)}"
    
    async def shutdown(self):
        """Shutdown the agent and MCP client"""
        try:
            await self.mcp_client.stop()
            logger.info("Agent shutdown complete")
        except Exception as e:
            logger.error(f"Error during shutdown: {e}")

# Example usage and testing
async def main():
    """Example usage of the EcommerceAgent"""
    import os
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Configure logging
    logging.basicConfig(level=logging.INFO)
    
    # Get Azure OpenAI configuration
    azure_config = {
        "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
        "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    }
    
    mcp_server_command = os.getenv("MCP_SERVER_COMMAND", "node")
    mcp_server_args = os.getenv("MCP_SERVER_ARGS", "../mcp-server/dist/server.js").split()
    
    if not azure_config["api_key"] or not azure_config["endpoint"]:
        print("Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in your environment variables")
        return
    
    # Create MCP client
    mcp_client = MCPClient(mcp_server_command, mcp_server_args)
    
    # Create agent
    agent = EcommerceAgent(mcp_client, azure_config)
    
    try:
        # Initialize agent
        await agent.initialize()
        
        # Example conversation
        print("E-commerce Agent initialized! Type 'quit' to exit.")
        print("Available tools:", [tool.name for tool in agent.tools])
        
        chat_history = []
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'bye']:
                break
            
            response = await agent.chat(user_input, chat_history)
            print(f"\nAgent: {response}")
            
            # Update chat history
            chat_history.append({"role": "user", "content": user_input})
            chat_history.append({"role": "assistant", "content": response})
            
            # Keep only last 10 messages
            if len(chat_history) > 20:
                chat_history = chat_history[-20:]
    
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
