from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class MemoryCategory(str, Enum):
    CONVERSATION = "conversation"
    CURRENT_TRIP = "current_trip"
    USER_PREFERENCES = "user_preferences"
    CUSTOMER_PREFERENCES = "customer_preferences"

class SaveMemoryRequest(BaseModel):
    user_id: str
    category: MemoryCategory
    raw_text: str = Field(..., description="The raw conversational text to extract memory from")

class RetrieveMemoryRequest(BaseModel):
    user_id: str
    category: Optional[MemoryCategory] = None

class DeleteMemoryRequest(BaseModel):
    user_id: str
    memory_id: str

class MemoryItem(BaseModel):
    id: str
    category: MemoryCategory
    content: str
    timestamp: str

class MemoryResult(BaseModel):
    memories: List[MemoryItem]

class MemorySummary(BaseModel):
    summary: str
