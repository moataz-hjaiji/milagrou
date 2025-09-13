# E-commerce MCP + Python LangChain Agent

A complete AI-powered e-commerce assistant using Model Context Protocol (MCP) and LangChain.

## 🏗️ Architecture

```
User → Python LangChain Agent → MCP Client → MCP Server → Your E-commerce API → Database
```

## ✨ Features

- **🤖 AI-Powered Assistant**: Natural language interaction
- **🛍️ Product Management**: Browse, search, and view products
- **🛒 Shopping Cart**: Add, remove, and manage cart items
- **👤 User Management**: Profile and address management
- **📦 Order Processing**: Create, track, and manage orders
- **🔐 Authentication**: User login, registration, and sessions
- **🌐 REST API**: FastAPI-based API for integration
- **🐳 Docker Support**: Complete containerized setup

## 🚀 Quick Start

### Option 1: Docker (Recommended)

```bash
# Setup and start with Docker
./docker-setup.sh
./docker-start.sh

# View logs
./docker-logs.sh

# Run tests
./docker-test.sh
```

**See [README-Docker.md](README-Docker.md) for detailed Docker instructions.**

### Option 2: Manual Setup

```bash
# 1. Setup
chmod +x setup.sh
./setup.sh

# 2. Configure Environment
# Edit mcp-server/.env and python-agent/.env with your settings

# 3. Start Services
./start_services.sh
```

## 🎯 Usage

### Command Line
```bash
cd python-agent
python run_agent.py
```

### REST API
```bash
cd python-agent
python run_api.py
```

## 🧪 Testing
```bash
python test_integration.py
```

## 📚 API Documentation
- **API Docs**: http://localhost:8000/docs
- **Health Check**: http://localhost:8000/health

## 🛠️ Available Tools

### Authentication
- `login_user`, `register_user`, `logout_user`, `refresh_token`

### Products
- `get_products`, `get_product`, `search_products`, `get_categories`

### Shopping Cart
- `get_cart`, `add_to_cart`, `remove_from_cart`, `update_cart_item`

### Orders
- `get_orders`, `get_order`, `create_order`, `cancel_order`, `track_order`

### User Management
- `get_profile`, `update_profile`, `get_addresses`, `add_address`

## 💬 Example Usage

```
User: "Show me some electronics products"
Agent: I'll search for electronics products for you...

User: "Add the first product to my cart"
Agent: I'll add that product to your cart...
```

## 🔧 Development

### Project Structure
```
milagrou/
├── mcp-server/          # MCP Server (TypeScript)
├── python-agent/        # Python LangChain Agent
├── setup.sh            # Setup script
├── start_services.sh   # Start all services
└── test_integration.py # Integration tests
```

### Adding New Tools
1. Add to MCP Server (`mcp-server/src/tools/`)
2. Register in ToolManager
3. Update system prompt in agent

## 🐛 Troubleshooting

### Common Issues
1. **MCP Server Won't Start**: Check Node.js and build
2. **Python Agent Errors**: Verify OpenAI API key
3. **API Connection Issues**: Check e-commerce API is running
4. **Tool Execution Errors**: Check MCP server logs

### Debug Mode
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 📄 License
MIT License