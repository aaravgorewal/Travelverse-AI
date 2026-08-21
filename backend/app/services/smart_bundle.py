import logging
import json
import asyncio
from typing import List

from pydantic import BaseModel, Field

from app.schemas.smart_bundle import BundleRequest, SmartBundleResult, BundleComponent
from app.ai.model_router import ModelRouter, TaskCategory
from app.providers.tbo import TBOProvider
from app.providers.google_places import GooglePlacesProvider

logger = logging.getLogger(__name__)

class AIBundleProposal(BaseModel):
    package_name: str
    components: List[BundleComponent]
    tradeoffs: str
    warnings: List[str]

class SmartBundleService:
    """
    Creates travel packages. 
    Python fetches inventory and calculates totals. 
    Gemini selects the bundle and explains the tradeoffs.
    """
    
    SYSTEM_INSTRUCTION = """
    You are SmartBundle for TRAVELVERSE AI. Your job is to select the best components from the provided inventory to form a package.
    
    CRITICAL RULES:
    1. DO NOT invent prices or inventory. Use ONLY the items provided in the Context Data.
    2. Select exactly one flight, one hotel, one transfer (if applicable), and one experience to build the bundle.
    3. Explain the tradeoffs of this specific bundle (e.g., 'We chose a 4-star hotel to keep the flight direct').
    """

    def __init__(self, router: ModelRouter):
        self.router = router
        self.tbo = TBOProvider()
        self.places = GooglePlacesProvider()

    async def create_package(self, request: BundleRequest) -> SmartBundleResult:
        logger.info(f"Generating SmartBundle for {request.destination}")
        
        # 1. Fetch Backend Inventory (Parallel)
        async def fetch_flights():
            return await self.tbo.search_flights("origin", request.destination, request.dates)
            
        async def fetch_hotels():
            return await self.tbo.search_hotels(request.destination, request.dates, request.dates)
            
        async def fetch_experiences():
            return await self.places.search_places(f"Top experiences in {request.destination}")
            
        flights, hotels, experiences = await asyncio.gather(
            fetch_flights(), fetch_hotels(), fetch_experiences()
        )
        
        inventory_context = {
            "flights": flights,
            "hotels": hotels,
            "experiences": experiences
        }
        
        # 2. Construct Prompt for AI Selection
        prompt = f"""
        Destination: {request.destination}
        Preferences: {request.preferences}
        Budget target: {request.budget or 'None'}
        
        Available Inventory:
        {json.dumps(inventory_context, indent=2)}
        
        Select the best components to form a package.
        """
        
        # 3. AI Selection & Reasoning
        try:
            proposal: AIBundleProposal = await self.router.generate_structured(
                task_category=TaskCategory.TRIP_PLANNING,
                prompt=prompt,
                schema=AIBundleProposal,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
        except Exception as e:
            logger.error(f"SmartBundle AI generation failed: {e}")
            raise RuntimeError("Failed to build package proposal.")
            
        # 4. Deterministic Math (Python)
        total_price = 0.0
        for component in proposal.components:
            total_price += component.cost
            
        return SmartBundleResult(
            package_name=proposal.package_name,
            components=proposal.components,
            price=total_price,
            currency="USD",
            tradeoffs=proposal.tradeoffs,
            warnings=proposal.warnings
        )
