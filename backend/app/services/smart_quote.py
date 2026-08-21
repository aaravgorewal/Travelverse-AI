import logging
import json

from app.schemas.smart_quote import QuoteRequest, SmartQuoteResult
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class SmartQuoteService:
    """
    Generates professional quotation content for the document generation service.
    Strictly forbidden from inventing prices or inventory details.
    """
    
    SYSTEM_INSTRUCTION = """
    You are SmartQuote for TRAVELVERSE AI. Your job is to format provided package data into a beautiful, professional quotation document structure.
    
    CRITICAL RULES:
    1. NEVER invent prices, booking IDs, hotel information, or flight information.
    2. ONLY use the 'confirmed_details' and 'price' provided in the raw package data.
    3. Generate a warm, welcoming tone suitable for a premium travel agency.
    4. Group items logically (e.g. all flights in one section, all hotels in another).
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def generate_quote(self, request: QuoteRequest) -> SmartQuoteResult:
        logger.info(f"Generating SmartQuote for {request.customer_name} on package {request.package_name}")
        
        prompt = f"""
        Customer Name: {request.customer_name}
        Agent Name: {request.agent_name}
        Package Name: {request.package_name}
        Total Price: {request.total_price} {request.currency}
        
        Package Items (Raw Data from Backend):
        {json.dumps([item.model_dump() for item in request.items], indent=2)}
        
        Please transform this raw data into structured quotation sections.
        """
        
        try:
            result: SmartQuoteResult = await self.router.generate_structured(
                task_category=TaskCategory.DATA_EXTRACTION, # Document formatting task
                prompt=prompt,
                schema=SmartQuoteResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            return result
            
        except Exception as e:
            logger.error(f"SmartQuote AI generation failed: {e}")
            raise RuntimeError("Failed to generate quotation content.")
