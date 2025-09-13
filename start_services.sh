#!/bin/bash

# Start all services for E-commerce MCP + Python Agent

echo "🚀 Starting E-commerce Services"
echo "==============================="

# Check if .env files exist
if [ ! -f "mcp-server/.env" ]; then
    echo "❌ MCP server .env file not found. Run ./setup.sh first."
    exit 1
fi

if [ ! -f "python-agent/.env" ]; then
    echo "❌ Python agent .env file not found. Run ./setup.sh first."
    exit 1
fi

# Function to check if a port is in use
check_port() {
    if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null ; then
        return 0
    else
        return 1
    fi
}

# Check if e-commerce API is running
echo "🔍 Checking if e-commerce API is running..."
if check_port 3000; then
    echo "✅ E-commerce API is running on port 3000"
else
    echo "❌ E-commerce API is not running on port 3000"
    echo "Please start your e-commerce API first:"
    echo "  cd /path/to/your/api && npm run dev"
    exit 1
fi

# Start MCP Server in background
echo ""
echo "📡 Starting MCP Server..."
cd mcp-server
npm run start &
MCP_PID=$!
cd ..

# Wait a moment for MCP server to start
sleep 3

# Check if MCP server started successfully
if kill -0 $MCP_PID 2>/dev/null; then
    echo "✅ MCP Server started (PID: $MCP_PID)"
else
    echo "❌ Failed to start MCP Server"
    exit 1
fi

# Start Python Agent API Server
echo ""
echo "🐍 Starting Python Agent API Server..."
cd python-agent
python run_api.py &
AGENT_PID=$!
cd ..

# Wait a moment for agent to start
sleep 5

# Check if agent started successfully
if kill -0 $AGENT_PID 2>/dev/null; then
    echo "✅ Python Agent API started (PID: $AGENT_PID)"
else
    echo "❌ Failed to start Python Agent API"
    kill $MCP_PID 2>/dev/null
    exit 1
fi

echo ""
echo "🎉 All services started successfully!"
echo ""
echo "Services running:"
echo "- E-commerce API: http://localhost:3000/api"
echo "- MCP Server: Running in background (PID: $MCP_PID)"
echo "- Python Agent API: http://localhost:8000"
echo "- API Documentation: http://localhost:8000/docs"
echo ""
echo "Test the agent:"
echo "curl -X POST http://localhost:8000/chat \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"message\": \"Show me some products\"}'"
echo ""
echo "To stop all services, press Ctrl+C"

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $MCP_PID 2>/dev/null
    kill $AGENT_PID 2>/dev/null
    echo "✅ All services stopped"
    exit 0
}

# Set trap to cleanup on script exit
trap cleanup SIGINT SIGTERM

# Wait for user to stop services
wait
