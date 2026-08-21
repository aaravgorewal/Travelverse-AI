import logging
import json
import asyncio
from typing import Dict, Any, List

from pydantic import BaseModel, Field

from app.schemas.copilot import CopilotChatRequest, CopilotChatResult, CopilotPackage, CopilotPackageItem
from app.ai.model_router import ModelRouter, TaskCategory
from app.ai.grounding_guard import GroundingGuard
from app.services.deal_scope import DealScopeService
from app.providers.tbo.client import TBOProvider
from app.providers.google_places import GooglePlacesProvider

logger = logging.getLogger(__name__)

class AIIntentParsed(BaseModel):
    intent_summary: str
    destination: str = ""
    duration_nights: int = 0
    budget: float = 0.0
    is_actionable: bool
    missing_info: str = ""

class AIPackageProposal(BaseModel):
    items: List[CopilotPackageItem]
    agent_notes: str

class CopilotService:
    """
    Massive orchestration engine for Travel Agents.
    Executes a 9-step pipeline blending LLM reasoning with strict Python arithmetic and validation.
    """
    
    INTENT_INSTRUCTION = """
    Parse the travel agent's natural language request.
    Extract the destination, duration, and budget.
    If it's actionable enough to start searching inventory, set is_actionable to true.
    """
    
    BUILDER_INSTRUCTION = """
    You are Agent Copilot. Build a package using ONLY the provided inventory.
    DO NOT invent hotels or flights.
    Leave subtotal, markup, and total fields empty/zero. Python will calculate those.
    Write honest agent_notes explaining the tradeoffs of this package vs the customer's budget.
    """

    def __init__(self, router: ModelRouter, guard: GroundingGuard, deal_scope: DealScopeService):
        self.router = router
        self.guard = guard
        self.deal_scope = deal_scope
        self.tbo = TBOProvider()
        self.places = GooglePlacesProvider()
        
    def _mock_get_customer_preferences(self, customer_id: str) -> List[str]:
        # Would normally hit DB
        return ["family-friendly", "beachfront", "under $3000"]

    async def handle_chat(self, request: CopilotChatRequest) -> CopilotChatResult:
        logger.info(f"Copilot received request from agent {request.agent_id}")
        
        # 1. Identify Customer & Intent (LLM)
        try:
            intent: AIIntentParsed = await self.router.generate_structured(
                task_category=TaskCategory.DATA_EXTRACTION,
                prompt=request.prompt,
                schema=AIIntentParsed,
                system_instruction=self.INTENT_INSTRUCTION
            )
        except Exception as e:
            logger.error(f"Failed to parse copilot intent: {e}")
            raise RuntimeError("Could not parse request.")
            
        if not intent.is_actionable:
            return CopilotChatResult(
                understanding=intent.intent_summary,
                status="needs_info",
                agent_notes="I need more details to build this.",
                missing_info_needed=intent.missing_info
            )
            
        # 2. Retrieve Preferences (Python)
        preferences = self._mock_get_customer_preferences(request.customer_id) if request.customer_id else []
        
        # 3. Search Inventory (Parallel)
        async def fetch_flights():
            return await self.tbo.search_flights("origin", intent.destination, "date")
            
        async def fetch_hotels():
            return await self.tbo.search_hotels(intent.destination, "date", "date")
            
        flights, hotels = await asyncio.gather(fetch_flights(), fetch_hotels())
        
        inventory_context = {
            "flights": flights,
            "hotels": hotels,
            "preferences": preferences
        }
        
        # 4 & 5. Compare & Build Package (LLM)
        prompt = f"""
        Budget: {intent.budget}
        Inventory Available:
        {json.dumps(inventory_context)}
        
        Select the best items to form a package.
        """
        
        try:
            proposal: AIPackageProposal = await self.router.generate_structured(
                task_category=TaskCategory.TRIP_PLANNING,
                prompt=prompt,
                schema=AIPackageProposal,
                system_instruction=self.BUILDER_INSTRUCTION
            )
        except Exception:
            raise RuntimeError("Failed to build package proposal.")
            
        # 6. Calculate Totals (STRICT BOUNDARY - Python)
        subtotal = sum(item.cost for item in proposal.items)
        markup = subtotal * 0.10 # 10% agent markup
        total = subtotal + markup
        
        final_package = CopilotPackage(
            items=proposal.items,
            subtotal=subtotal,
            markup=markup,
            total=total,
            currency="USD" # Assume USD for MVP
        )
        
        # 7. Validate Package (Python/Guard)
        guard_result = await self.guard.validate(
            json.dumps(final_package.model_dump()), 
            json.dumps(inventory_context)
        )
        
        agent_notes = proposal.agent_notes
        if guard_result.is_hallucination:
            agent_notes = "[WARNING: Guard detected potential hallucination in pricing or availability. Verify manually.]\n\n" + agent_notes
            
        # 8 & 9. Prepare Quotation (Python)
        return CopilotChatResult(
            understanding=intent.intent_summary,
            status="success",
            quotation=final_package,
            agent_notes=agent_notes
        )
