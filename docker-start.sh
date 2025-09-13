#!/bin/bash

# Start all services with Docker Compose

echo "🚀 Starting E-commerce MCP + Python Agent Services"
echo "================================================="

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Run ./docker-setup.sh first."
    exit 1
fi

# Check if OPENAI_API_KEY is set
if grep -q "your-openai-api-key-here" .env; then
    echo "❌ Please set your OPENAI_API_KEY in the .env file"
    echo "   Edit .env and replace 'your-openai-api-key-here' with your actual API key"
    exit 1
fi

echo "🐳 Starting Docker containers..."

# Start all services
docker-compose up -d

if [ $? -eq 0 ]; then
    echo "✅ All services started successfully!"
    echo ""
    echo "Services running:"
    echo "  - E-commerce API: http://localhost:3000/api"
    echo "  - Python Agent API: http://localhost:8000"
    echo "  - API Documentation: http://localhost:8000/docs"
    echo "  - MongoDB: localhost:27017"
    echo "  - Redis: localhost:6379"
    echo ""
    echo "To view logs: ./docker-logs.sh"
    echo "To stop services: ./docker-stop.sh"
    echo "To test integration: ./docker-test.sh"
else
    echo "❌ Failed to start services"
    exit 1
fi
