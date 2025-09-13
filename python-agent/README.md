# E-commerce AI Agent with MCP Integration

This Python agent uses LangChain and connects to an MCP (Model Context Protocol) server to provide AI-powered assistance for e-commerce operations.

## Features

- **Product Browsing**: Search and view products, categories, and details
- **Shopping Cart Management**: Add, remove, and update cart items
- **User Management**: Profile and address management
- **Order Management**: Create, view, and track orders
- **Authentication**: User login, registration, and session management
- **REST API**: FastAPI-based API for integration with web/mobile apps

## Architecture

```
Python Agent (LangChain) → MCP Client → MCP Server → Your E-commerce API → Database
```

## Setup

### 1. Install Dependencies

```bash
cd python-agent
pip install -r requirements.txt
```

### 2. Environment Configuration

Copy `env.example` to `.env` and configure:

```bash
cp env.example .env
```

Edit `.env`:
```env
OPENAI_API_KEY=your-openai-api-key-here
MCP_SERVER_COMMAND=node
MCP_SERVER_ARGS=../mcp-server/dist/server.js
ECOMMERCE_API_URL=http://localhost:3000/api
```

### 3. Build MCP Server

```bash
cd ../mcp-server
npm install
npm run build
```

### 4. Start Your E-commerce API

Make sure your e-commerce API is running on `http://localhost:3000/api`

## Usage

### Option 1: Command Line Interface

```bash
python src/ecommerce_agent.py
```

### Option 2: REST API Server

```bash
python src/api_server.py
```

The API will be available at `http://localhost:8000`

### Option 3: Programmatic Usage

```python
import asyncio
from src.mcp_client import MCPClient
from src.ecommerce_agent import EcommerceAgent

async def main():
    # Create MCP client
    mcp_client = MCPClient("node", ["../mcp-server/dist/server.js"])
    
    # Create agent
    agent = EcommerceAgent(mcp_client, "your-openai-api-key")
    
    # Initialize
    await agent.initialize()
    
    # Chat
    response = await agent.chat("Show me some products")
    print(response)
    
    # Shutdown
    await agent.shutdown()

asyncio.run(main())
```

## API Endpoints

### Chat
- `POST /chat` - Chat with the AI agent
- `GET /health` - Health check
- `GET /tools` - List available tools

### Direct Tool Calls
- `POST /tools/call` - Call a tool directly
- `GET /tools/{tool_name}` - Get tool information

### E-commerce Operations
- `GET /products` - Get products with filters
- `GET /cart` - Get shopping cart
- `POST /cart/add` - Add item to cart

## Available Tools

### Authentication
- `login_user` - Login with phone/password
- `register_user` - Register new user
- `logout_user` - Logout current user
- `refresh_token` - Refresh authentication token

### Products
- `get_products` - Get all products with filters
- `get_product` - Get single product by ID
- `search_products` - Search products by query
- `get_categories` - Get all categories
- `get_category` - Get single category

### Shopping Cart
- `get_cart` - Get user's cart
- `add_to_cart` - Add product to cart
- `remove_from_cart` - Remove product from cart
- `update_cart_item` - Update item quantity
- `clear_cart` - Clear all cart items

### Orders
- `get_orders` - Get user's orders
- `get_order` - Get single order
- `create_order` - Create new order
- `cancel_order` - Cancel order
- `track_order` - Track order status

### User Management
- `get_profile` - Get user profile
- `update_profile` - Update user profile
- `get_addresses` - Get user addresses
- `add_address` - Add new address
- `update_address` - Update address
- `delete_address` - Delete address

## Example Conversations

```
User: "Show me some electronics products"
Agent: I'll search for electronics products for you...

User: "Add the first product to my cart"
Agent: I'll add that product to your cart...

User: "What's in my cart?"
Agent: Let me check your current cart...

User: "I want to checkout"
Agent: I'll help you create an order...
```

## Error Handling

The agent includes comprehensive error handling:
- MCP server connection errors
- API communication errors
- Tool execution errors
- User input validation

## Development

### Adding New Tools

1. Add tool to MCP server (`mcp-server/src/tools/`)
2. Tool will automatically be available in Python agent
3. Update system prompt in `ecommerce_agent.py` if needed

### Customizing Responses

Modify the system prompt in `ecommerce_agent.py` to change how the agent responds to users.

## Troubleshooting

### Common Issues

1. **MCP Server Not Starting**: Check that Node.js is installed and the MCP server builds successfully
2. **API Connection Errors**: Verify your e-commerce API is running and accessible
3. **OpenAI API Errors**: Check your API key and quota
4. **Tool Execution Errors**: Check MCP server logs for detailed error information

### Logs

Enable detailed logging by setting the log level:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## License

MIT License
