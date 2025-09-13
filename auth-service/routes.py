from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from typing import List
from datetime import datetime
from models import (
    UserCreate, UserLogin, UserResponse, TokenResponse, 
    TokenVerifyResponse, ErrorResponse, SuccessResponse
)
from database import user_db
from auth import auth_service
from dependencies import get_current_user, get_optional_user
from config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

@router.post("/signup", 
             response_model=TokenResponse,
             status_code=status.HTTP_201_CREATED,
             summary="Register a new user",
             description="Create a new user account with email, password, and name. Returns JWT token.")
async def signup(user_data: UserCreate):
    """
    Register a new user account.
    
    - **email**: Valid email address (will be converted to lowercase)
    - **password**: Strong password (min 8 chars, uppercase, lowercase, number, special char)
    - **name**: User's full name (2-50 characters)
    
    Returns JWT token and user information.
    """
    try:
        # Check if user already exists
        if await user_db.email_exists(user_data.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="User with this email already exists"
            )
        
        # Create user (password hashing is now handled in the database layer)
        user = await user_db.create_user(
            user_data=user_data,
            roles=["user"]
        )
        
        # Create JWT token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "roles": user.roles
        }
        
        access_token = auth_service.create_access_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.jwt_expire_minutes * 60,
            user=user.to_response()
        )
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user account"
        )

@router.post("/login",
             response_model=TokenResponse,
             summary="Authenticate user",
             description="Login with email and password. Returns JWT token.")
async def login(credentials: UserLogin):
    """
    Authenticate user with email and password.
    
    - **email**: User's email address
    - **password**: User's password
    
    Returns JWT token and user information.
    """
    try:
        # Authenticate user (this method handles password verification and login attempts)
        user = await user_db.authenticate_user(credentials.email, credentials.password)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive"
            )
        
        # Create JWT token
        token_data = {
            "user_id": user.id,
            "email": user.email,
            "name": user.name,
            "roles": user.roles
        }
        
        access_token = auth_service.create_access_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=settings.jwt_expire_minutes * 60,
            user=user.to_response()
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Authentication failed"
        )

@router.post("/verify",
             response_model=TokenVerifyResponse,
             summary="Verify JWT token",
             description="Verify the validity of a JWT token from Authorization header.")
async def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Verify JWT token validity.
    
    Expects Authorization header: Bearer <token>
    
    Returns validation result and user information if valid.
    """
    if not credentials:
        return TokenVerifyResponse(
            valid=False,
            error="Authorization header required"
        )
    
    try:
        token = credentials.credentials
        user = await auth_service.get_current_user(token)
        
        if not user:
            return TokenVerifyResponse(
                valid=False,
                error="Invalid or expired token"
            )
        
        if not user.is_active:
            return TokenVerifyResponse(
                valid=False,
                error="User account is inactive"
            )
        
        return TokenVerifyResponse(
            valid=True,
            user=user.to_response()
        )
        
    except Exception as e:
        return TokenVerifyResponse(
            valid=False,
            error="Token verification failed"
        )

@router.get("/me",
            response_model=UserResponse,
            summary="Get current user profile",
            description="Get the profile information of the currently authenticated user.")
async def get_current_user_profile(current_user = Depends(get_current_user)):
    """
    Get current user's profile information.
    
    Requires valid JWT token in Authorization header.
    """
    return current_user.to_response()

@router.get("/users",
            response_model=List[UserResponse],
            summary="Get all users (Admin only)",
            description="Get list of all users. Requires admin role.")
async def get_all_users(current_user = Depends(get_current_user)):
    """
    Get all users (Admin only).
    
    Requires admin role.
    """
    if "admin" not in current_user.roles:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    
    users = await user_db.get_all_users()
    return [user.to_response() for user in users]
