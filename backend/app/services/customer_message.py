import logging
import json

from app.schemas.customer_message import CustomerMessageRequest, CustomerMessageResult
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class CustomerMessageService:
    """
    Generates customer-facing communications (emails, SMS, chat).
    Strictly forbidden from inventing booking information, dates, or prices.
    """
    
    SYSTEM_INSTRUCTION = """
    You are the Customer Message Generator for TRAVELVERSE AI. 
    Your job is to draft outbound communications on behalf of travel agents.
    
    CRITICAL RULES:
    1. NEVER invent booking IDs, prices, flight times, or hotel names.
    2. ONLY use the data provided in the `trip_details` JSON.
    3. Adopt the requested tone (e.g. professional, warm, urgent).
    4. Clearly state the purpose of the message based on the `message_type`.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def generate_message(self, request: CustomerMessageRequest) -> CustomerMessageResult:
        logger.info(f"Generating '{request.message_type}' message for customer {request.customer_name}")
        
        prompt = f"""
        Message Type: {request.message_type}
        Customer Name: {request.customer_name}
        Agent Name: {request.agent_name}
        Requested Tone: {request.tone}
        
        Trip Details (Verified Data):
        {json.dumps(request.trip_details, indent=2)}
        
        Draft the message exactly according to the schema.
        """
        
        try:
            result: CustomerMessageResult = await self.router.generate_structured(
                task_category=TaskCategory.DATA_EXTRACTION, # Text formatting task
                prompt=prompt,
                schema=CustomerMessageResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            return result
            
        except Exception as e:
            logger.error(f"Customer Message AI generation failed: {e}")
            raise RuntimeError("Failed to generate customer message.")
