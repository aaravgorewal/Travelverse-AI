from abc import ABC, abstractmethod
from typing import Any, Dict, List, Optional, AsyncGenerator

class AIProviderException(Exception):
    """Base exception for all AI Provider errors."""
    pass

class AIRateLimitException(AIProviderException):
    pass

class AIAuthException(AIProviderException):
    pass

class AIUnavailableException(AIProviderException):
    pass

class AIInvalidOutputException(AIProviderException):
    pass

class AIProvider(ABC):
    """
    Abstract interface for all LLM AI Providers.
    The application must rely on this interface, not specific SDKs.
    """
    
    @abstractmethod
    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> str:
        """Generates a plain text response."""
        pass

    @abstractmethod
    async def generate_structured(self, prompt: str, schema: Any, system_instruction: Optional[str] = None, **kwargs) -> Any:
        """Generates structured data conforming to a given Pydantic schema."""
        pass

    @abstractmethod
    async def stream(self, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        """Streams a text response chunk by chunk."""
        pass

    @abstractmethod
    async def generate_with_tools(self, prompt: str, tools: List[Any], system_instruction: Optional[str] = None, **kwargs) -> Any:
        """Generates a response with tool-calling capabilities."""
        pass
