import logging
from typing import List, Optional
from pydantic import BaseModel, Field

from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class GroundingGuardResult(BaseModel):
    is_hallucination: bool = Field(
        ..., 
        description="True if the response contains any invented or ungrounded claims regarding prices, availability, flights, hotels, weather, contacts, or policies."
    )
    detected_hallucinations: List[str] = Field(
        default_factory=list, 
        description="List of specific claims that could not be verified in the trusted context."
    )
    sanitized_text: str = Field(
        ..., 
        description="The modified response text where ungrounded claims are either removed or explicitly marked as estimates/uncertain."
    )


class GroundingGuard:
    """
    Validates AI claims against available trusted data.
    Never allows unsupported live claims to reach the frontend.
    """

    SYSTEM_INSTRUCTION = """
    You are a strict Grounding Guard for TRAVELVERSE AI.
    Your job is to read an AI-generated response and compare it against the Trusted Context.
    
    You must detect if the AI response invents or fabricates ANY of the following:
    - prices
    - availability
    - booking status
    - hotel features
    - flight details
    - weather
    - emergency contacts
    - policies
    
    If the AI claims a specific price, flight time, or availability that is NOT explicitly stated in the Trusted Context, it is a hallucination.
    
    If a claim cannot be grounded in the Trusted Context:
    1. Set is_hallucination to true.
    2. List the fabricated claims in detected_hallucinations.
    3. Rewrite the response in sanitized_text. Remove the fabricated claims entirely, OR rewrite them to explicitly state they are estimates/uncertain (e.g., "Prices typically range around... but please check live rates").
    
    If the response is fully grounded, return the original text in sanitized_text and is_hallucination = false.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def validate(self, ai_response_text: str, trusted_context: str) -> GroundingGuardResult:
        """
        Validates the text against the trusted context.
        Returns the sanitized text safely stripped of hallucinations.
        """
        prompt = f"Trusted Context:\n{trusted_context}\n\nAI Response to Validate:\n{ai_response_text}"
        
        try:
            # We use CLASSIFICATION or a fast model category for this secondary pass
            result: GroundingGuardResult = await self.router.generate_structured(
                task_category=TaskCategory.CLASSIFICATION,
                prompt=prompt,
                schema=GroundingGuardResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            if result.is_hallucination:
                logger.warning(f"GroundingGuard detected hallucinations: {result.detected_hallucinations}")
                
            return result
            
        except Exception as e:
            logger.error(f"GroundingGuard failed to execute: {e}. Defaulting to fail-safe mode.")
            # Fail-safe: if the guard itself crashes, we aggressively sanitize the output
            # to prevent potential hallucinated prices from leaking to the frontend.
            return GroundingGuardResult(
                is_hallucination=True,
                detected_hallucinations=["Guard execution failed"],
                sanitized_text="I'm sorry, I cannot verify the exact details right now. Please rely on live search results for accurate prices and availability."
            )
