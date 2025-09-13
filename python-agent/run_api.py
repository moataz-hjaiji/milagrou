#!/usr/bin/env python3
"""
Script to run the FastAPI server for the e-commerce AI agent
"""

import os
import sys
import uvicorn
from dotenv import load_dotenv

# Add src to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'src'))

def main():
    """Main function to run the API server"""
    # Load environment variables
    load_dotenv()
    
    # Get configuration
    port = int(os.getenv("PORT", 8000))
    host = os.getenv("HOST", "0.0.0.0")
    
    print("🚀 Starting E-commerce AI Agent API Server...")
    print(f"🌐 Server will be available at: http://{host}:{port}")
    print(f"📚 API Documentation: http://{host}:{port}/docs")
    print("=" * 50)
    
    # Run the server
    uvicorn.run(
        "api_server:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )

if __name__ == "__main__":
    main()
