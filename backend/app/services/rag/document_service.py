from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.rag import RAGDocument, RAGDocumentChunk
from typing import List

class DocumentService:
    async def create_document(self, session: AsyncSession, category: str, title: str, source_url: str = None, 
                              destination: str = None, document_type: str = None, language: str = "en", 
                              role: str = "public", source: str = None, version: str = None) -> RAGDocument:
        
        doc = RAGDocument(
            category=category,
            title=title,
            source_url=source_url,
            destination=destination,
            document_type=document_type,
            language=language,
            role=role,
            source=source,
            version=version
        )
        session.add(doc)
        await session.flush()
        return doc

    async def add_chunks(self, session: AsyncSession, document_id, chunks: List[str], embeddings: List[List[float]]):
        for idx, (text_chunk, embed_vector) in enumerate(zip(chunks, embeddings)):
            chunk = RAGDocumentChunk(
                document_id=document_id,
                chunk_index=idx,
                text_content=text_chunk,
                embedding=embed_vector
            )
            session.add(chunk)
        await session.flush()
