#!/bin/bash

# Run integration tests

echo "🧪 Running E-commerce MCP + Python Agent Integration Tests"
echo "========================================================="

# Check if services are running
if ! docker-compose ps | grep -q "Up"; then
    echo "❌ No services are running. Start them first with ./docker-start.sh"
    exit 1
fi

echo "🔍 Testing service connectivity..."

# Test e-commerce API
echo "Testing e-commerce API..."
if curl -s http://localhost:3000/api > /dev/null; then
    echo "✅ E-commerce API is accessible"
else
    echo "❌ E-commerce API is not accessible"
    echo "   Make sure your e-commerce API is running on port 3000"
fi

# Test Python Agent API
echo "Testing Python Agent API..."
if curl -s http://localhost:8000/health > /dev/null; then
    echo "✅ Python Agent API is accessible"
else
    echo "❌ Python Agent API is not accessible"
fi

# Test MongoDB
echo "Testing MongoDB..."
if docker-compose exec mongodb mongosh --eval "db.runCommand('ping')" > /dev/null 2>&1; then
    echo "✅ MongoDB is accessible"
else
    echo "❌ MongoDB is not accessible"
fi

# Test Redis
echo "Testing Redis..."
if docker-compose exec redis redis-cli ping > /dev/null 2>&1; then
    echo "✅ Redis is accessible"
else
    echo "❌ Redis is not accessible"
fi

echo ""
echo "🧪 Running Python integration tests..."

# Run Python tests inside the container
docker-compose exec python-agent python test_integration.py

echo ""
echo "📊 Test Summary:"
echo "  - Check the output above for test results"
echo "  - All services should show as accessible"
echo "  - Python tests should show detailed results"
