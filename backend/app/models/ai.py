from sqlalchemy import Column, String, ForeignKey, JSON
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
    prompt = Column(String)

class AIResponse(Base):
    __tablename__ = "ai_responses"
    request_id = Column(ForeignKey("ai_requests.id", ondelete="CASCADE"))
    content = Column(String)

class AIAction(Base):
    __tablename__ = "ai_actions"
    response_id = Column(ForeignKey("ai_responses.id", ondelete="CASCADE"))
    action_type = Column(String)
