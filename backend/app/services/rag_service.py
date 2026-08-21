from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from app.models.rag import KnowledgeDocument, KnowledgeChunk
from app.repositories.base import BaseRepository
from app.ai.providers.embeddings.base import EmbeddingProvider
from app.schemas.rag import RAGContext

# 1. Repositories
class DocumentRepository(BaseRepository[KnowledgeDocument]):
    def __init__(self):
        super().__init__(KnowledgeDocument)
        
    def get_by_source_url(self, db: Session, source_url: str):
        return db.query(self.model).filter(self.model.source_url == source_url).first()

class ChunkRepository(BaseRepository[KnowledgeChunk]):
    def __init__(self):
        super().__init__(KnowledgeChunk)
        
    def advanced_similarity_search(
        self, 
        db: Session, 
        query_embedding: List[float], 
        destination_id: Optional[UUID] = None,
        language: str = "en",
        user_role: str = "traveler",
        limit: int = 5,
        threshold: float = 0.75
    ) -> List[RAGContext]:
        """
        Executes a heavily filtered semantic search joining chunks and documents.
        Enforces geographic filtering, authorization guardrails, and relevance thresholding.
        """
        # Calculate cosine distance (pgvector uses `<=>`)
        distance_col = KnowledgeChunk.embedding.cosine_distance(query_embedding).label("distance")
        
        # Build base query joining chunks to their parent documents
        stmt = (
            select(KnowledgeChunk, KnowledgeDocument, distance_col)
            .join(KnowledgeDocument, KnowledgeChunk.document_id == KnowledgeDocument.id)
        )
        
        # Build strict filters
        filters = [KnowledgeDocument.language == language]
        
        if destination_id:
            filters.append(KnowledgeDocument.destination_id == destination_id)
            
        # Enforce Authorization: Travelers cannot see internal agent documents
        if user_role == "traveler":
            # Assuming metadata_json {"internal_agent_only": true} marks restricted docs
            # SQLAlchemy JSON filtering syntax:
            filters.append(
                KnowledgeChunk.metadata_json.op("->>")("internal_agent_only").is_(None) |
                (KnowledgeChunk.metadata_json.op("->>")("internal_agent_only") == 'false')
            )
            
        stmt = stmt.where(and_(*filters))
        
        # Order by closest semantic distance (smallest distance = highest similarity)
        stmt = stmt.order_by(distance_col).limit(limit)
        
        results = db.execute(stmt).all()
        
        contexts = []
        for chunk, doc, distance in results:
            # Convert distance (0 = identical, 2 = opposites) to similarity score (1 = identical, -1 = opposite)
            similarity_score = 1.0 - distance
            
            # Threshold Cutoff: Do not return unrelated documents
            if similarity_score >= threshold:
                contexts.append(
                    RAGContext(
                        content=chunk.text,
                        source=doc.source,
                        source_url=doc.source_url,
                        document_id=doc.id,
                        relevance_score=similarity_score
                    )
                )
                
        return contexts

# 2. Services
class RetrievalService:
    def __init__(self):
        self.chunk_repo = ChunkRepository()
        
    def retrieve(
        self, 
        db: Session, 
        query_embedding: List[float], 
        destination_id: Optional[UUID] = None,
        language: str = "en",
        user_role: str = "traveler",
        limit: int = 5
    ) -> List[RAGContext]:
        return self.chunk_repo.advanced_similarity_search(
            db=db,
            query_embedding=query_embedding,
            destination_id=destination_id,
            language=language,
            user_role=user_role,
            limit=limit,
            threshold=0.75 # Hardcoded threshold to prevent hallucinations
        )

class RAGService:
    def __init__(self, embedding_provider: EmbeddingProvider):
        self.embedding_provider = embedding_provider
        self.retrieval_service = RetrievalService()
        
    async def query(
        self, 
        db: Session, 
        query_text: str, 
        destination_id: Optional[UUID] = None,
        language: str = "en",
        user_role: str = "traveler",
        limit: int = 5
    ) -> List[RAGContext]:
        """
        Top-level orchestrator for the Semantic RAG pipeline.
        Converts query to embedding -> Retrieves highly-filtered contexts.
        """
        query_embedding = await self.embedding_provider.get_embedding(query_text)
        
        return self.retrieval_service.retrieve(
            db=db, 
            query_embedding=query_embedding, 
            destination_id=destination_id,
            language=language,
            user_role=user_role,
            limit=limit
        )

# Global singleton instances for repos
document_repo = DocumentRepository()
chunk_repo = ChunkRepository()
