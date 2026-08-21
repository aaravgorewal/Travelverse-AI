import logging
import json
import asyncio
from typing import Dict, Any, List

from app.schemas.trip_genie import TripPlanningRequest, TripPlanResult, TripDay
from app.ai.model_router import ModelRouter, TaskCategory
from app.ai.grounding_guard import GroundingGuard
from app.providers.google_places import GooglePlacesProvider
from app.providers.weather import WeatherProvider
from app.providers.tbo import TBOProvider

logger = logging.getLogger(__name__)

class AITripResponse(BaseModel):
    """Temporary schema for AI to output before Python math"""
    trip_summary: str
    itinerary: List[TripDay]
    transport_suggestions: List[str]
    recommendations: List[str]
    warnings: List[str]

class TripGenieService:
    """
    Flagship itinerary generation engine.
    Gathers real-world data, lets AI sequence it, calculates math in Python, and guards against hallucinations.
    """
    
    SYSTEM_INSTRUCTION = """
    You are TripGenie for TRAVELVERSE AI. Your job is to construct a detailed itinerary based on the user's request.
    CRITICAL RULES:
    1. Only use the provided Weather, Places, and Inventory data. DO NOT invent hotels or flights.
    2. DO NOT invent prices for live inventory (flights/hotels). Use the prices provided in the context, or mark as 'ai_estimate' if it's a general cost (like a taxi).
    3. Output the exact JSON structure requested. Do NOT calculate the total budget or day costs; Python will do that. Set day_cost to 0.0.
    """

    def __init__(self, router: ModelRouter, guard: GroundingGuard):
        self.router = router
        self.guard = guard
        # In a real app, these would be injected
        self.places = GooglePlacesProvider()
        self.weather = WeatherProvider()
        self.tbo = TBOProvider()

    async def plan_trip(self, request: TripPlanningRequest) -> TripPlanResult:
        logger.info(f"Starting TripGenie planning for {request.destination}")
        
        # 1. Parallel Data Gathering
        context_data = {}
        
        async def fetch_weather():
            if request.require_weather:
                # We would normally geocode the destination first. Simulating with 0,0 for now.
                return await self.weather.get_forecast(0.0, 0.0)
            return None
            
        async def fetch_places():
            return await self.places.search_places(f"Top attractions in {request.destination}")
            
        async def fetch_inventory():
            if request.require_live_inventory:
                # Mock TBO fetch
                return {"flights": [], "hotels": [], "source": "tbo"}
            return None
            
        weather_data, places_data, inventory_data = await asyncio.gather(
            fetch_weather(), fetch_places(), fetch_inventory()
        )
        
        context_data["weather"] = weather_data
        context_data["places"] = places_data
        if inventory_data:
            context_data["inventory"] = inventory_data

        prompt = f"""
        User Request:
        Destination: {request.destination}
        Dates: {request.start_date} to {request.end_date}
        Travelers: {request.num_travelers}
        Preferences: {request.preferences}
        
        Context Data (DO NOT INVENT OUTSIDE OF THIS FOR SPECIFIC HOTELS/PLACES):
        {json.dumps(context_data, indent=2)}
        """

        # 2. AI Generation
        ai_response: AITripResponse = await self.router.generate_structured(
            task_category=TaskCategory.TRIP_PLANNING,
            prompt=prompt,
            schema=AITripResponse,
            system_instruction=self.SYSTEM_INSTRUCTION
        )
        
        # 3. Deterministic Math (Python)
        total_trip_cost = 0.0
        calculated_itinerary = []
        
        for day in ai_response.itinerary:
            day_cost = 0.0
            for activity in day.activities:
                day_cost += activity.estimated_cost
            day.day_cost = day_cost
            total_trip_cost += day_cost
            calculated_itinerary.append(day)
            
        budget_breakdown = {
            "total_estimated_cost": total_trip_cost,
            "currency": request.currency,
            "target_budget": request.total_budget_target,
            "variance": request.total_budget_target - total_trip_cost if request.total_budget_target else None,
            "calculated_by": "python_deterministic"
        }
        
        # 4. Hallucination Validation
        # Convert the generated itinerary back to text to run it through the guard
        itinerary_text = json.dumps([d.model_dump() for d in calculated_itinerary])
        guard_result = await self.guard.validate(itinerary_text, json.dumps(context_data))
        
        warnings = ai_response.warnings
        if guard_result.is_hallucination:
            warnings.append("Note: Some prices or specific availability could not be verified and should be treated as estimates.")
            
        return TripPlanResult(
            trip_summary=ai_response.trip_summary,
            itinerary=calculated_itinerary,
            transport_suggestions=ai_response.transport_suggestions,
            budget_breakdown=budget_breakdown,
            recommendations=ai_response.recommendations,
            warnings=warnings
        )
