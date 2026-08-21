from sqlalchemy import Column, String, Integer, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import BaseModel

class Conversation(BaseModel):
    __tablename__ = "conversations"
    
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    title = Column(String, nullable=True)
    status = Column(String, default="active")
    
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

class Message(BaseModel):
    __tablename__ = "messages"
    
    conversation_id = Column(String, ForeignKey("conversations.id"), index=True, nullable=False)
    role = Column(String, nullable=False) # user, assistant, system
    content = Column(String, nullable=False)
    
    conversation = relationship("Conversation", back_populates="messages")

class AIMemory(BaseModel):
    __tablename__ = "ai_memory"
    
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=False)
    key = Column(String, nullable=False)
    value = Column(JSON, nullable=False)

class AIRequest(BaseModel):
    __tablename__ = "ai_requests"
    
    user_id = Column(String, ForeignKey("users.id"), index=True, nullable=True)
    endpoint = Column(String, nullable=False)
    payload = Column(JSON, nullable=True)

class AIResponse(BaseModel):
    __tablename__ = "ai_responses"
    
    request_id = Column(String, ForeignKey("ai_requests.id"), index=True, nullable=False)
    response_payload = Column(JSON, nullable=True)
    latency_ms = Column(Integer, nullable=True)

class AIAction(BaseModel):
    __tablename__ = "ai_actions"
    
    response_id = Column(String, ForeignKey("ai_responses.id"), index=True, nullable=False)
    action_type = Column(String, nullable=False)
    parameters = Column(JSON, nullable=True)

class KnowledgeDocument(BaseModel):
    __tablename__ = "knowledge_documents"
    
    title = Column(String, nullable=False)
    source_url = Column(String, nullable=True)
    content_type = Column(String, nullable=True)
    
    chunks = relationship("KnowledgeChunk", back_populates="document", cascade="all, delete-orphan")

class KnowledgeChunk(BaseModel):
    __tablename__ = "knowledge_chunks"
    
    document_id = Column(String, ForeignKey("knowledge_documents.id"), index=True, nullable=False)
    content = Column(String, nullable=False)
    # Note: embedding column would go here (pgvector)
    
    document = relationship("KnowledgeDocument", back_populates="chunks")
