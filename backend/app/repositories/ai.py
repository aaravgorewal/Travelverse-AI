from sqlalchemy.orm import Session
from app.models.ai import Conversation, AIMemory
from app.models.rag import KnowledgeChunk
from .base import BaseRepository

class ConversationRepository(BaseRepository[Conversation]):
    def __init__(self):
        super().__init__(Conversation)

class MemoryRepository(BaseRepository[AIMemory]):
    def __init__(self):
        super().__init__(AIMemory)

class KnowledgeRepository(BaseRepository[KnowledgeChunk]):
    def __init__(self):
        super().__init__(KnowledgeChunk)
        
    def similarity_search(self, db: Session, query_embedding: list, limit: int = 5):
        # Uses pgvector cosine distance operator <=>
        return db.query(self.model).order_by(self.model.embedding.cosine_distance(query_embedding)).limit(limit).all()

conversation_repo = ConversationRepository()
memory_repo = MemoryRepository()
knowledge_repo = KnowledgeRepository()
