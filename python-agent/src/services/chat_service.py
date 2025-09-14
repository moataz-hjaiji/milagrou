import os
import logging
import time
from typing import List, Optional

from database.conversation_repository import conversation_repo
from models.conversation import Message, ChatRequest, ChatResponse, ConversationHistoryResponse

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        logger.info("✅ ChatService initialized")

    async def send_message(self, user_id: str, request: ChatRequest) -> ChatResponse:
        """Send a message and add it to user's conversation"""
        try:
            # Get or create conversation
            conversation = await conversation_repo.find_by_user_id(user_id)
            if not conversation:
                logger.info(f"Creating new conversation for user {user_id}")
                conversation = await conversation_repo.create_conversation(user_id)

            # Create user message
            user_message = Message(
                role="user",
                content=request.message,
                timestamp=time.time()
            )

            # Add user message to conversation
            await conversation_repo.add_message(user_id, user_message)
            logger.info(f"Added message to conversation for user {user_id}")

            return ChatResponse(
                reply="Message sent successfully",
                conversation_id=user_id,
                timestamp=time.time()
            )

        except Exception as e:
            logger.error(f"Error sending message for user {user_id}: {e}")
            raise Exception(f"Failed to send message: {str(e)}")

    async def get_conversation_history(self, user_id: str, limit: Optional[int] = 50) -> ConversationHistoryResponse:
        """Get conversation history for a user"""
        try:
            messages = await conversation_repo.get_messages(user_id, limit=limit)
            
            return ConversationHistoryResponse(
                messages=messages,
                total_messages=len(messages),
                conversation_id=user_id
            )
            
        except Exception as e:
            logger.error(f"Error getting conversation history for user {user_id}: {e}")
            raise Exception(f"Failed to get conversation history: {str(e)}")

    async def clear_conversation(self, user_id: str) -> bool:
        """Clear conversation history for a user"""
        try:
            success = await conversation_repo.clear_conversation(user_id)
            if success:
                logger.info(f"Cleared conversation for user {user_id}")
            return success
            
        except Exception as e:
            logger.error(f"Error clearing conversation for user {user_id}: {e}")
            raise Exception(f"Failed to clear conversation: {str(e)}")

    async def delete_conversation(self, user_id: str) -> bool:
        """Delete entire conversation for a user"""
        try:
            success = await conversation_repo.delete_conversation(user_id)
            if success:
                logger.info(f"Deleted conversation for user {user_id}")
            return success
            
        except Exception as e:
            logger.error(f"Error deleting conversation for user {user_id}: {e}")
            raise Exception(f"Failed to delete conversation: {str(e)}")

# Global service instance
chat_service = ChatService()

async def example_usage():
    user_id = "user123"
    message = "Hello, how can I help you?"
    
    # Create a ChatRequest object
    chat_request = ChatRequest(message=message)
    
    # Send a message using the chat_service
    response = await chat_service.send_message(user_id, chat_request)
    print(response)  # Handle the response as needed
