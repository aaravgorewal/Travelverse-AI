from typing import List
from app.providers.embedding import GeminiEmbeddingProvider

class EmbeddingService:
    def __init__(self):
        self.provider = GeminiEmbeddingProvider()

    async def embed_texts(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        return await self.provider.get_embeddings(texts)
        
    async def embed_query(self, query: str) -> List[float]:
        embeddings = await self.provider.get_embeddings([query])
        return embeddings[0] if embeddings else []
