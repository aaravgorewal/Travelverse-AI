from abc import ABC, abstractmethod
from typing import Any, AsyncGenerator, Dict, Optional, Type

class AIProvider(ABC):
    """
    Abstract base class for AI inference providers.
    Ensures strict adherence to domain-driven interfaces without leaking vendor-specific SDK logic into routers or repositories.
    """
    
    @abstractmethod
    async def generate_text(self, prompt: str, system_instruction: Optional[str] = None) -> str:
        """Generates raw text from a given prompt."""
        pass

    @abstractmethod
    async def generate_structured(self, prompt: str, schema: Type[Any], system_instruction: Optional[str] = None) -> Any:
        """Generates a structured Pydantic response enforcing strict schema output."""
        pass

    @abstractmethod
    async def stream(self, prompt: str, system_instruction: Optional[str] = None) -> AsyncGenerator[str, None]:
        """Streams text output chunk by chunk."""
        pass
