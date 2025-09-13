#!/bin/bash

# Setup environment file for Docker

echo "🔧 Setting up environment file..."

# Copy the template
cp env.docker .env

echo "✅ Environment file created: .env"
echo ""
echo "📝 The .env file contains your Azure OpenAI configuration:"
echo "   - AZURE_OPENAI_API_KEY: Already set"
echo "   - AZURE_OPENAI_ENDPOINT: Already set"
echo "   - AZURE_OPENAI_DEPLOYMENT_NAME: gpt-4o"
echo ""
echo "🔧 You can now run:"
echo "   ./docker-setup.sh"
echo "   ./docker-start.sh"
