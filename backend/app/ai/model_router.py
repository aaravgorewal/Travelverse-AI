from typing import Any, List, Optional, AsyncGenerator
import logging

from app.core.config import settings
from app.providers.ai_base import AIProvider

logger = logging.getLogger(__name__)

class TaskCategory:
    CLASSIFICATION = "classification"
    SIMPLE_CHAT = "simple_chat"
    RECOMMENDATION = "recommendation"
    TRIP_PLANNING = "trip_planning"
    COMPLEX_REASONING = "complex_reasoning"
    SUMMARIZATION = "summarization"
    TRANSLATION = "translation"

class ModelRouter:
    """
    Routes AI tasks to the optimally configured model based on task complexity.
    This prevents hardcoding model names in feature logic.
    """
    
    def __init__(self, provider: AIProvider):
        self.provider = provider
        
        # Map task categories to the configured models
        self.routing_table = {
            TaskCategory.CLASSIFICATION: settings.MODEL_CLASSIFICATION,
            TaskCategory.SIMPLE_CHAT: settings.MODEL_SIMPLE_CHAT,
            TaskCategory.RECOMMENDATION: settings.MODEL_RECOMMENDATION,
            TaskCategory.TRIP_PLANNING: settings.MODEL_TRIP_PLANNING,
            TaskCategory.COMPLEX_REASONING: settings.MODEL_COMPLEX_REASONING,
            TaskCategory.SUMMARIZATION: settings.MODEL_SUMMARIZATION,
            TaskCategory.TRANSLATION: settings.MODEL_TRANSLATION,
        }

    def _get_model_for_task(self, task_category: str) -> str:
        model = self.routing_table.get(task_category)
        if not model:
            logger.warning(f"Unknown task category '{task_category}'. Defaulting to {settings.GEMINI_MODEL_DEFAULT}.")
            return settings.GEMINI_MODEL_DEFAULT
        return model

    async def generate_text(self, task_category: str, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> str:
        model = self._get_model_for_task(task_category)
        kwargs["model"] = model
        return await self.provider.generate_text(prompt, system_instruction, **kwargs)

    async def generate_structured(self, task_category: str, prompt: str, schema: Any, system_instruction: Optional[str] = None, **kwargs) -> Any:
        model = self._get_model_for_task(task_category)
        kwargs["model"] = model
        return await self.provider.generate_structured(prompt, schema, system_instruction, **kwargs)

    async def stream(self, task_category: str, prompt: str, system_instruction: Optional[str] = None, **kwargs) -> AsyncGenerator[str, None]:
        model = self._get_model_for_task(task_category)
        kwargs["model"] = model
        async for chunk in self.provider.stream(prompt, system_instruction, **kwargs):
            yield chunk

    async def generate_with_tools(self, task_category: str, prompt: str, tools: List[Any], system_instruction: Optional[str] = None, **kwargs) -> Any:
        model = self._get_model_for_task(task_category)
        kwargs["model"] = model
        return await self.provider.generate_with_tools(prompt, tools, system_instruction, **kwargs)
