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
            
            result = await self.collection.update_one(
                {"user_id": user_id},
                {
                    "$push": {"messages": message.dict()},
                    "$set": {"updated_at": current_time}
                }
            )
            
            success = result.modified_count > 0
            if success:
                logger.info(f"Added {message.role} message to conversation for user {user_id}")
            else:
                logger.warning(f"No conversation found to add message for user {user_id}")
            
            return success
            
        except Exception as e:
            logger.error(f"Error adding message to conversation for user {user_id}: {e}")
            raise

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
