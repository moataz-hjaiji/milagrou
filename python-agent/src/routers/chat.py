from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import logging
from typing import Optional

from auth_utils import get_current_user
from services.chat_service import chat_service
from models.conversation import ChatRequest, ChatResponse, ConversationHistoryResponse

logger = logging.getLogger(__name__)

# Create the router
router = APIRouter(prefix="/chat", tags=["chat"])

# Security scheme
security = HTTPBearer()

# Dependency to extract user_id from JWT token
async def get_authenticated_user_id(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """Extract user_id from JWT token"""
    try:
        # Use existing auth_utils function to get user info
        user = await get_current_user(credentials.credentials)
        user_id = user.get("id") or user.get("user_id") or user.get("_id")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token: user_id not found"
            )
        
        return str(user_id)
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

@router.post("/", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    user_id: str = Depends(get_authenticated_user_id)
):
    """
    Chat endpoint that processes user messages and returns AI responses
    
    - **message**: The user's message text
    - **Authorization**: Bearer token with user authentication
    
    Returns the AI assistant's reply along with conversation metadata.
    """
    try:
        logger.info(f"Chat request from user {user_id}: {request.message}")
        
        if not request.message or not request.message.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Message cannot be empty"
            )

        # Process the message
        response = await chat_service.process_message(user_id, request)
        
        logger.info(f"Chat response for user {user_id}: success")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in chat endpoint for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.get("/history", response_model=ConversationHistoryResponse)
async def get_chat_history(
    limit: Optional[int] = 50,
    user_id: str = Depends(get_authenticated_user_id)
):
    """
    Get conversation history for the authenticated user
    
    - **limit**: Maximum number of messages to retrieve (default: 50)
    - **Authorization**: Bearer token with user authentication
    
    Returns the conversation history with all messages.
    """
    try:
        logger.info(f"Getting chat history for user {user_id}")
        
        if limit and (limit < 1 or limit > 200):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Limit must be between 1 and 200"
            )

        response = await chat_service.get_conversation_history(user_id, limit)
        
        logger.info(f"Retrieved {response.total_messages} messages for user {user_id}")
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting chat history for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/clear")
async def clear_chat_history(
    user_id: str = Depends(get_authenticated_user_id)
):
    """
    Clear conversation history for the authenticated user
    
    - **Authorization**: Bearer token with user authentication
    
    Clears all messages from the user's conversation.
    """
    try:
        logger.info(f"Clearing chat history for user {user_id}")
        
        success = await chat_service.clear_conversation(user_id)
        
        if success:
            return {"message": "Conversation cleared successfully", "success": True}
        else:
            return {"message": "No conversation found to clear", "success": False}
        
    except Exception as e:
        logger.error(f"Error clearing chat history for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )

@router.delete("/")
async def delete_conversation(
    user_id: str = Depends(get_authenticated_user_id)
):
    """
    Delete entire conversation for the authenticated user
    
    - **Authorization**: Bearer token with user authentication
    
    Permanently deletes the user's conversation.
    """
    try:
        logger.info(f"Deleting conversation for user {user_id}")
        
        success = await chat_service.delete_conversation(user_id)
        
        if success:
            return {"message": "Conversation deleted successfully", "success": True}
        else:
            return {"message": "No conversation found to delete", "success": False}
        
    except Exception as e:
        logger.error(f"Error deleting conversation for user {user_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(e)}"
        )
