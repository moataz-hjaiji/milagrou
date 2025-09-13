from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from contextlib import asynccontextmanager
import time
import uvicorn
import os
from config import settings
from routes import router as auth_router
from database import user_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events"""
    # Startup
    print("🚀 Starting Auth Microservice...")
    print(f"📊 JWT expires in: {settings.jwt_expire_minutes} minutes")
    print(f"🔐 Using algorithm: {settings.jwt_algorithm}")
    
    # Connect to MongoDB
    try:
        await user_db.connect()
        print("✅ Connected to MongoDB")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        # Don't exit the app, continue without database
    
    # Create a default admin user for testing (remove in production)
    if settings.debug:
        try:
            user_count = await user_db.get_user_count()
            if user_count == 0:
                from models import UserCreate
                
                admin_data = UserCreate(
                    email="admin@example.com",
                    password="AdminPass123!",
                    name="Administrator"
                )
                
                await user_db.create_user(
                    user_data=admin_data,
                    roles=["admin", "user"]
                )
                
                print("👤 Created default admin user: admin@example.com / AdminPass123!")
        except Exception as e:
            print(f"⚠️  Failed to create admin user: {e}")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down Auth Microservice...")
    await user_db.disconnect()

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    description="A complete authentication microservice with JWT tokens, bcrypt password hashing, and role-based access control.",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure this properly for production
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE"],
    allow_headers=["*"],
)

# Add trusted host middleware for production
if not settings.debug:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["localhost", "127.0.0.1", "*.yourdomain.com"]
    )

# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response

# Exception handlers
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Handle validation errors"""
    errors = []
    for error in exc.errors():
        field = " -> ".join(str(loc) for loc in error["loc"])
        message = error["msg"]
        errors.append(f"{field}: {message}")
    
    return JSONResponse(
        status_code=422,
        content={
            "success": False,
            "message": "Validation error",
            "errors": errors
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Handle general exceptions"""
    if settings.debug:
        import traceback
        traceback.print_exc()
    
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "message": "Internal server error",
            "error": str(exc) if settings.debug else "An unexpected error occurred"
        }
    )

# Include auth routes
app.include_router(auth_router)

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
        "uptime": time.time(),
        "users_count": user_db.get_user_count(),
        "debug": settings.debug
    }

# Root endpoint
@app.get("/")
async def root():
    """Root endpoint with service information"""
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "description": "Authentication microservice with JWT tokens",
        "documentation": "/docs",
        "health": "/health",
        "endpoints": {
            "signup": "POST /auth/signup",
            "login": "POST /auth/login", 
            "verify": "POST /auth/verify",
            "profile": "GET /auth/me",
            "users": "GET /auth/users (admin only)"
        }
    }

# Development server
if __name__ == "__main__":
    print(f"🔧 Running in development mode on http://{settings.host}:{settings.port}")
    uvicorn.run(
        "main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.debug,
        log_level="info" if settings.debug else "warning"
    )
