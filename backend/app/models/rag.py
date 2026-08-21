from sqlalchemy import Uuid, Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from typing import List

from .base import BaseModel

class RAGDocument(BaseModel):
    """
    Represents an ingested document (e.g., TBO Policy, Destination Guide).
    """
    __tablename__ = "rag_documents"

    category = Column(String(50), index=True, nullable=False) # 'destination', 'tbo_policy', 'support'
    title = Column(String(255), nullable=False)
    source_url = Column(String(255), nullable=True)
    destination = Column(String(100), index=True, nullable=True)
    document_type = Column(String(50), index=True, nullable=True)
    language = Column(String(10), index=True, default="en")
    role = Column(String(20), index=True, default="public") # 'agent', 'traveler', 'public'
    source = Column(String(100), index=True, nullable=True)
    version = Column(String(20), index=True, nullable=True)
    
    chunks = relationship("RAGDocumentChunk", back_populates="document", cascade="all, delete-orphan")

class RAGDocumentChunk(BaseModel):
    """
    Represents a specific semantic chunk of a document, with its vector embedding.
    """
    __tablename__ = "rag_document_chunks"

    document_id = Column(Uuid, ForeignKey("rag_documents.id", ondelete="CASCADE"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    
    # 768 is the typical dimension for text-embedding models (like Gemini's text-embedding-004)
    embedding = Column(Vector(768))
    
    document = relationship("RAGDocument", back_populates="chunks")
