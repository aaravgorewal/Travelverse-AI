from sqlalchemy.orm import Session
from app.models.rag import KnowledgeDocument, KnowledgeChunk
from app.repositories.base import BaseRepository

# 1. Repositories
class DocumentRepository(BaseRepository[KnowledgeDocument]):
    def __init__(self):
        super().__init__(KnowledgeDocument)
        
    def get_by_source_url(self, db: Session, source_url: str):
        return db.query(self.model).filter(self.model.source_url == source_url).first()

class ChunkRepository(BaseRepository[KnowledgeChunk]):
    def __init__(self):
        super().__init__(KnowledgeChunk)
        
    def similarity_search(self, db: Session, query_embedding: list, limit: int = 5):
        # Uses pgvector cosine distance operator <=>
        return db.query(self.model).order_by(self.model.embedding.cosine_distance(query_embedding)).limit(limit).all()

from app.ai.providers.embeddings.base import EmbeddingProvider

class RetrievalService:
    def __init__(self):
        self.chunk_repo = ChunkRepository()
        
    def retrieve(self, db: Session, query_embedding: list, limit: int = 5):
        # Can add pre/post filtering logic here (e.g., filter by destination_id)
        return self.chunk_repo.similarity_search(db, query_embedding, limit=limit)

class RAGService:
    def __init__(self, embedding_provider: EmbeddingProvider):
        self.embedding_provider = embedding_provider
        self.retrieval_service = RetrievalService()
        
    async def query(self, db: Session, query_text: str, limit: int = 5) -> list[KnowledgeChunk]:
        """
        Top-level orchestrator for the RAG pipeline.
        Converts query to embedding -> Retrieves chunks from DB.
        """
        query_embedding = await self.embedding_provider.get_embedding(query_text)
        return self.retrieval_service.retrieve(db, query_embedding, limit=limit)

# Global singleton instances for repos
document_repo = DocumentRepository()
chunk_repo = ChunkRepository()
# rag_service must now be instantiated with a concrete EmbeddingProvider (e.g. GeminiEmbeddingProvider) in the router/orchestrator
