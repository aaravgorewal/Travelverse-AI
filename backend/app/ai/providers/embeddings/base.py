from abc import ABC, abstractmethod
from typing import List
from app.core.config import settings

class EmbeddingValidationException(Exception):
    pass

class EmbeddingProvider(ABC):
    """
    Abstract base class for generating text embeddings.
    Allows decoupling RAG systems from specific providers (e.g. Gemini, OpenAI, Local HuggingFace).
    """

    def _validate_dimension(self, embedding: List[float]) -> List[float]:
        """Ensures the generated embedding matches the strict pgvector dimension configuration."""
        if len(embedding) != settings.VECTOR_DIMENSION:
            raise EmbeddingValidationException(
                f"Generated embedding has dimension {len(embedding)}, "
                f"but PostgreSQL pgvector is configured for {settings.VECTOR_DIMENSION}."
            )
        return embedding

    @abstractmethod
    async def get_embedding(self, text: str) -> List[float]:
        """Generates a single vector embedding for a given text."""
        pass

    @abstractmethod
    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generates batch embeddings (e.g., for dataset ingestion)."""
        pass
