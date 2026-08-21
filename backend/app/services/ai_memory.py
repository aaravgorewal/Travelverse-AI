import logging
import uuid
import datetime
from typing import List, Dict, Any, Optional

from app.schemas.ai_memory import (
    MemoryCategory, SaveMemoryRequest, RetrieveMemoryRequest, 
    DeleteMemoryRequest, MemoryItem, MemoryResult, MemorySummary
)
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class FilteredMemory(MemorySummary):
    pass

class AIMemoryService:
    """
    Manages semantic AI memory across conversations and trips.
    Enforces privacy by stripping sensitive data before storing.
    """
    
    FILTER_INSTRUCTION = """
    You are a Privacy Filter for TRAVELVERSE AI. Your job is to extract useful travel context from raw text, while discarding sensitive information.
    
    CRITICAL RULES:
    1. Extract ONLY useful travel info (e.g. preferences, dates, locations, dietary needs).
    2. DO NOT extract or store: credit card numbers, passwords, precise home addresses, or government IDs.
    3. Return a concise string representing the memory to store. If nothing is useful, return an empty string.
    """
    
    SUMMARY_INSTRUCTION = """
    You are a Memory Summarizer. Take the list of stored memories and write a concise, human-readable summary of the user's travel profile or trip status.
    """

    def __init__(self, router: ModelRouter):
        self.router = router
        # In memory mock DB since we don't have a real DB session wired in this layer
        self._mock_db: List[MemoryItem] = []

    async def save_memory(self, request: SaveMemoryRequest) -> Optional[MemoryItem]:
        logger.info(f"Extracting memory for user {request.user_id} in category {request.category}")
        
        # 1. Use AI to filter and extract ONLY safe, relevant travel data
        try:
            filtered: FilteredMemory = await self.router.generate_structured(
                task_category=TaskCategory.DATA_EXTRACTION,
                prompt=f"Raw text: {request.raw_text}",
                schema=FilteredMemory,
                system_instruction=self.FILTER_INSTRUCTION
            )
            
            if not filtered.summary.strip():
                logger.info("No actionable or safe memory found to store.")
                return None
                
            # 2. Store to DB (Mocked)
            new_memory = MemoryItem(
                id=str(uuid.uuid4()),
                category=request.category,
                content=filtered.summary,
                timestamp=datetime.datetime.utcnow().isoformat()
            )
            self._mock_db.append(new_memory)
            
            return new_memory
            
        except Exception as e:
            logger.error(f"Failed to save memory: {e}")
            raise RuntimeError("Memory extraction failed.")

    async def retrieve_memory(self, request: RetrieveMemoryRequest) -> MemoryResult:
        logger.info(f"Retrieving memory for user {request.user_id}")
        
        # Fetch from mocked DB
        results = [m for m in self._mock_db if m.id] # Simple mock constraint
        
        if request.category:
            results = [m for m in results if m.category == request.category]
            
        return MemoryResult(memories=results)

    async def delete_memory(self, request: DeleteMemoryRequest) -> bool:
        logger.info(f"Deleting memory {request.memory_id} for user {request.user_id}")
        
        original_length = len(self._mock_db)
        self._mock_db = [m for m in self._mock_db if m.id != request.memory_id]
        
        return len(self._mock_db) < original_length

    async def summarize_memory(self, request: RetrieveMemoryRequest) -> MemorySummary:
        logger.info(f"Summarizing memory for user {request.user_id}")
        
        memories = await self.retrieve_memory(request)
        if not memories.memories:
            return MemorySummary(summary="No memories recorded yet.")
            
        memory_texts = [m.content for m in memories.memories]
        
        try:
            summary: MemorySummary = await self.router.generate_structured(
                task_category=TaskCategory.DATA_EXTRACTION,
                prompt=f"Memories:\n" + "\n".join(memory_texts),
                schema=MemorySummary,
                system_instruction=self.SUMMARY_INSTRUCTION
            )
            return summary
            
        except Exception as e:
            logger.error(f"Failed to summarize memory: {e}")
            raise RuntimeError("Memory summarization failed.")
