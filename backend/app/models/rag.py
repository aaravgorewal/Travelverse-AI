from sqlalchemy import Column, String, ForeignKey
# In a real setup we'd use pgvector here
# from pgvector.sqlalchemy import Vector
from .base import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    title = Column(String)
    content = Column(String)

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    document_id = Column(ForeignKey("knowledge_documents.id", ondelete="CASCADE"))
    text = Column(String)
    # embedding = Column(Vector(768))
