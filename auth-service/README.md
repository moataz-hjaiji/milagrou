# FastAPI Authentication Microservice

A complete authentication microservice built with FastAPI, featuring JWT tokens, bcrypt password hashing, and in-memory user storage.

## Features

- 🔐 User registration and login
- 🔑 JWT token generation and verification
- 🛡️ Password hashing with bcrypt
- 🚀 FastAPI with automatic API documentation
- 🔒 Route protection middleware
- 📝 Comprehensive error handling
- ✅ Input validation with Pydantic

## API Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Authenticate user
- `POST /auth/verify` - Verify JWT token
- `GET /auth/me` - Get current user profile (protected)
- `GET /health` - Health check

## Quick Start

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Set environment variables:
```bash
export JWT_SECRET_KEY="your-secret-key-here"
export JWT_ALGORITHM="HS256"
export JWT_EXPIRE_MINUTES=1440
```

3. Run the server:
```bash
uvicorn main:app --reload --port 8000
```

4. Open browser to `http://localhost:8000/docs` for interactive API documentation.

## Usage Examples

### Register a new user
```bash
curl -X POST "http://localhost:8000/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!",
    "name": "John Doe"
  }'
```

### Login
```bash
curl -X POST "http://localhost:8000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "SecurePass123!"
  }'
```

### Verify token
```bash
curl -X POST "http://localhost:8000/auth/verify" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Access protected route
```bash
curl -X GET "http://localhost:8000/auth/me" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```
