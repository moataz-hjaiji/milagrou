#!/bin/bash

# E-commerce MCP + Python Agent Setup Script

echo "🚀 Setting up E-commerce MCP Server + Python Agent"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if pip is installed
if ! command -v pip3 &> /dev/null; then
    echo "❌ pip3 is not installed. Please install pip3 first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Setup MCP Server
echo ""
echo "📦 Setting up MCP Server..."
cd mcp-server

if [ ! -f "package.json" ]; then
    echo "❌ MCP server directory not found or package.json missing"
    exit 1
fi

echo "Installing MCP server dependencies..."
npm install

echo "Building MCP server..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build MCP server"
    exit 1
fi

echo "✅ MCP Server setup complete"

# Setup Python Agent
echo ""
echo "🐍 Setting up Python Agent..."
cd ../python-agent

if [ ! -f "requirements.txt" ]; then
    echo "❌ Python agent directory not found or requirements.txt missing"
    exit 1
fi

echo "Installing Python dependencies..."
pip3 install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo "✅ Python Agent setup complete"

# Create environment files
echo ""
echo "⚙️  Setting up environment files..."

# MCP Server .env
if [ ! -f "mcp-server/.env" ]; then
    echo "Creating MCP server .env file..."
    cp mcp-server/env.example mcp-server/.env
    echo "📝 Please edit mcp-server/.env with your configuration"
fi

# Python Agent .env
if [ ! -f "python-agent/.env" ]; then
    echo "Creating Python agent .env file..."
    cp python-agent/env.example python-agent/.env
    echo "📝 Please edit python-agent/.env with your OpenAI API key"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit mcp-server/.env with your API configuration"
echo "2. Edit python-agent/.env with your OpenAI API key"
echo "3. Start your e-commerce API server"
echo "4. Run: ./start_services.sh"
echo ""
echo "For testing:"
echo "- Command line agent: cd python-agent && python run_agent.py"
echo "- API server: cd python-agent && python run_api.py"
