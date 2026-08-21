import logging
import json
from typing import List, Dict

from app.schemas.local_sense import DestinationKnowledgeRequest, DestinationKnowledgeResult, RAGSource
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
    2. If no reliable source exists in the Context, you MUST say that the information is unavailable.
    3. You MUST strictly categorize your response into four buckets: culture_and_etiquette, food_and_transport, general_advice, official_regulations.
    4. Put soft norms ("Tipping 10% is customary") in general_advice or culture.
    5. Put hard rules ("A tourist visa is required") in official_regulations.
    """

    def __init__(self, router: ModelRouter):
        self.router = router
        self.rag = RagPipelineService()

    async def get_destination_knowledge(self, request: DestinationKnowledgeRequest, is_authorized: bool = True) -> DestinationKnowledgeResult:
        logger.info(f"Retrieving destination knowledge for {request.destination}")
        
        # Security Check: Mocking an authorization check for the documents
        if not is_authorized:
            logger.warning("Unauthorized access to RAG documents requested.")
            return DestinationKnowledgeResult(
                culture_and_etiquette="Information unavailable due to authorization.",
                food_and_transport="Information unavailable due to authorization.",
                general_advice=["Information unavailable."],
                official_regulations=["Information unavailable."],
                sources=[]
            )
            
        # 1. Real RAG Retrieval
        query = f"Destination: {request.destination}. Questions: {', '.join(request.specific_questions)}"
        retrieved_chunks = await self.rag.retrieve_context(
            query=query, 
            category_filter="destination", 
            top_k=5
        )
        
        # If no chunks were returned from the vector DB at all
        if not retrieved_chunks:
            return DestinationKnowledgeResult(
                culture_and_etiquette="Information is unavailable.",
                food_and_transport="Information is unavailable.",
                general_advice=["Information is unavailable."],
                official_regulations=["Information is unavailable."],
                sources=[]
            )
        
        # Format the retrieved chunks for the prompt
        rag_context = []
        sources = []
        for c in retrieved_chunks:
            rag_context.append({
                "source_id": c.chunk_id,
                "document_id": c.document_id,
                "text": c.text_content
            })
            sources.append(RAGSource(
                source_id=c.document_id,
                source_title=c.source_title,
                source_type=c.source_type
            ))
        
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
            
            # Embed the strictly enforced sources
            result.sources = sources
            return result
            
        except Exception as e:
            logger.error(f"LocalSense AI generation failed: {e}")
            raise RuntimeError("Failed to generate destination knowledge.")
