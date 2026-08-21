import logging
import asyncio
from typing import List
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type
from .base import EmbeddingProvider, EmbeddingValidationException

try:
    from google import genai
    from google.genai.errors import APIError
    HAS_SDK = True
except ImportError:
    HAS_SDK = False
    class APIError(Exception): pass

from app.core.config import settings

logger = logging.getLogger(__name__)

class ProviderUnavailableException(Exception):
    pass

class GeminiEmbeddingProvider(EmbeddingProvider):
    def __init__(self):
        if not HAS_SDK:
            logger.warning("google-genai SDK not installed. Running in mock embedding mode.")
            self.client = None
            return

        if not settings.GEMINI_API_KEY and not settings.MOCK_MODE:
            raise ProviderUnavailableException("Missing Gemini API Key for Embeddings.")

        if settings.GEMINI_API_KEY:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.client = None
            
        # Hardcoding the robust embedding model, but can be moved to config
        self.model_name = "text-embedding-004" 

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type(APIError)
    )
    async def _safe_embed_content(self, text: str) -> List[float]:
        if not self.client:
            if settings.MOCK_MODE:
                # Return a dummy vector of the exact right size
                return [0.0] * settings.VECTOR_DIMENSION
            raise ProviderUnavailableException("Gemini Client not initialized.")
            
        try:
            response = await self.client.aio.models.embed_content(
                model=self.model_name,
                contents=text
            )
            # The SDK returns an EmbedContentResponse. We extract the values.
            # Assuming a single string input yields a single embedding.
            embedding_values = response.embeddings[0].values
            return self._validate_dimension(embedding_values)
            
        except APIError as e:
            if e.code in [401, 403]:
                logger.error(f"Gemini Embedding Auth Failure: {e.message}")
                raise ProviderUnavailableException("Invalid Gemini Credentials.") from e
            logger.warning(f"Gemini Embedding API Error ({e.code}): retrying...")
            raise

    async def get_embedding(self, text: str) -> List[float]:
        return await self._safe_embed_content(text)

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        """
        Processes texts sequentially with a tiny delay to safely navigate strict rate limits.
        """
        results = []
        for text in texts:
            vec = await self._safe_embed_content(text)
            results.append(vec)
            # Tiny delay to prevent blowing out free-tier rate limits during mass ingestion
            await asyncio.sleep(0.1) 
        return results
