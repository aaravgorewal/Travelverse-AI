import json
import logging
from typing import Any, AsyncGenerator, Optional, Type
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

# Fallback imports to ensure code compiles in strict typing environments even if SDK is not yet installed
try:
    from google import genai
    from google.genai import types
    from google.genai.errors import APIError
    HAS_SDK = True
except ImportError:
    HAS_SDK = False
    class APIError(Exception): pass

from app.core.config import settings
from .base import AIProvider

logger = logging.getLogger(__name__)

class ProviderUnavailableException(Exception):
    pass

class AuthenticationException(Exception):
    pass

class GeminiProvider(AIProvider):
    def __init__(self):
        if not HAS_SDK:
            logger.warning("google-genai SDK not installed. Running in mock/degraded mode.")
            self.client = None
            return

        if not settings.GEMINI_API_KEY and not settings.MOCK_MODE:
            logger.error("GEMINI_API_KEY is missing, and MOCK_MODE is False. GeminiProvider cannot authenticate.")
            raise AuthenticationException("Missing Gemini API Key.")

        if settings.GEMINI_API_KEY:
            # We initialize standard SDK client. 
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        else:
            self.client = None
            
        self.default_model = settings.GEMINI_MODEL or "gemini-1.5-flash"

    # Robust Retry Logic: Exponential backoff max 5 times for Rate Limits (429) or Server Errors (503, 500)
    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(5),
        retry=retry_if_exception_type(APIError)
    )
    async def _safe_generate_content(self, model: str, contents: str, config: Optional[Any] = None):
        """Internal wrapped method to handle tenacity retries cleanly."""
        if not self.client:
            if settings.MOCK_MODE:
                return self._generate_mock_response(config)
            raise ProviderUnavailableException("Gemini Client not initialized.")
            
        try:
            return await self.client.aio.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
        except APIError as e:
            # If the error is auth-related (401, 403), do NOT retry. Fail fast.
            if e.code in [401, 403]:
                logger.error(f"Gemini Authentication Failure: {e.message}")
                raise AuthenticationException("Invalid Gemini Credentials.") from e
            logger.warning(f"Gemini API Error ({e.code}): retrying...")
            raise

    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        config = types.GenerateContentConfig(system_instruction=system_instruction) if system_instruction else None
        response = await self._safe_generate_content(
            model=self.default_model,
            contents=prompt,
            config=config
        )
        return response.text if response else ""

    async def generate_structured(self, prompt: str, schema: Type[Any], system_instruction: Optional[str] = None) -> Any:
        config = types.GenerateContentConfig(
            response_mime_type="application/json",
            response_schema=schema,
            system_instruction=system_instruction,
            temperature=0.0 # Force determinism for structured parsing
        )
        response = await self._safe_generate_content(
            model=self.default_model,
            contents=prompt,
            config=config
        )
        if not response or not response.text:
            raise ValueError("Received empty structured response from Gemini.")
            
        try:
            parsed = json.loads(response.text)
            return schema(**parsed)
        except Exception as e:
            logger.error(f"Failed to parse Gemini structured response into {schema.__name__}: {str(e)}")
            raise

    async def stream(self, prompt: str, system_instruction: Optional[str] = None) -> AsyncGenerator[str, None]:
        if not self.client:
            if settings.MOCK_MODE:
                yield "Running in Mock Mode. Stream unavailable."
                return
            raise ProviderUnavailableException("Gemini Client not initialized.")

        config = types.GenerateContentConfig(system_instruction=system_instruction) if system_instruction else None
        
        try:
            async for chunk in await self.client.aio.models.generate_content_stream(
                model=self.default_model,
                contents=prompt,
                config=config
            ):
                if chunk.text:
                    yield chunk.text
        except APIError as e:
            logger.error(f"Stream interrupted: {e.message}")
            raise ProviderUnavailableException("Stream failed midway.") from e

    def _generate_mock_response(self, config: Optional[Any] = None):
        """Generates a dummy response object when running completely offline in MOCK_MODE."""
        class MockResponse:
            text = '{"mock": "true", "message": "This is a deterministic offline response."}'
        
        # If they asked for structured JSON, we try to fulfill it via the schema dict if possible, 
        # but for this generic mock we just return valid text.
        return MockResponse()
