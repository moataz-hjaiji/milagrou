import os
import logging
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from typing import Optional

logger = logging.getLogger(__name__)

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    database: Optional[AsyncIOMotorDatabase] = None

    @classmethod
    async def connect_to_mongo(cls):
        """Create database connection"""
        try:
            mongodb_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
            database_name = os.getenv("DATABASE_NAME", "milagro")
            
            logger.info(f"Connecting to MongoDB at {mongodb_uri}")
            cls.client = AsyncIOMotorClient(mongodb_uri)
            cls.database = cls.client[database_name]
            
            # Test the connection
            await cls.client.admin.command('ping')
            logger.info("✅ Successfully connected to MongoDB")
            
        except Exception as e:
            logger.error(f"❌ Failed to connect to MongoDB: {e}")
            raise

    @classmethod
    async def close_mongo_connection(cls):
        """Close database connection"""
        if cls.client:
            cls.client.close()
            logger.info("MongoDB connection closed")

    @classmethod
    def get_database(cls) -> AsyncIOMotorDatabase:
        """Get the database instance"""
        if cls.database is None:
            raise RuntimeError("Database not initialized. Call connect_to_mongo() first.")
        return cls.database

# Global database manager instance
db_manager = DatabaseManager()
