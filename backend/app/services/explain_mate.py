import logging
import json

from app.schemas.explain_mate import ExplainRequest, ExplainResult
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class ExplainMateService:
    """
    Explains why a product was recommended based purely on the provided product data and user context.
    Does not invent features or prices.
    """
    
    SYSTEM_INSTRUCTION = """
    You are ExplainMate for TRAVELVERSE AI. 
    Your job is to explain why a specific product (hotel, flight, package) was recommended to the user.
    You must ONLY use the provided product data and the provided user context.
    DO NOT invent features, amenities, or prices that are not explicitly stated in the product data.
    Output EXACTLY the JSON schema requested.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def explain(self, request: ExplainRequest) -> ExplainResult:
        prompt = f"""
        User Context: {request.user_context}
        
        Product Data:
        {json.dumps(request.product.model_dump(), indent=2)}
        
        Provide the explanation, pros, cons, tradeoffs, and your confidence in this match.
        """
        
        try:
            result: ExplainResult = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=ExplainResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            return result
        except Exception as e:
            logger.error(f"ExplainMate AI reasoning failed: {e}")
            raise RuntimeError("Failed to generate explanation.")
