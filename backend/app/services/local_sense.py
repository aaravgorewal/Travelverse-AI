import logging
import json
from typing import List, Dict

from app.schemas.local_sense import DestinationKnowledgeRequest, DestinationKnowledgeResult
from app.ai.model_router import ModelRouter, TaskCategory
from app.services.rag_pipeline import RagPipelineService

logger = logging.getLogger(__name__)

class LocalSenseService:
    """
    Destination intelligence engine using RAG.
    Retrieves facts from database and strictly segregates soft advice from hard regulations.
    """
    
    SYSTEM_INSTRUCTION = """
    You are LocalSense for TRAVELVERSE AI. Your job is to summarize destination knowledge based ONLY on the provided RAG chunks.
    
    CRITICAL RULES:
    1. Base your answer ONLY on the provided RAG Context. Do not invent cultural norms or laws.
    2. You MUST strictly categorize your response into four buckets: culture_and_etiquette, food_and_transport, general_advice, official_regulations.
    3. Put soft norms ("Tipping 10% is customary") in general_advice or culture.
    4. Put hard rules ("A tourist visa is required", "Alcohol is illegal") in official_regulations.
    5. You must include the source IDs of the chunks you used.
    """

    def __init__(self, router: ModelRouter):
        self.router = router
        self.rag = RagPipelineService()

    async def get_destination_knowledge(self, request: DestinationKnowledgeRequest) -> DestinationKnowledgeResult:
        logger.info(f"Retrieving destination knowledge for {request.destination}")
        
        # 1. Real RAG Retrieval
        query = f"Destination: {request.destination}. Questions: {', '.join(request.specific_questions)}"
        retrieved_chunks = await self.rag.retrieve_context(
            query=query, 
            category_filter="destination", 
            top_k=5
        )
        
        # Format the retrieved chunks for the prompt
        rag_context = []
        for c in retrieved_chunks:
            rag_context.append({
                "source_id": c.chunk_id,
                "document_id": c.document_id,
                "text": c.text_content
            })
            
        source_ids = [c["source_id"] for c in rag_context]
        
        # 2. Construct Prompt for Gemini
        prompt = f"""
        Destination: {request.destination}
        User Questions: {request.specific_questions}
        
        RAG Context (Use ONLY this data):
        {json.dumps(rag_context, indent=2)}
        
        Generate the structured destination profile.
        """
        
        # 3. AI Synthesis
        try:
            result: DestinationKnowledgeResult = await self.router.generate_structured(
                task_category=TaskCategory.KNOWLEDGE_RETRIEVAL,
                prompt=prompt,
                schema=DestinationKnowledgeResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            # Ensure sources are tracked
            result.sources = source_ids
            return result
            
        except Exception as e:
            logger.error(f"LocalSense AI generation failed: {e}")
            raise RuntimeError("Failed to generate destination knowledge.")
