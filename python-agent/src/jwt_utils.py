import jwt
import json
import logging
from typing import Optional, Dict, Any
import base64

logger = logging.getLogger(__name__)

def decode_jwt_payload(token: str) -> Optional[Dict[str, Any]]:
    """
    Decode JWT token payload without verification (for development/testing)
    In production, you should verify the JWT signature
    """
    try:
        # Remove 'Bearer ' prefix if present
        if token.startswith('Bearer '):
            token = token[7:]
        
        # Split the JWT token
        parts = token.split('.')
        if len(parts) != 3:
            logger.error("Invalid JWT token format")
            return None
        
        # Decode the payload (second part)
        payload = parts[1]
        
        # Add padding if needed
        padding = 4 - (len(payload) % 4)
        if padding != 4:
            payload += '=' * padding
        
        # Decode base64
        decoded_bytes = base64.urlsafe_b64decode(payload)
        payload_dict = json.loads(decoded_bytes.decode('utf-8'))
        
        logger.debug(f"Decoded JWT payload: {payload_dict}")
        return payload_dict
        
    except Exception as e:
        logger.error(f"Failed to decode JWT token: {e}")
        return None

def extract_user_id_from_token(token: str) -> Optional[str]:
    """
    Extract user ID from JWT token
    """
    if not token:
        return None
        
    payload = decode_jwt_payload(token)
    if not payload:
        return None
    
    # Try different possible field names for user ID
    user_id = (
        payload.get('user_id') or 
        payload.get('userId') or 
        payload.get('sub') or 
        payload.get('id')
    )
    
    if user_id:
        logger.debug(f"Extracted user ID: {user_id}")
        return str(user_id)
    else:
        logger.warning("No user ID found in JWT token")
        return None

def extract_user_info_from_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Extract user information from JWT token
    """
    if not token:
        return None
        
    payload = decode_jwt_payload(token)
    if not payload:
        return None
    
    user_info = {
        'user_id': extract_user_id_from_token(token),
        'email': payload.get('email'),
        'name': payload.get('name'),
        'roles': payload.get('roles', []),
        'exp': payload.get('exp'),
        'iat': payload.get('iat')
    }
    
    # Remove None values
    user_info = {k: v for k, v in user_info.items() if v is not None}
    
    logger.debug(f"Extracted user info: {user_info}")
    return user_info
