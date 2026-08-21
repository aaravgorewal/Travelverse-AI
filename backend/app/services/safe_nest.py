import logging
import json
from typing import List, Dict, Any

from app.schemas.safe_nest import SupportRequest, SupportResult, TrustedResource
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class SafeNestService:
    """
    Emergency and support handling engine.
    Strictly forbids the invention of phone numbers or emergency contacts.
    """
    
    SYSTEM_INSTRUCTION = """
    You are SafeNest for TRAVELVERSE AI. Your job is to provide safe, actionable support advice.
    
    CRITICAL RULES:
    1. NEVER INVENT OR HALLUCINATE PHONE NUMBERS OR CONTACT INFO.
    2. Only populate the `trusted_resources` array with exactly the contacts provided in the VERIFIED BACKEND SOURCES.
    3. If no verified contact is provided for the user's specific problem, advise them to use local official channels or search online, but DO NOT provide a fake number.
    4. Focus on safety first in `immediate_steps`.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _get_verified_contacts(self, location: str) -> List[Dict[str, str]]:
        """
        Mock database lookup for verified emergency numbers.
        """
        # In reality, this would query a database of verified global emergency numbers and embassy contacts.
        contacts = [
            {"name": "Travelverse Global Support", "contact_info": "+1-800-555-0199", "type": "Internal Support"}
        ]
        
        if location and "paris" in location.lower():
            contacts.append({"name": "France Police", "contact_info": "17", "type": "Local Emergency"})
            contacts.append({"name": "France Medical", "contact_info": "15", "type": "Local Emergency"})
        elif location and "tokyo" in location.lower():
            contacts.append({"name": "Japan Police", "contact_info": "110", "type": "Local Emergency"})
            contacts.append({"name": "Japan Ambulance/Fire", "contact_info": "119", "type": "Local Emergency"})
            
        return contacts

    async def get_support(self, request: SupportRequest) -> SupportResult:
        logger.info(f"Generating SafeNest support for problem: {request.problem_description}")
        
        # 1. Fetch Verified Sources
        verified_contacts = self._get_verified_contacts(request.location)
        
        # 2. Construct Prompt
        prompt = f"""
        User Problem: {request.problem_description}
        Location: {request.location or 'Unknown'}
        
        VERIFIED BACKEND SOURCES (You may ONLY use these contacts):
        {json.dumps(verified_contacts, indent=2)}
        
        Provide actionable, safe advice and map the exact verified contacts.
        """
        
        # 3. AI Generation
        try:
            result: SupportResult = await self.router.generate_structured(
                task_category=TaskCategory.CUSTOMER_SUPPORT,
                prompt=prompt,
                schema=SupportResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            return result
            
        except Exception as e:
            logger.error(f"SafeNest AI generation failed: {e}")
            raise RuntimeError("Failed to generate support advice.")
