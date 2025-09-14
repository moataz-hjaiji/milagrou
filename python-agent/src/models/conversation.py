from typing import List, Optional, Literal
from pydantic import BaseModel, Field
from datetime import datetime
import time

class Message(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: float = Field(default_factory=time.time)

    class Config:
        json_encoders = {
            float: lambda v: v
        }

class Conversation(BaseModel):
    user_id: str
    messages: List[Message] = Field(default_factory=list)
    created_at: float = Field(default_factory=time.time)
    updated_at: float = Field(default_factory=time.time)

    class Config:
        json_encoders = {
            float: lambda v: v
        }

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    reply: str
    conversation_id: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

class ConversationHistoryResponse(BaseModel):
    messages: List[Message]
    total_messages: int
    conversation_id: Optional[str] = None
