from typing import Dict, Optional, List
from datetime import datetime
import uuid
import os
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import DuplicateKeyError
import bcrypt
from models import UserCreate, UserResponse

class User:
    def __init__(self, email: str, name: str, password_hash: str, roles: List[str] = None, user_id: str = None):
        self.id = user_id or str(uuid.uuid4())
        self.email = email.lower()
        self.name = name
        self.password_hash = password_hash
        self.roles = roles or ["user"]
        self.created_at = datetime.utcnow()
        self.updated_at = datetime.utcnow()
        self.is_active = True
        self.login_attempts = 0
        self.last_login = None

    def to_dict(self) -> dict:
        return {
            "_id": self.id,
            "id": self.id,
            "email": self.email,
            "name": self.name,
            "password_hash": self.password_hash,
            "roles": self.roles,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
            "is_active": self.is_active,
            "login_attempts": self.login_attempts,
            "last_login": self.last_login
        }

    @classmethod
    def from_dict(cls, data: dict):
        """Create User instance from dictionary"""
        user = cls(
            email=data["email"],
            name=data["name"],
            password_hash=data["password_hash"],
            roles=data.get("roles", ["user"]),
            user_id=data.get("_id") or data.get("id")
        )
        user.created_at = data.get("created_at", datetime.utcnow())
        user.updated_at = data.get("updated_at", datetime.utcnow())
        user.is_active = data.get("is_active", True)
        user.login_attempts = data.get("login_attempts", 0)
        user.last_login = data.get("last_login")
        return user

    def to_response(self) -> UserResponse:
        return UserResponse(
            id=self.id,
            email=self.email,
            name=self.name,
            roles=self.roles,
            created_at=self.created_at,
            is_active=self.is_active
        )

class UserDatabase:
    def __init__(self):
        self.client = None
        self.db = None
        self.users_collection = None
        self._connected = False
    
    async def connect(self):
        """Connect to MongoDB"""
        if self._connected:
            return
        
        # Get MongoDB URI from environment
        mongodb_uri = os.getenv("MONGODB_URI", "mongodb://admin:password@mongodb:27017/milagro?authSource=admin")
        
        try:
            self.client = AsyncIOMotorClient(mongodb_uri)
            # Test connection
            await self.client.admin.command('ping')
            
            # Get database and collection
            self.db = self.client.get_database("milagro")
            self.users_collection = self.db.auth_users
            
            # Create indexes
            await self.users_collection.create_index("email", unique=True)
            await self.users_collection.create_index("id", unique=True)
            
            self._connected = True
            print("✅ Connected to MongoDB successfully")
            
        except Exception as e:
            print(f"❌ Failed to connect to MongoDB: {e}")
            raise
    
    async def disconnect(self):
        """Disconnect from MongoDB"""
        if self.client:
            self.client.close()
            self._connected = False
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Hash password using bcrypt"""
        salt = bcrypt.gensalt()
        return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')
    
    @staticmethod
    def verify_password(password: str, hashed_password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hashed_password.encode('utf-8'))
    
    async def create_user(self, user_data: UserCreate, roles: List[str] = None) -> User:
        """Create a new user"""
        if not self._connected:
            await self.connect()
        
        email = user_data.email.lower()
        
        # Hash the password
        password_hash = self.hash_password(user_data.password)
        
        user = User(
            email=email,
            name=user_data.name,
            password_hash=password_hash,
            roles=roles or ["user"]
        )
        
        try:
            # Insert user into MongoDB
            result = await self.users_collection.insert_one(user.to_dict())
            user.id = str(result.inserted_id)
            return user
            
        except DuplicateKeyError:
            raise ValueError("User with this email already exists")
        except Exception as e:
            print(f"Error creating user: {e}")
            raise
    
    async def get_user_by_email(self, email: str) -> Optional[User]:
        """Get user by email"""
        if not self._connected:
            await self.connect()
        
        email = email.lower()
        user_data = await self.users_collection.find_one({"email": email})
        
        if user_data:
            return User.from_dict(user_data)
        return None
    
    async def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Get user by ID"""
        if not self._connected:
            await self.connect()
        
        user_data = await self.users_collection.find_one({"id": user_id})
        
        if user_data:
            return User.from_dict(user_data)
        return None
    
    async def email_exists(self, email: str) -> bool:
        """Check if email exists"""
        if not self._connected:
            await self.connect()
        
        email = email.lower()
        count = await self.users_collection.count_documents({"email": email})
        return count > 0
    
    async def authenticate_user(self, email: str, password: str) -> Optional[User]:
        """Authenticate user with email and password"""
        user = await self.get_user_by_email(email)
        
        if user and self.verify_password(password, user.password_hash):
            # Update last login
            await self.update_last_login(user.id)
            await self.reset_login_attempts(email)
            return user
        else:
            # Increment failed login attempts
            await self.increment_login_attempts(email)
            return None
    
    async def get_all_users(self) -> List[User]:
        """Get all users (for debugging)"""
        if not self._connected:
            await self.connect()
        
        cursor = self.users_collection.find({})
        users = []
        async for user_data in cursor:
            users.append(User.from_dict(user_data))
        return users
    
    async def get_user_count(self) -> int:
        """Get total user count"""
        if not self._connected:
            await self.connect()
        
        return await self.users_collection.count_documents({})
    
    async def update_last_login(self, user_id: str) -> bool:
        """Update user's last login time"""
        if not self._connected:
            await self.connect()
        
        result = await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "last_login": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def increment_login_attempts(self, email: str) -> int:
        """Increment login attempts for user"""
        if not self._connected:
            await self.connect()
        
        email = email.lower()
        result = await self.users_collection.update_one(
            {"email": email},
            {
                "$inc": {"login_attempts": 1},
                "$set": {"updated_at": datetime.utcnow()}
            }
        )
        
        # Get updated user to return login attempts count
        user_data = await self.users_collection.find_one({"email": email})
        return user_data.get("login_attempts", 0) if user_data else 0
    
    async def reset_login_attempts(self, email: str) -> bool:
        """Reset login attempts for user"""
        if not self._connected:
            await self.connect()
        
        email = email.lower()
        result = await self.users_collection.update_one(
            {"email": email},
            {
                "$set": {
                    "login_attempts": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0
    
    async def update_user(self, user_id: str, updates: dict) -> bool:
        """Update user information"""
        if not self._connected:
            await self.connect()
        
        updates["updated_at"] = datetime.utcnow()
        result = await self.users_collection.update_one(
            {"id": user_id},
            {"$set": updates}
        )
        return result.modified_count > 0
    
    async def delete_user(self, user_id: str) -> bool:
        """Delete user (soft delete - mark as inactive)"""
        if not self._connected:
            await self.connect()
        
        result = await self.users_collection.update_one(
            {"id": user_id},
            {
                "$set": {
                    "is_active": False,
                    "updated_at": datetime.utcnow()
                }
            }
        )
        return result.modified_count > 0

# Global database instance
user_db = UserDatabase()
