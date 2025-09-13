#!/bin/bash

# Authentication Service Startup Script

echo "🔐 Starting Authentication Microservice"
echo "======================================="

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if we're in a virtual environment or if packages are installed
if ! python3 -c "import fastapi" 2>/dev/null; then
    echo "⚠️  FastAPI not found. Installing dependencies..."
    
    # Try to install with pip
    if pip3 install -r requirements.txt; then
        echo "✅ Dependencies installed successfully"
    else
        echo "❌ Failed to install dependencies"
        echo "💡 Try creating a virtual environment:"
        echo "   python3 -m venv venv"
        echo "   source venv/bin/activate"
        echo "   pip install -r requirements.txt"
        exit 1
    fi
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Using default configuration."
fi

# Check if port is available
PORT=${PORT:-8000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️  Port $PORT is already in use. Trying port 8001..."
    PORT=8001
fi

echo "🚀 Starting server on http://localhost:$PORT"
echo "📚 API Documentation: http://localhost:$PORT/docs"
echo "🏥 Health Check: http://localhost:$PORT/health"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start the server
python3 -m uvicorn main:app --reload --host 0.0.0.0 --port $PORT
