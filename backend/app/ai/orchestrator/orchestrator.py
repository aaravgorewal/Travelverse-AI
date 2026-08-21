import logging
from typing import Optional
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.ai.providers.base import AIProvider
from app.ai.providers.embeddings.gemini import GeminiEmbeddingProvider
from app.ai.validators.structured import StructuredValidator
from app.repositories.user import user_repo
from app.repositories.trips import trip_repo
from app.repositories.ai import memory_repo
from app.services.rag_service import RAGService
from .strategies import get_strategy

logger = logging.getLogger(__name__)

class TravelAIOrchestrator:
    def __init__(self, db: Session, provider: AIProvider):
        self.db = db
        self.provider = provider
        self.validator = StructuredValidator(provider)
        
        # Initialize RAG Service with the Gemini Embedding Provider
        self.embedding_provider = GeminiEmbeddingProvider()
        self.rag_service = RAGService(self.embedding_provider)

    async def execute(self, feature_name: str, user_id: str, prompt: str, trip_id: Optional[str] = None, destination_id: Optional[str] = None) -> BaseModel:
        logger.info(f"Orchestrator executing feature: {feature_name} for user: {user_id}")
        
        # 1. Intent Routing
        strategy = get_strategy(feature_name)
        
        # 2 & 3. User & Trip Context
        user_context = user_repo.get(self.db, id=user_id)
        trip_context = trip_repo.get(self.db, id=trip_id) if trip_id else None
        
        # 4 & 5. Memories & Live RAG Knowledge
        memories = memory_repo.get_multi(self.db, limit=5)
        
        # Determine language and role (mocked extraction for demo, should come from user_context)
        language = "en"
        user_role = "traveler"
        
        # Execute Semantic RAG Retrieval
        rag_results = await self.rag_service.query(
            db=self.db,
            query_text=prompt,
            destination_id=destination_id,
            language=language,
            user_role=user_role,
            limit=5
        )
        
        rag_context_strings = [
            f"Source: {ctx.source}\nContent: {ctx.content}" 
            for ctx in rag_results
        ]
        
        # 6 & 7. Determine & Execute Tools (Simplified for structure)
        tools_output = {"weather": "Sunny", "tbo_pricing": "Available"}
        
        # 8. Construct Grounded Context
        context_dict = {
            "user": user_context.id if user_context else None,
            "trip": trip_id,
            "tools": tools_output
        }
        
        # Generate Feature-Specific Instructions
        system_instruction = strategy.get_system_instruction(context_dict, context_dict, rag_context_strings)
        
        # Inject Universal Anti-Hallucination Directive
        system_instruction += (
            "\n\nCRITICAL INSTRUCTION: You must strictly use the provided RAG Context to answer factual questions. "
            "If the requested information is NOT explicitly found in the RAG Context, you must state that you do "
            "not have the information rather than inventing a response."
        )
        
        # 9, 10, 11. Gemini Invoke & Validate (The validator handles the retry loop)
        validated_response = await self.validator.safe_generate_structured(
            prompt=prompt,
            response_schema=strategy.response_schema,
            system_instruction=system_instruction
        )
        
        # 12. Grounding Checks (Deterministic Python Check)
        self._run_grounding_checks(validated_response, context_dict)
        
        # 13. Action Confirmation
        if strategy.requires_confirmation(validated_response):
            logger.warning(f"Action requires confirmation: {feature_name}")
            # Inject cryptographic confirmation token logic here
            setattr(validated_response, "requires_confirmation", True)
            setattr(validated_response, "confirmation_token", "jwt_signed_token_here")
            
        # 14. Return
        return validated_response

    def _run_grounding_checks(self, response: BaseModel, context: dict):
        # Example deterministic check: If response quotes a price, assert it exists in tools_output
        pass
