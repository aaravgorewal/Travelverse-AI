from sqlalchemy import Column, String, ForeignKey, Index, JSON, Integer
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector
from app.core.config import settings
from .base import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    title = Column(String)
    source = Column(String)
    source_url = Column(String)
    license = Column(String)
    document_type = Column(String)
    destination_id = Column(UUID(as_uuid=True), ForeignKey("destinations.id", ondelete="SET NULL"), nullable=True)
    language = Column(String, default="en")
    version = Column(String)
    content = Column(String)

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    document_id = Column(ForeignKey("knowledge_documents.id", ondelete="CASCADE"))
    chunk_index = Column(Integer)
    text = Column(String)
    metadata_json = Column(JSON, default=dict)
    
    # Configure vector column using the dimension from environment settings
    embedding = Column(Vector(settings.VECTOR_DIMENSION))
    
    __table_args__ = (
        Index(
            "ix_knowledge_chunks_embedding",
            "embedding",
            postgresql_using="hnsw",
            postgresql_with={"m": 16, "ef_construction": 64},
            postgresql_ops={"embedding": "vector_cosine_ops"},
        ),
    )

# Legacy Aliases
RAGDocument = KnowledgeDocument
RAGDocumentChunk = KnowledgeChunk
