from typing import Optional, List
from motor.motor_asyncio import AsyncIOMotorCollection
import time
import logging

from database.mongodb import db_manager
from models.conversation import Conversation, Message

logger = logging.getLogger(__name__)

class ConversationRepository:
    def __init__(self):
        self._collection: Optional[AsyncIOMotorCollection] = None

    @property
    def collection(self) -> AsyncIOMotorCollection:
        """Get the conversations collection"""
        if self._collection is None:
            db = db_manager.get_database()
            self._collection = db.conversations
        return self._collection

    async def find_by_user_id(self, user_id: str) -> Optional[Conversation]:
        """Find a conversation by user_id"""
        try:
            doc = await self.collection.find_one({"user_id": user_id})
            if doc:
                # Convert MongoDB document to Pydantic model
                doc['_id'] = str(doc['_id'])  # Convert ObjectId to string
                return Conversation(**doc)
            return None
        except Exception as e:
            logger.error(f"Error finding conversation for user {user_id}: {e}")
            raise

    async def create_conversation(self, user_id: str) -> Conversation:
        """Create a new conversation for a user"""
        try:
            conversation = Conversation(
                user_id=user_id,
                messages=[],
                created_at=time.time(),
                updated_at=time.time()
            )
            
            doc = conversation.dict()
            result = await self.collection.insert_one(doc)
            
            logger.info(f"Created new conversation for user {user_id}: {result.inserted_id}")
            return conversation
            
        except Exception as e:
            logger.error(f"Error creating conversation for user {user_id}: {e}")
            raise

    async def add_message(self, user_id: str, message: Message) -> bool:
        """Add a message to the user's conversation"""
        try:
            current_time = time.time()
            
            # Extract just the user message from the content if it contains auth info
            clean_content = self._extract_user_message(message.content)
            
            # Create a clean message object
            clean_message = Message(
                role=message.role,
                content=clean_content,
                timestamp=message.timestamp
            )
            
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$push": {"messages": clean_message.dict()},
                    "$set": {"updated_at": current_time}
                },
                upsert=True
            )
            
            success = result.modified_count > 0 or result.upserted_id is not None
            if success:
                # Generate a simple message ID for logging
                message_id = f"msg_{int(message.timestamp)}"
                
                if result.upserted_id:
                    logger.info(f"Created new conversation and added {message.role} message [{message_id}] for user {user_id}: '{clean_content[:100]}{'...' if len(clean_content) > 100 else ''}'")
                else:
                    logger.info(f"Added {message.role} message [{message_id}] to existing conversation for user {user_id}: '{clean_content[:100]}{'...' if len(clean_content) > 100 else ''}'")
            else:
                logger.warning(f"Failed to add message for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error adding message to conversation for user {user_id}: {e}")
            raise

    def _extract_user_message(self, content: str) -> str:
        """Extract the actual user message from content that may contain authentication info"""
        try:
            # Check if content contains authentication pattern
            if "[Authenticated User:" in content and "] " in content:
                # Find the end of the authentication block
                auth_end = content.find("] ") + 2
                if auth_end > 1 and auth_end < len(content):
                    # Extract everything after the authentication info
                    clean_message = content[auth_end:].strip()
                    logger.debug(f"Extracted clean message: '{clean_message}' from: '{content[:100]}...'")
                    return clean_message
            
            # If no authentication pattern found, return original content
            return content.strip()
            
        except Exception as e:
            logger.warning(f"Error extracting user message from content, using original: {e}")
            return content.strip()

    async def get_messages(self, user_id: str, limit: Optional[int] = None) -> List[Message]:
        """Get all messages for a user's conversation"""
        try:
            doc = await self.collection.find_one({"user_id": user_id})
            if not doc:
                return []
            
            messages = doc.get("messages", [])
            
            # Apply limit if specified
            if limit:
                messages = messages[-limit:]
            
            # Convert to Message objects
            return [Message(**msg) for msg in messages]
            
        except Exception as e:
            logger.error(f"Error getting messages for user {user_id}: {e}")
            raise

    async def clear_conversation(self, user_id: str) -> bool:
        """Clear all messages from a user's conversation"""
        try:
            current_time = time.time()
            
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "messages": [],
                        "updated_at": current_time
                    }
                }
            )
            
            success = result.modified_count > 0
            if success:
                logger.info(f"Cleared conversation for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error clearing conversation for user {user_id}: {e}")
            raise

    async def delete_conversation(self, user_id: str) -> bool:
        """Delete a user's entire conversation"""
        try:
            result = await self.collection.delete_one({"user_id": user_id})
            
            success = result.deleted_count > 0
            if success:
                logger.info(f"Deleted conversation for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error deleting conversation for user {user_id}: {e}")
            raise

    async def get_user_conversations_count(self) -> int:
        """Get total number of conversations"""
        try:
            return await self.collection.count_documents({})
        except Exception as e:
            logger.error(f"Error getting conversations count: {e}")
            raise

# Global repository instance
conversation_repo = ConversationRepository()
