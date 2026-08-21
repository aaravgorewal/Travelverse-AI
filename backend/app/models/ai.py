from sqlalchemy import Column, String, ForeignKey, JSON, DateTime, Float, Boolean, Integer
from .base import Base

class Conversation(Base):
    __tablename__ = "conversations"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    context = Column(JSON, default=dict)

class Message(Base):
    __tablename__ = "messages"
    conversation_id = Column(ForeignKey("conversations.id", ondelete="CASCADE"))
    role = Column(String)
    content = Column(String)

class AIMemory(Base):
    __tablename__ = "ai_memory"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    memory_key = Column(String)
    memory_value = Column(JSON)

class AIRequest(Base):
    __tablename__ = "ai_requests"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    feature = Column(String, index=True)
    model = Column(String)
    request_timestamp = Column(DateTime)
    latency = Column(Float)
    success = Column(Boolean)
    error_code = Column(String, nullable=True)

class AIResponse(Base):
    __tablename__ = "ai_responses"
    request_id = Column(ForeignKey("ai_requests.id", ondelete="CASCADE"), unique=True)
    response_timestamp = Column(DateTime)
    validated = Column(Boolean, default=False)
    confidence = Column(Float, nullable=True)
    source_count = Column(Integer, default=0)

class AIAction(Base):
    __tablename__ = "ai_actions"
    response_id = Column(ForeignKey("ai_responses.id", ondelete="CASCADE"))
    action_type = Column(String)
