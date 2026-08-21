import logging
import asyncio
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
    if isinstance(e, asyncio.TimeoutError):
        return AIUnavailableException("Provider timed out.")
    if isinstance(e, APIError):
        status_code = getattr(e, "code", 500)
        message = str(e).lower()
        
        if status_code in (401, 403) or "api key" in message:
            return AIAuthException(f"Authentication failed: {e}")
        elif status_code == 429 or "quota" in message or "rate limit" in message:
            return AIRateLimitException(f"Rate limit exceeded: {e}")
        elif status_code >= 500:
            return AIUnavailableException(f"Provider unavailable: {e}")
    
    if isinstance(e, ValueError):
        return AIInvalidOutputException(f"Invalid output or payload: {e}")
        
    return AIProviderException(f"Unexpected AI error: {e}")

class GeminiProvider(AIProvider):
    """
    Robust Gemini Provider implementing strict async APIs, retries, 
    timeouts, rate limits, and zero-secret logging.
    """
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            logger.warning("GEMINI_API_KEY is not set. GeminiProvider will fail on generation.")
            self.client = None
        else:
            self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        
        self.default_model = settings.GEMINI_MODEL
        self.default_timeout = 30.0 # seconds

    def _ensure_client(self):
        if not self.client:
            raise AIAuthException("GEMINI_API_KEY is missing from configuration.")

    @retry(
        retry=retry_if_exception_type((AIRateLimitException, AIUnavailableException)),
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate(self, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> str:
        self._ensure_client()
        model_name = kwargs.get("model", self.default_model)
        timeout = kwargs.get("timeout", self.default_timeout)
        
        logger.info(f"Generating text with Gemini model: {model_name}. Prompt length: {len(prompt)} chars.")
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=kwargs.get("temperature"),
                max_output_tokens=kwargs.get("max_tokens")
            )
            
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                ),
                timeout=timeout
            )
            logger.info("Generation successful.")
            return response.text
        except Exception as e:
            logger.error(f"Gemini generation failed: {type(e).__name__}")
            raise handle_gemini_error(e)

    @retry(
        retry=retry_if_exception_type((AIRateLimitException, AIUnavailableException)),
        stop=stop_after_attempt(4),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_structured(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, **kwargs) -> Any:
        self._ensure_client()
        model_name = kwargs.get("model", self.default_model)
        timeout = kwargs.get("timeout", self.default_timeout)
        
        logger.info(f"Generating structured data with Gemini model: {model_name}. Schema: {schema.__name__ if hasattr(schema, '__name__') else type(schema)}")
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                response_mime_type="application/json",
                response_schema=schema,
                temperature=kwargs.get("temperature", 0.1)
            )
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                ),
                timeout=timeout
            )
            logger.info("Structured generation successful.")
            return response.parsed
        except Exception as e:
            logger.error(f"Gemini structured generation failed: {type(e).__name__}")
            raise handle_gemini_error(e)

    async def stream(self, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        self._ensure_client()
        model_name = kwargs.get("model", self.default_model)
        
        logger.info(f"Starting Gemini stream for model: {model_name}.")
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=kwargs.get("temperature"),
            )
            response_stream = await self.client.aio.models.generate_content_stream(
                model=model_name,
                contents=prompt,
                config=config
            )
            
            async for chunk in response_stream:
                if chunk.text:
                    yield chunk.text
                    
        except Exception as e:
            logger.error(f"Gemini streaming failed: {type(e).__name__}")
            raise handle_gemini_error(e)

    @retry(
        retry=retry_if_exception_type((AIRateLimitException, AIUnavailableException)),
        stop=stop_after_attempt(3),
        wait=wait_exponential(multiplier=1, min=2, max=10),
        reraise=True
    )
    async def generate_with_tools(self, prompt: str, tools: List[Any], system_instruction: Optional[str] = None, **kwargs) -> Any:
        self._ensure_client()
        model_name = kwargs.get("model", self.default_model)
        timeout = kwargs.get("timeout", self.default_timeout)
        
        logger.info(f"Generating with {len(tools)} tools using model: {model_name}.")
        try:
            config = types.GenerateContentConfig(
                system_instruction=system_instruction,
                tools=tools,
                temperature=kwargs.get("temperature")
            )
            response = await asyncio.wait_for(
                self.client.aio.models.generate_content(
                    model=model_name,
                    contents=prompt,
                    config=config
                ),
                timeout=timeout
            )
            return response
        except Exception as e:
            logger.error(f"Gemini tool generation failed: {type(e).__name__}")
            raise handle_gemini_error(e)
