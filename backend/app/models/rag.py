from sqlalchemy import Column, String, Integer, Text, ForeignKey
from sqlalchemy.orm import relationship
from pgvector.sqlalchemy import Vector
from typing import List

from .base import Base, TimestampMixin

class RAGDocument(Base, TimestampMixin):
    """
    Represents an ingested document (e.g., TBO Policy, Destination Guide).
    """
    __tablename__ = "rag_documents"

    id = Column(String(50), primary_key=True)
    category = Column(String(50), index=True, nullable=False) # 'destination', 'tbo_policy', 'support'
    title = Column(String(255), nullable=False)
    source_url = Column(String(255), nullable=True)
    
    chunks = relationship("RAGDocumentChunk", back_populates="document", cascade="all, delete-orphan")

class RAGDocumentChunk(Base, TimestampMixin):
    """
    Represents a specific semantic chunk of a document, with its vector embedding.
    """
    __tablename__ = "rag_document_chunks"

    id = Column(String(50), primary_key=True)
    document_id = Column(String(50), ForeignKey("rag_documents.id"), nullable=False)
    chunk_index = Column(Integer, nullable=False)
    text_content = Column(Text, nullable=False)
    
    # 768 is the typical dimension for text-embedding models (like Gemini's text-embedding-004)
    embedding = Column(Vector(768))
    
    document = relationship("RAGDocument", back_populates="chunks")
