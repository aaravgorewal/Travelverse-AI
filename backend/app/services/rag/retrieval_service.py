from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import joinedload
from sqlalchemy import or_
from app.models.rag import RAGDocument, RAGDocumentChunk
from typing import List, Dict, Any, Optional

class RetrievalService:
    async def search(self, session: AsyncSession, query_embedding: List[float], filters: Dict[str, Any], user_role: str, top_k: int = 5):
        stmt = select(RAGDocumentChunk).join(RAGDocument).options(joinedload(RAGDocumentChunk.document))

        # Authorization: Only retrieve documents allowed for the current role
        if user_role == "traveler":
            stmt = stmt.where(or_(RAGDocument.role == "traveler", RAGDocument.role == "public"))
        elif user_role == "public":
            stmt = stmt.where(RAGDocument.role == "public")
        # Agent can see all

        # Metadata Filtering
        if filters:
            if "destination" in filters:
                stmt = stmt.where(RAGDocument.destination == filters["destination"])
            if "document_type" in filters:
                stmt = stmt.where(RAGDocument.document_type == filters["document_type"])
            if "language" in filters:
                stmt = stmt.where(RAGDocument.language == filters["language"])
            if "source" in filters:
                stmt = stmt.where(RAGDocument.source == filters["source"])
            if "version" in filters:
                stmt = stmt.where(RAGDocument.version == filters["version"])

        # Pgvector cosine distance
        stmt = stmt.order_by(RAGDocumentChunk.embedding.cosine_distance(query_embedding)).limit(top_k)
        
        result = await session.execute(stmt)
        chunks = result.scalars().all()
        
        retrieved_data = []
        for chunk in chunks:
            doc = chunk.document
            retrieved_data.append({
                "chunk_id": str(chunk.id),
                "document_id": str(doc.id),
                "text": chunk.text_content,
                "metadata": {
                    "title": doc.title,
                    "category": doc.category,
                    "source_url": doc.source_url,
                    "destination": doc.destination,
                    "document_type": doc.document_type,
                    "language": doc.language,
                    "role": doc.role,
                    "source": doc.source,
                    "version": doc.version
                }
            })
            
        return retrieved_data
