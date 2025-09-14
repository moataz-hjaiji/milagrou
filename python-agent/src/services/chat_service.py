import os
import logging
import time
from typing import List, Optional
from openai import AsyncOpenAI

from database.conversation_repository import conversation_repo
from models.conversation import Message, ChatRequest, ChatResponse, ConversationHistoryResponse

logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            raise ValueError("OPENAI_API_KEY environment variable is required")
        
        self.openai_client = AsyncOpenAI(api_key=api_key)
        logger.info("✅ ChatService initialized with OpenAI client")

    async def process_message(self, user_id: str, request: ChatRequest) -> ChatResponse:
        """Process a chat message from a user"""
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
            logger.info(f"Added user message to conversation for user {user_id}")

            # Get all messages for context
            messages = await conversation_repo.get_messages(user_id)
            
            # Prepare messages for OpenAI (convert to OpenAI format)
            openai_messages = []
            
            # Add system message
            system_message = {
                "role": "system",
                "content": """You are a helpful AI assistant for an e-commerce platform. 
                You can help users with product recommendations, order inquiries, 
                general shopping questions, and customer support. 
                Be friendly, helpful, and concise in your responses. 
                Keep your responses under 500 words unless specifically asked for more detail."""
            }
            openai_messages.append(system_message)

            # Add conversation history
            for msg in messages:
                openai_messages.append({
                    "role": msg.role,
                    "content": msg.content
                })

            # Call OpenAI API
            logger.info("Calling OpenAI API for chat completion")
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=openai_messages,
                temperature=0.7,
                max_tokens=1000,
                top_p=1.0,
                frequency_penalty=0.0,
                presence_penalty=0.0,
            )

            assistant_reply = response.choices[0].message.content
            if not assistant_reply:
                raise Exception("No response from OpenAI")

            # Create assistant message
            assistant_message = Message(
                role="assistant",
                content=assistant_reply,
                timestamp=time.time()
            )

            # Add assistant message to conversation
            await conversation_repo.add_message(user_id, assistant_message)
            logger.info(f"Added assistant reply to conversation for user {user_id}")

            return ChatResponse(
                reply=assistant_reply,
                conversation_id=user_id,  # Using user_id as conversation identifier
                timestamp=time.time()
            )

        except Exception as e:
            logger.error(f"Error processing chat message for user {user_id}: {e}")
            raise Exception(f"Failed to process chat message: {str(e)}")

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
