#!/bin/bash

# Stop all services

echo "🛑 Stopping E-commerce MCP + Python Agent Services"
echo "================================================="

# Stop all services
docker-compose down

if [ $? -eq 0 ]; then
    echo "✅ All services stopped successfully!"
else
    echo "❌ Failed to stop some services"
    exit 1
fi

# Also stop development services if running
docker-compose -f docker-compose.dev.yml down 2>/dev/null

echo "🧹 Cleanup complete"
