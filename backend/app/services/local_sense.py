import logging
from typing import List, Dict, Any

from app.schemas.local_sense import DestinationKnowledgeRequest, DestinationKnowledgeResult
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class LocalSenseService:
    """
    Destination intelligence engine.
    Uses RAG to pull cultural and regulatory context, separating soft advice from hard regulations.
    """
    
    SYSTEM_INSTRUCTION = """
    You are LocalSense for TRAVELVERSE AI. Your job is to extract and synthesize destination knowledge.
    
    CRITICAL RULES:
    1. Base your answer ONLY on the provided RAG Context Data.
    2. You MUST strictly separate soft cultural norms (general_advice) from hard legal/border rules (official_regulations).
       - "Tipping 10% is customary" -> general_advice
       - "A tourist visa is required for stays over 30 days" -> official_regulations
    3. Include the source identifiers from the Context Data in your 'sources' array.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def _mock_rag_retrieval(self, destination: str) -> List[Dict[str, str]]:
        """
        Mocks the vector DB retrieval until the pgvector ingestion pipeline is fully wired.
        """
        # In a real app, this would use a library like LangChain/LlamaIndex or raw pgvector SQL 
        # to embed the query and fetch top-K chunks.
        return [
            {
                "source_id": f"rag_doc_{destination.lower().replace(' ', '_')}_culture",
                "content": f"In {destination}, it is considered polite to dress modestly. Tipping is generally around 10-15%."
            },
            {
                "source_id": f"rag_doc_{destination.lower().replace(' ', '_')}_law",
                "content": f"Visitors to {destination} must carry a valid passport with at least 6 months validity. Certain medications are strictly prohibited by customs."
            },
            {
                "source_id": f"rag_doc_{destination.lower().replace(' ', '_')}_transit",
                "content": f"The public metro system in {destination} is highly efficient. Ride-sharing apps are widely available."
            }
        ]

    async def get_destination_knowledge(self, request: DestinationKnowledgeRequest) -> DestinationKnowledgeResult:
        logger.info(f"Fetching LocalSense knowledge for {request.destination}")
        
        # 1. RAG Retrieval (Mocked for MVP)
        rag_snippets = await self._mock_rag_retrieval(request.destination)
        
        # 2. Construct Prompt
        prompt = f"""
        Destination: {request.destination}
        User Specific Questions: {request.specific_questions}
        
        RAG Context Data (ONLY USE THIS DATA):
        {rag_snippets}
        
        Synthesize the knowledge. Remember to separate advice from strict regulations.
        """
        
        # 3. AI Synthesis
        try:
            result: DestinationKnowledgeResult = await self.router.generate_structured(
                task_category=TaskCategory.DESTINATION_INFO,
                prompt=prompt,
                schema=DestinationKnowledgeResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            return result
            
        except Exception as e:
            logger.error(f"LocalSense AI synthesis failed: {e}")
            raise RuntimeError("Failed to generate destination knowledge.")
