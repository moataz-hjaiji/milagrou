import asyncio
import json
import logging
import os
import re
from typing import Dict, Any, List, Optional, Tuple
from langchain.agents import AgentExecutor, create_openai_tools_agent
from langchain.tools import BaseTool
from langchain_openai import AzureChatOpenAI
from langchain.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.schema import HumanMessage, AIMessage, SystemMessage
from pydantic import BaseModel, Field

from http_mcp_client import HTTPMCPClient, MCPTool, MCPResponse
from intent_detector import IntentDetector, IntentResult
from parameter_validator import ParameterValidator
from product_resolver import ProductResolver
from response_formatter import ResponseFormatter
from jwt_utils import extract_user_id_from_token, extract_user_info_from_token
from intent_detector import IntentDetector
from missing import MissingParameterHandler


logger = logging.getLogger(__name__)

class EcommerceTool(BaseTool):
    """LangChain tool wrapper for MCP tools"""
    
    name: str
    description: str
    mcp_client: HTTPMCPClient
    mcp_tool: MCPTool
    user_token: Optional[str] = None
    missing_param_handler: Optional[MissingParameterHandler] = None
    
    def _run(self, **kwargs) -> str:
        """Synchronous run method"""
        return asyncio.run(self._arun(**kwargs))
    
    async def _arun(self, **kwargs) -> str:
        """Asynchronous run method"""
        logger.info(f"🔧 Executing tool '{self.name}' with parameters: {kwargs}")
        
        try:
            # Get tool schema information
            required_params = self.mcp_tool.input_schema.get("required", [])
            properties = self.mcp_tool.input_schema.get("properties", {})
            
            logger.debug(f"Tool schema - required: {required_params}, properties: {list(properties.keys())}")
            
            # Start with a copy of input kwargs
            filtered_kwargs = {}
            
            # Filter and include valid parameters
            for key, value in kwargs.items():
                if key in properties:
                    filtered_kwargs[key] = value
                    logger.debug(f"Included parameter: {key} = {value}")
                else:
                    logger.debug(f"Filtered out parameter: {key} = {value} (not in schema)")
            
            # Handle special authentication parameters for cart and user operations
            if self.name in ['add_to_cart', 'remove_from_cart', 'update_cart_item', 'clear_cart', 
                           'get_cart', 'get_orders', 'get_order', 'create_order'] and 'userId' in properties:
                # If userId is required but not provided, extract it from JWT token
                if 'userId' not in filtered_kwargs or not filtered_kwargs['userId']:
                    if self.user_token:
                        user_id = extract_user_id_from_token(self.user_token)
                        if user_id:
                            filtered_kwargs['userId'] = user_id
                            logger.debug(f"Added userId from JWT token: {user_id}")
                        else:
                            logger.warning(f"Tool '{self.name}' requires userId but couldn't extract from token")
                            filtered_kwargs['userId'] = "unknown_user"  # Fallback
                    else:
                        logger.warning(f"Tool '{self.name}' requires userId but no user token provided")
                        # Don't add a default userId if no token - let the API handle the error
            
            # Add any missing required parameters with empty defaults
            for param in required_params:
                if param not in filtered_kwargs:
                    # Set appropriate defaults based on parameter type
                    param_def = properties.get(param, {})
                    param_type = param_def.get('type', 'string')
                    
                    if param_type == 'number':
                        default_value = param_def.get('default', 1)
                    elif param_type == 'array':
                        default_value = param_def.get('default', [])
                    elif param_type == 'boolean':
                        default_value = param_def.get('default', False)
                    else:
                        default_value = param_def.get('default', "")
                    
                    filtered_kwargs[param] = default_value
                    logger.debug(f"Added missing required parameter: {param} = {default_value}")
            
            logger.info(f"🚀 Calling MCP tool '{self.name}' with filtered parameters: {filtered_kwargs}")
            
            # Pass user token to MCP client if available
            response = await self.mcp_client.execute_tool(self.name, filtered_kwargs, user_token=self.user_token)
            
            if response.success:
                logger.info(f"✅ Tool '{self.name}' executed successfully")
                logger.debug(f"Response data: {response.data}")
                return json.dumps(response.data, indent=2)
            else:
                logger.error(f"❌ Tool '{self.name}' execution failed: {response.error}")
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"❌ Exception in tool '{self.name}': {e}")
            return f"Error: {str(e)}"
    
    def set_user_token(self, token: str):
        """Set the user token for authentication"""
        self.user_token = token
        logger.debug(f"Set user token for tool '{self.name}'")

class EcommerceAgent:
    def __init__(self, mcp_client: HTTPMCPClient, azure_config: Dict[str, str]):
        logger.info("🚀 Initializing EcommerceAgent")
        
        self.mcp_client = mcp_client
        
        # Create Azure OpenAI client with explicit parameters
        logger.info("🤖 Setting up Azure OpenAI client")
        self.llm = AzureChatOpenAI(
            azure_deployment=azure_config.get("deployment_name", "gpt-4o"),
            azure_endpoint=azure_config.get("endpoint"),
            api_key=azure_config.get("api_key"),
            api_version=azure_config.get("api_version", "2024-02-15-preview"),
            temperature=0.1
        )
        self.tools: List[EcommerceTool] = []
        self.agent_executor: Optional[AgentExecutor] = None
        
        # Initialize helper modules - REMOVE THE DUPLICATE INTENT_DETECTOR
        logger.info("🔧 Initializing helper modules")
        # Initialize AI-powered intent detector with Azure config and MCP client
        self.intent_detector = IntentDetector(mcp_client, self.llm)  # Pass azure_config first, then mcp_client
        self.parameter_validator = ParameterValidator(mcp_client)
        self.missing_param_handler = MissingParameterHandler(self.parameter_validator)
        self.product_resolver = ProductResolver(mcp_client)
        self.response_formatter = ResponseFormatter()
        
        logger.info("✅ EcommerceAgent initialization completed")

    async def initialize(self):
        """Initialize the agent with MCP tools"""
        logger.info("🔄 Starting agent initialization process")
        
        try:
            # Start MCP client
            logger.info("📡 Starting MCP client connection")
            await self.mcp_client.start()
            logger.info("✅ MCP client connected successfully")
            
            # Create LangChain tools from MCP tools
            logger.info("🔧 Creating LangChain tools from MCP tools")
            mcp_tools = self.mcp_client.get_tools()
            self.tools = []
            
            logger.info(f"Found {len(mcp_tools)} MCP tools")
            
            for i, mcp_tool in enumerate(mcp_tools, 1):
                logger.debug(f"Creating LangChain wrapper for tool {i}/{len(mcp_tools)}: '{mcp_tool.name}'")
                
                langchain_tool = EcommerceTool(
                    name=mcp_tool.name,
                    description=mcp_tool.description,
                    mcp_client=self.mcp_client,
                    mcp_tool=mcp_tool
                )
                self.tools.append(langchain_tool)
            
            logger.info(f"✅ Created {len(self.tools)} LangChain tools")
            
            # Create the agent
            logger.info("🤖 Creating LangChain agent")
            await self._create_agent()
            logger.info("✅ LangChain agent created successfully")
            
            logger.info(f"🎉 Agent initialized successfully with {len(self.tools)} tools")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize agent: {e}")
            raise

    async def handle_user_request(self, user_input: str, user_token: Optional[str] = None) -> str:
        """
        Enhanced method to automatically detect intent, extract parameters, and route requests
        """
        logger.info(f"🎯 Processing user request: '{user_input}'")
        logger.debug(f"User token provided: {'Yes' if user_token else 'No'}")
        
        try:
            # Step 1: Detect intent
            logger.info("📍 Step 1: Detecting user intent")
            intent = self.intent_detector.detect_intent(user_input)
            logger.info(f" Intent detected: {intent}")
            # if not intent or intent.confidence < 0.3:
            #     logger.warning(f"❌ Intent detection failed or low confidence ({intent.confidence if intent else 0:.2f})")
            #     return ("I'm not sure what you'd like to do. I can help you with:\n"
            #            "• Login/Register: 'login with phone +1234567890' or 'create account'\n"
            #            "• Browse products: 'show me products' or 'search for shoes'\n"
            #            "• Cart management: 'add to cart', 'show my cart'\n"
            #            "• Orders: 'place order', 'show my orders'\n"
            #            "• Profile: 'show my profile', 'my addresses'\n\n"
            #            "What would you like to do?")
            
            logger.info(f"✅ Intent detected: '{intent.tool_name}' (confidence: {intent.confidence:.2f})")
            
            # Step 2: Check authentication
            logger.info("🔐 Step 2: Checking authentication requirements")
            if intent.requires_auth and not user_token:
                logger.warning(f"❌ Authentication required for '{intent.tool_name}' but no token provided")
                return ("You need to be logged in to do that. Please login first with your phone number and password.")
            elif intent.requires_auth:
                logger.info("✅ Authentication check passed")
            else:
                logger.info("ℹ️ No authentication required")
            
            # # Step 3: Resolve product references if needed
            logger.info("🔍 Step 3: Resolving product references")
            resolved_params = await self.product_resolver.resolve_product_references(
                intent.extracted_params, 
                user_token
            )
            if 'error' in resolved_params:
                logger.error(f"❌ Product resolution failed: {resolved_params['error']}")
                return resolved_params['error']
            
            logger.info("✅ Product reference resolution completed")
            
            # # Step 4: Validate parameters
            logger.info("🔍 Step 4: Validating parameters")
            validated_params = self.parameter_validator.validate_tool_parameters(
                intent.tool_name, 
                resolved_params
            )
            
            # if 'validation_errors' in validated_params:
            #     error_msg = "Parameter validation failed: " + ", ".join(validated_params['validation_errors'])
            #     logger.error(f"❌ {error_msg}")
            #     return error_msg
            
            # Step 5: Check for missing required parameters
            logger.info("📋 Step 5: Checking for missing required parameters")
            validated_params = await self.missing_param_handler.prompt_for_missing_parameters(
                intent.tool_name,
                validated_params,
                send_prompt_fn=self.send_prompt_to_user  # Your async function to get user input
            )
            
            if missing_params:
                missing_msg = self.parameter_validator.format_missing_params_message(
                    intent.tool_name, 
                    missing_params
                )
                logger.warning(f"❌ Missing required parameters: {missing_params}")
                return f"{missing_msg}\n\nPlease provide the missing information and try again."
            
            # logger.info("✅ All required parameters are present")
            
            # # Step 6: Execute the tool
            # logger.info(f"🚀 Step 6: Executing tool '{intent.tool_name}'")
            # try:
            #     response = await self.mcp_client.execute_tool(
            #         intent.tool_name, 
            #         validated_params, 
            #         user_token=user_token
            #     )
                
            #     logger.debug(f"Tool execution response: success={response.success}")
                
            #     if response.success:
            #         logger.info(f"✅ Tool '{intent.tool_name}' executed successfully")
            #         formatted_response = self.response_formatter.format_tool_response(
            #             intent.tool_name, 
            #             response.data
            #         )
            #         logger.info("✅ Response formatted successfully")
            #         return formatted_response
            #     else:
            #         error_msg = f"Sorry, I couldn't complete that request: {response.error}"
            #         logger.error(f"❌ Tool execution failed: {response.error}")
            #         return error_msg
                    
            # except Exception as e:
            #     logger.error(f"❌ Exception during tool execution: {e}")
            #     return f"I encountered an error while processing your request: {str(e)}"
                
        except Exception as e:
            logger.error(f"❌ Unexpected error in handle_user_request: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"

    async def chat(self, message: str, chat_history: List[Dict[str, str]] = None, user_token: Optional[str] = None) -> str:
        """Process a chat message with optional user authentication"""
        logger.info(f"💬 Processing chat message: '{message}'")
        
        try:
            if not self.agent_executor:
                logger.error("❌ Agent not initialized")
                raise RuntimeError("Agent not initialized")
            
            # Set the user token for all tools if provided
            # if user_token:
            #     logger.info("🔐 Setting user token for all tools")
            #     for tool in self.tools:
            #         if hasattr(tool, 'set_user_token'):
            #             tool.set_user_token(user_token)
            
            # Convert chat history to LangChain messages
            # messages = []
            # if chat_history:
            #     logger.info(f"📜 Processing {len(chat_history)} chat history messages")
            #     for msg in chat_history:
            #         # Ensure the message has the required fields
            #         if not isinstance(msg, dict):
            #             continue
                    
            #         # Check if the message has the required 'role' field
            #         if "role" not in msg:
            #             logger.warning(f"Chat history message missing 'role' field: {msg}")
            #             continue
                    
            #         # Check if the message has content
            #         content = msg.get("content", msg.get("message", ""))
            #         if not content:
            #             logger.warning(f"Chat history message missing content: {msg}")
            #             continue
                    
            #         if msg["role"] == "user":
            #             messages.append(HumanMessage(content=content))
            #         elif msg["role"] == "assistant":
            #             messages.append(AIMessage(content=content))
            #         else:
            #             logger.warning(f"Unknown role in chat history: {msg['role']}")
            
            # Try enhanced handling first
            logger.info("🎯 Attempting enhanced request handling")
            enhanced_result = await self.handle_user_request(message, user_token)
            # logger.info(f"✅ Enhanced handling completed: {enhanced_result}")
            # If enhanced handling provides a good result, use it
            # if not enhanced_result.startswith("I'm not sure what you'd like to do"):
            #     logger.info("✅ Enhanced handling successful")
            #     return enhanced_result
            
            # Fall back to LangChain agent
            # logger.info("🤖 Falling back to LangChain agent")
            # result = await self.agent_executor.ainvoke({
            #     "input": message,
            #     "chat_history": messages
            # })
            result = await self.handle_user_request(message, user_token)
            # logger.info(result)
            # logger.info("✅ LangChain agent processing completed")
            # return result["output"]
            return "test ....."
            
        except Exception as e:
            logger.error(f"❌ Error processing chat message: {e}")
            return f"I apologize, but I encountered an error: {str(e)}"
    
    async def get_available_tools(self) -> List[Dict[str, str]]:
        """Get list of available tools"""
        logger.info("📋 Getting available tools")
        tools = [
            {
                "name": tool.name,
                "description": tool.description
            }
            for tool in self.tools
        ]
        logger.info(f"✅ Retrieved {len(tools)} available tools")
        return tools
    
    async def call_tool_directly(self, tool_name: str, arguments: Dict[str, Any], user_token: Optional[str] = None) -> str:
        """Call a tool directly without going through the agent"""
        logger.info(f"🔧 Direct tool call: '{tool_name}' with arguments: {arguments}")
        
        try:
            response = await self.mcp_client.call_tool(tool_name, arguments, user_token)
            
            if response.success:
                logger.info(f"✅ Direct tool call successful: '{tool_name}'")
                return json.dumps(response.data, indent=2)
            else:
                logger.error(f"❌ Direct tool call failed: '{tool_name}' - {response.error}")
                return f"Error: {response.error}"
                
        except Exception as e:
            logger.error(f"❌ Exception in direct tool call '{tool_name}': {e}")
            return f"Error: {str(e)}"
    
    async def shutdown(self):
        """Shutdown the agent and MCP client"""
        logger.info("🔄 Shutting down agent")
        try:
            await self.mcp_client.stop()
            logger.info("✅ Agent shutdown completed successfully")
        except Exception as e:
            logger.error(f"❌ Error during agent shutdown: {e}")

    async def _create_agent(self):
        """Create the LangChain agent"""
        logger.info("🤖 Creating LangChain agent")
        
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
            max_iterations=30
        )
        
        logger.info("✅ LangChain agent created successfully")

# Example usage and testing
async def main():
    """Example usage of the enhanced EcommerceAgent"""
    import os
    from dotenv import load_dotenv
    
    # Load environment variables
    load_dotenv()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Get Azure OpenAI configuration
    azure_config = {
        "api_key": os.getenv("AZURE_OPENAI_API_KEY"),
        "endpoint": os.getenv("AZURE_OPENAI_ENDPOINT"),
        "deployment_name": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4o"),
        "api_version": os.getenv("AZURE_OPENAI_API_VERSION", "2024-02-15-preview")
    }
    
    mcp_server_url = os.getenv("MCP_SERVER_URL", "http://mcp-server:3002")
    
    if not azure_config["api_key"] or not azure_config["endpoint"]:
        print("Please set AZURE_OPENAI_API_KEY and AZURE_OPENAI_ENDPOINT in your environment variables")
        return
    
    # Create HTTP MCP client
    mcp_client = HTTPMCPClient(mcp_server_url)
    
    # Create agent
    agent = EcommerceAgent(mcp_client, azure_config)
    
    try:
        # Initialize agent
        await agent.initialize()
        
        # Example conversation with enhanced intent detection
        print("🎉 Enhanced E-commerce Agent initialized! Type 'quit' to exit.")
        print("Try commands like:")
        print("- 'show me products'")
        print("- 'add shoes to cart'") 
        print("- 'login with phone +1234567890'")
        print("- 'place an order'")
        
        user_token = None  # Will be set after login
        
        while True:
            user_input = input("\nYou: ")
            if user_input.lower() in ['quit', 'exit', 'bye']:
                break
            
            # Use the enhanced handle_user_request method
            response = await agent.handle_user_request(user_input, user_token)
            print(f"\nAgent: {response}")
            
            # If login was successful, extract token (simplified for demo)
            if "logged in" in response.lower() and user_token is None:
                # In a real app, you'd extract the actual token from the response
                user_token = "sample_token_after_login"
                print("(Token saved for authenticated requests)")
    
    except KeyboardInterrupt:
        print("\nShutting down...")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        await agent.shutdown()

if __name__ == "__main__":
    asyncio.run(main())
