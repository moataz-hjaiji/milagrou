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
from services.chat_service import chat_service
from models.conversation import ChatRequest, Message
from database.conversation_repository import conversation_repo
import time


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

    async def send_prompt_to_user(self, prompt_message: str, user_id: str = None, user_token: str = None) -> Dict[str, Any]:
        """
        Generate AI-powered questions for missing parameters and save assistant messages
        """
        try:
            # Get previous conversation history if user_id available
            previous_messages = []
            if user_id:
                previous_messages = await chat_service.get_conversation_history(user_id, limit=10)
                previous_messages = previous_messages.messages if hasattr(previous_messages, 'messages') else []
            
            # Create context from previous messages
            conversation_context = self._build_conversation_context(previous_messages)
            
            # Generate AI-powered question using Azure OpenAI
            ai_question = await self._generate_missing_param_question(
                prompt_message, 
                conversation_context
            )
            
            # Save the assistant's question to conversation
            if user_id and ai_question:
                assistant_message = Message(
                    role="assistant", 
                    content=ai_question,
                    timestamp=time.time()
                )
                await conversation_repo.add_message(user_id, assistant_message)
                logger.info(f"Saved assistant question to conversation for user {user_id}")
            logger.info({"question": ai_question, "requires_user_input": True})
            # Return the generated question (in real implementation, this would be sent to user)
            return {"question": ai_question, "requires_user_input": True}
            
        except Exception as e:
            logger.error(f"Error in send_prompt_to_user: {e}")
            return {"question": prompt_message, "requires_user_input": True}

    def _build_conversation_context(self, messages: List) -> str:
        """Build context string from previous conversation messages"""
        if not messages:
            return "No previous conversation."
        
        context_parts = []
        for msg in messages[-5:]:  # Last 5 messages for context
            role = msg.role if hasattr(msg, 'role') else msg.get('role', 'unknown')
            content = msg.content if hasattr(msg, 'content') else msg.get('content', '')
            context_parts.append(f"{role.capitalize()}: {content}")
        
        return "\n".join(context_parts)

    async def _generate_missing_param_question(self, original_prompt: str, conversation_context: str) -> str:
        """Generate AI-powered question for missing parameters"""
        try:
            system_message = """You are a helpful e-commerce assistant. Based on the conversation context and missing parameter information, generate a natural, friendly question to ask the user for the missing information.

Guidelines:
- Be conversational and helpful
- Ask for specific missing information clearly
- Reference the conversation context if relevant
- Keep questions concise but complete
- Use friendly, customer service tone
- If multiple parameters are missing, ask for the most important one first"""

            user_message = f"""
Conversation Context:
{conversation_context}

Missing Parameter Information:
{original_prompt}

Please generate a natural question to ask the user for the missing information."""

            messages = [
                {"role": "system", "content": system_message},
                {"role": "user", "content": user_message}
            ]

            # Use Azure OpenAI to generate the question
            response = await self.llm.agenerate_messages([
                [SystemMessage(content=system_message), HumanMessage(content=user_message)]
            ])
            
            generated_question = response.generations[0][0].message.content
            logger.debug(f"Generated AI question: {generated_question}")
            
            return generated_question
            
        except Exception as e:
            logger.error(f"Error generating AI question: {e}")
            # Fallback to original prompt
            return original_prompt

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

    async def handle_user_request(self, user_input: str, user_token: Optional[str] = None, user_id: Optional[str] = None) -> str:
        """
        Enhanced method to automatically detect intent, extract parameters, and route requests
        """
        logger.info(f"🎯 Processing user request: '{user_input}'")
        logger.debug(f"User token provided: {'Yes' if user_token else 'No'}")
        logger.debug(f"User ID provided: {user_id}")
        
        # Extract user_id from token if not provided
        if not user_id and user_token:
            user_id = extract_user_id_from_token(user_token)
        
        try:
            # Step 1: Detect intent
            logger.info("📍 Step 1: Detecting user intent")
            intent = self.intent_detector.detect_intent(user_input)
            logger.info(f" Intent detected: {intent}")
            
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

            logger.info(f"🔍 Step 4: Validating parameters resolved params {resolved_params}")
            validated_params = self.parameter_validator.validate_tool_parameters(
                intent.tool_name, 
                    
            )
            logger.info("📋 Step 5: Checking for missing required parameters")
            user_id = extract_user_id_from_token(user_token) if user_token else None
            
            max_attempts = 3  # Prevent infinite loops
            attempts = 0
            logger.debug(f"Initial validated parameters:  attempts: {attempts} max_attempts: {max_attempts}")
            while attempts < max_attempts:
                logger.debug(f"Attempt {attempts + 1} to check for missing parameters")
                missing_params = self.parameter_validator.get_missing_parameters(
                    intent.tool_name, 
                    validated_params
                )
                
                if not missing_params:
                    logger.info("✅ All required parameters are present")
                    break
                
                attempts += 1
                logger.info(f"❌ Missing parameters (attempt {attempts}/{max_attempts}): {missing_params}")
                
                # Generate missing parameters message
                missing_msg = self.parameter_validator.format_missing_params_message(
                    intent.tool_name, 
                    missing_params
                )
                
                # Use AI to generate a better question and save it
                prompt_result = await self.send_prompt_to_user(
                    missing_msg, 
                    user_id=user_id, 
                    user_token=user_token
                )
                
                # In a real implementation, you would wait for user input here
                # For now, we'll break the loop and return the AI-generated question
                if prompt_result.get("requires_user_input"):
                    ai_question = prompt_result.get("question", missing_msg)
                    return f"I need more information to help you:\n\n{ai_question}"
            
            if attempts >= max_attempts:
                logger.warning(f"❌ Max attempts reached for missing parameters: {missing_params}")
                return "I'm having trouble getting all the information I need. Please try rephrasing your request with more details."
        
                
                
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
            

            # Try enhanced handling first
            logger.info("🎯 Attempting enhanced request handling")
            user_id = None
            if user_token:
                user_id = extract_user_id_from_token(user_token)
                logger.info(f"Extracted user_id: {user_id}")
                
                if user_id:
                    chat_request = ChatRequest(message=message)
                    await chat_service.send_message(user_id, chat_request)
                    logger.info("✅ Message saved to conversation")
            
            # Pass user_id to handle_user_request for better parameter handling
            enhanced_result = await self.handle_user_request(message, user_token, user_id=user_id)
            result = await self.handle_user_request(message, user_token, user_id=user_id)
            # logger.info(result)
            # logger.info("✅ LangChain agent processing completed")
            return result["output"]
            
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
