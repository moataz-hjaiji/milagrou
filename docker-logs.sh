#!/bin/bash

# View logs for all services

echo "📋 E-commerce MCP + Python Agent Logs"
echo "====================================="

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ No services are running. Start them first with ./docker-start.sh"
    exit 1
fi

echo "Available services:"
echo "  - ecommerce-api"
echo "  - mongodb"
echo "  - mcp-server"
echo "  - python-agent"
echo "  - redis"
echo ""

# If service name provided, show logs for that service
if [ $# -eq 1 ]; then
    SERVICE=$1
    echo "📋 Showing logs for $SERVICE..."
    docker-compose logs -f $SERVICE
else
    echo "📋 Showing logs for all services..."
    echo "Press Ctrl+C to stop viewing logs"
    echo ""
    docker-compose logs -f
fi
