#!/bin/bash

# Docker Setup Script for E-commerce MCP + Python Agent

echo "🐳 Setting up E-commerce MCP + Python Agent with Docker"
echo "======================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file from template..."
    cp env.docker .env
    echo "⚠️  Please edit .env file with your OpenAI API key and other settings"
    echo "   Required: OPENAI_API_KEY"
    echo "   Optional: JWT_SECRET, MONGODB_URI"
fi

# Check if .env has required variables
if ! grep -q "OPENAI_API_KEY=" .env || grep -q "your-openai-api-key-here" .env; then
    echo "⚠️  Please set your OPENAI_API_KEY in the .env file"
    echo "   Edit .env and replace 'your-openai-api-key-here' with your actual API key"
    read -p "Press Enter after updating .env file..."
fi

echo ""
echo "🔧 Building Docker images..."

# Build all services
docker-compose build

if [ $? -ne 0 ]; then
    echo "❌ Failed to build Docker images"
    exit 1
fi

echo "✅ Docker images built successfully"

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Available commands:"
echo "  ./docker-start.sh          - Start all services"
echo "  ./docker-start-dev.sh      - Start in development mode"
echo "  ./docker-stop.sh           - Stop all services"
echo "  ./docker-logs.sh           - View logs"
echo "  ./docker-test.sh           - Run integration tests"
echo ""
echo "Services will be available at:"
echo "  - E-commerce API: http://localhost:3000/api"
echo "  - Python Agent API: http://localhost:8000"
echo "  - API Documentation: http://localhost:8000/docs"
echo "  - MongoDB: localhost:27017"
echo "  - Redis: localhost:6379"
