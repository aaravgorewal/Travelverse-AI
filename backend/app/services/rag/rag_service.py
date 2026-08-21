from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any, Optional

from .chunk_service import ChunkService
from .embedding_service import EmbeddingService
from .document_service import DocumentService
from .retrieval_service import RetrievalService

class RAGService:
    """
    Main Orchestrator for the TRAVELVERSE RAG Pipeline.
    """
    def __init__(self):
        self.chunk_service = ChunkService()
        self.embedding_service = EmbeddingService()
        self.document_service = DocumentService()
        self.retrieval_service = RetrievalService()

    async def ingest_document(self, session: AsyncSession, category: str, title: str, text: str, 
                              source_url: str = None, destination: str = None, document_type: str = None, 
                              language: str = "en", role: str = "public", source: str = None, version: str = None) -> str:
        
        # 1. Chunk
        chunks = self.chunk_service.chunk_text(text)
        if not chunks:
            return None
            
        # 2. Embed
        embeddings = await self.embedding_service.embed_texts(chunks)
        
        # 3. Store Document
        doc = await self.document_service.create_document(
            session, category, title, source_url, destination, document_type, language, role, source, version
        )
        
        # 4. Store Chunks & Vectors
        await self.document_service.add_chunks(session, doc.id, chunks, embeddings)
        
        return str(doc.id)

    async def retrieve_context(self, session: AsyncSession, query: str, user_role: str, 
                               filters: Optional[Dict[str, Any]] = None, top_k: int = 5) -> List[Dict[str, Any]]:
        
        # 1. Embed Query
        query_embedding = await self.embedding_service.embed_query(query)
        if not query_embedding:
            return []
            
        # 2. Retrieve & Filter
        results = await self.retrieval_service.search(session, query_embedding, filters, user_role, top_k)
        
        # 3. Context Builder (Format for Gemini)
        # Results are already returned with source metadata. The LLM gets the raw array of dicts.
        return results
