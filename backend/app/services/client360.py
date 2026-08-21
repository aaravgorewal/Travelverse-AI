import logging
import json
from typing import Dict, Any

from app.schemas.client360 import PersonalizeRequest, PersonalizeResult, ClientSummary
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class Client360Service:
    """
    Customer intelligence engine for travel agents.
    Strictly forbids inference of sensitive characteristics (race, religion, health, etc.).
    """
    
    SYSTEM_INSTRUCTION = """
    You are Client360 for TRAVELVERSE AI. Your job is to summarize customer travel profiles.
    
    CRITICAL RULES:
    1. Base your summary ONLY on the raw booking history and preference data provided.
    2. DO NOT INFER SENSITIVE CHARACTERISTICS. Do not guess or comment on a user's race, religion, sexual orientation, political views, or health conditions.
    3. Return ONLY travel-relevant information.
    4. Format your output strictly according to the required schema.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _mock_fetch_customer_data(self, customer_id: str) -> Dict[str, Any]:
        """
        Mock DB fetch of raw customer history.
        """
        return {
            "name": "Jane Doe",
            "raw_preferences": ["window seat", "vegetarian meals", "marriott bonvoy gold"],
            "past_bookings": [
                {"destination": "Tokyo", "type": "Flight+Hotel", "lead_time_days": 45, "total_cost": 3200, "hotel_class": "4-star"},
                {"destination": "Cancun", "type": "All-Inclusive Resort", "lead_time_days": 60, "total_cost": 2500, "hotel_class": "4-star"},
                {"destination": "London", "type": "Flight Only", "lead_time_days": 14, "total_cost": 1200}
            ],
            "support_tickets": [
                {"issue": "Flight cancelled, requested rebooking", "resolution": "Rebooked on next flight"}
            ]
        }

    async def personalize(self, request: PersonalizeRequest) -> PersonalizeResult:
        logger.info(f"Generating Client360 summary for customer {request.customer_id} (Agent: {request.agent_id})")
        
        # 1. Fetch Authorized Data
        # In a real system, we would first validate that request.agent_id has permission 
        # to view request.customer_id's data.
        raw_data = self._mock_fetch_customer_data(request.customer_id)
        
        # 2. Construct Prompt
        prompt = f"""
        Customer Raw Data:
        {json.dumps(raw_data, indent=2)}
        
        Synthesize this raw data into a structured Client360 summary.
        Remember: Strictly adhere to the rules prohibiting inference of sensitive characteristics.
        """
        
        # 3. AI Generation
        try:
            summary: ClientSummary = await self.router.generate_structured(
                task_category=TaskCategory.DATA_EXTRACTION,
                prompt=prompt,
                schema=ClientSummary,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            return PersonalizeResult(
                customer_name=raw_data.get("name", "Unknown Customer"),
                summary=summary,
                warnings=["Data access logged for auditing purposes."]
            )
            
        except Exception as e:
            logger.error(f"Client360 AI synthesis failed: {e}")
            raise RuntimeError("Failed to generate client summary.")
