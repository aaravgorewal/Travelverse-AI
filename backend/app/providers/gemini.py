import logging
from typing import Any, List, Optional, AsyncGenerator
from google import genai
from google.genai import types
from google.genai.errors import APIError

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

from app.core.config import settings
from .ai_base import (
    AIProvider,
    AIProviderException,
    AIRateLimitException,
    AIAuthException,
    AIUnavailableException,
    AIInvalidOutputException
)

logger = logging.getLogger(__name__)

def handle_gemini_error(e: Exception) -> Exception:
    """Maps Gemini SDK errors to our domain exceptions."""
    if isinstance(e, APIError):
        status_code = getattr(e, "code", 500)
        message = str(e).lower()
        
        if status_code == 401 or status_code == 403 or "api key" in message:
            return AIAuthException(f"Authentication failed: {e}")
        elif status_code == 429 or "quota" in message or "rate limit" in message:
            return AIRateLimitException(f"Rate limit exceeded: {e}")
        elif status_code >= 500:
            return AIUnavailableException(f"Provider unavailable: {e}")
    
    if isinstance(e, ValueError):
        return AIInvalidOutputException(f"Invalid output or payload: {e}")
        
    return AIProviderException(f"Unexpected AI error: {e}")

class GeminiProvider(AIProvider):
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not set. GeminiProvider will fail on generation.")
            self.client = None
        else:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        self.model = settings.GEMINI_MODEL

    def _ensure_client(self):
        if not self.client:
            raise AIAuthException("GEMINI_API_KEY is missing from configuration.")

    # Retry on Rate Limit or Unavailable (500s), stop after 4 attempts, wait exponentially.
    @retry(
        retry=retry_if_exception_type((AIRateLimitException, AIUnavailableException)),
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> str:
        self._ensure_client()
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=kwargs.get("temperature"),
                max_output_tokens=kwargs.get("max_tokens")
            )
            # using synchronous SDK methods for now unless the new async genai is fully supported in this env
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config
            )
            return response.text
        except Exception as e:
            raise handle_gemini_error(e)

    @retry(
        retry=retry_if_exception_type((AIRateLimitException, AIUnavailableException)),
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_structured(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, **kwargs) -> Any:
        self._ensure_client()
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=schema,
                temperature=kwargs.get("temperature", 0.1) # Lower temp for structured data
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config
            )
            return response.parsed
        except Exception as e:
            raise handle_gemini_error(e)

    async def stream(self, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        self._ensure_client()
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=kwargs.get("temperature"),
            )
            response_stream = self.client.models.generate_content_stream(
                model=self.model,
                contents=prompt,
                config=config
            )
            
            for chunk in response_stream:
                if chunk.text:
                    # Note: Using yield in an async def makes it an async generator
                    # The underlying SDK generator is synchronous, so this bridges it.
                    yield chunk.text
                    
        except Exception as e:
            raise handle_gemini_error(e)

    @retry(
        retry=retry_if_exception_type((AIRateLimitException, AIUnavailableException)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_with_tools(self, prompt: str, tools: List[Any], system_instruction: Optional[str] = None, **kwargs) -> Any:
        self._ensure_client()
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools,
                temperature=kwargs.get("temperature")
            )
            response = self.client.models.generate_content(
                model=self.model,
                contents=prompt,
                config=config
            )
            return response
        except Exception as e:
            raise handle_gemini_error(e)
