import httpx
import os
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Request

# Security scheme - make it optional
security = HTTPBearer(auto_error=False)
# Security scheme for required auth
security_required = HTTPBearer(auto_error=True)
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Security scheme
security = HTTPBearer()

class AuthService:
    """Authentication service client"""
    
    def __init__(self):
        self.auth_service_url = os.getenv("AUTH_SERVICE_URL", "http://auth-service:8000")
        self.timeout = 10.0
    
    async def verify_token(self, token: str) -> Optional[Dict[str, Any]]:
        """Verify JWT token with auth service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {token}"}
                response = await client.post(f"{self.auth_service_url}/auth/verify", headers=headers)
                
                if response.status_code == 200:
                    data = response.json()
                    # The verify endpoint returns {valid: bool, user: {...}} or {valid: bool, error: str}
                    if data.get("valid", False):
                        return data.get("user")
                    else:
                        logger.debug(f"Token verification failed: {data.get('error', 'Unknown error')}")
                        return None
                elif response.status_code == 401:
                    return None
                else:
                    logger.error(f"Auth service error: {response.status_code} - {response.text}")
                    return None
                    
        except httpx.TimeoutException:
            logger.error("Timeout verifying token with auth service")
            return None
        except Exception as e:
            logger.error(f"Error verifying token: {e}")
            return None
    
    async def get_user_info(self, token: str) -> Optional[Dict[str, Any]]:
        """Get user information from auth service"""
        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                headers = {"Authorization": f"Bearer {token}"}
                response = await client.get(f"{self.auth_service_url}/auth/me", headers=headers)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    return None
                    
        except Exception as e:
            logger.error(f"Error getting user info: {e}")
            return None

# Global auth service instance
auth_service = AuthService()

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security_required)) -> Dict[str, Any]:
    """Dependency to get current authenticated user"""
    if not credentials:
        raise HTTPException(status_code=401, detail="Authorization header required")
    
    user_info = await auth_service.verify_token(credentials.credentials)
    
    if not user_info:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    return user_info

async def get_optional_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Optional[Dict[str, Any]]:
    """Optional dependency to get current user if token is provided"""
    if not credentials:
        return None
    
    user_info = await auth_service.verify_token(credentials.credentials)
    return user_info

def require_roles(required_roles: list):
    """Decorator to require specific roles"""
    def role_dependency(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_roles = current_user.get("roles", [])
        
        if not any(role in user_roles for role in required_roles):
            raise HTTPException(
                status_code=403, 
                detail=f"Insufficient permissions. Required roles: {required_roles}"
            )
        
        return current_user
    
    return role_dependency

# Common role checks
async def require_admin(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require admin role"""
    user_roles = current_user.get("roles", [])
    
    if "admin" not in user_roles:
        raise HTTPException(status_code=403, detail="Admin role required")
    
    return current_user

async def require_user(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Require any authenticated user"""
    return current_user
