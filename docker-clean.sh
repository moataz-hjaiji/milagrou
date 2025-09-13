#!/bin/bash

# Clean up Docker resources

echo "🧹 Cleaning up Docker resources"
echo "==============================="

echo "🛑 Stopping all services..."
docker-compose down
docker-compose -f docker-compose.dev.yml down

echo "🗑️  Removing containers..."
docker-compose rm -f

echo "🗑️  Removing images..."
docker-compose down --rmi all

echo "🗑️  Removing volumes..."
docker-compose down -v

echo "🧹 Pruning unused Docker resources..."
docker system prune -f

echo "✅ Cleanup complete!"
echo ""
echo "To start fresh:"
echo "  1. Run ./docker-setup.sh"
echo "  2. Edit .env with your settings"
echo "  3. Run ./docker-start.sh"
