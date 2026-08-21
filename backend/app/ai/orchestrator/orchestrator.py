import logging
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.ai.providers.base import AIProvider
from app.ai.validators.structured import StructuredValidator
from app.repositories.user import user_repo
from app.repositories.trips import trip_repo
from app.repositories.ai import knowledge_repo, memory_repo
from .strategies import get_strategy

logger = logging.getLogger(__name__)

class TravelAIOrchestrator:
    def __init__(self, db: Session, provider: AIProvider):
        self.db = db
        self.provider = provider
        self.validator = StructuredValidator(provider)

    async def execute(self, feature_name: str, user_id: str, prompt: str, trip_id: str = None) -> BaseModel:
        logger.info(f"Orchestrator executing feature: {feature_name} for user: {user_id}")
        
        # 1. Intent Routing
        strategy = get_strategy(feature_name)
        
        # 2 & 3. User & Trip Context
        user_context = user_repo.get(self.db, id=user_id)
        trip_context = trip_repo.get(self.db, id=trip_id) if trip_id else None
        
        # 4 & 5. Memories & RAG Knowledge
        memories = memory_repo.get_multi(self.db, limit=5)
        # We would convert the prompt to embeddings here, but mocking for pipeline structure
        mock_embedding = [0.0] * 768 
        rag_context = knowledge_repo.similarity_search(self.db, query_embedding=mock_embedding, limit=3)
        
        # 6 & 7. Determine & Execute Tools (Simplified for structure)
        tools_output = {"weather": "Sunny", "tbo_pricing": "Available"}
        
        # 8. Construct Grounded Context
        context_dict = {
            "user": user_context.id if user_context else None,
            "trip": trip_id,
            "rag": [chunk.text for chunk in rag_context],
            "tools": tools_output
        }
        system_instruction = strategy.get_system_instruction(context_dict, context_dict)
        
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
