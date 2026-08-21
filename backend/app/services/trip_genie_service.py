import asyncio
import logging
from typing import Dict, Any, List, Optional
import json

from app.schemas.trip_genie import TripPlanningRequest, TripPlanResult
from app.providers.google_places import GooglePlacesProvider
from app.providers.weather.weather import WeatherProvider
from app.providers.tbo.flights import TBOFlightProvider
from app.providers.tbo.hotels import TBOHotelProvider
from app.services.rag_pipeline import RAGService
from app.database.session import AsyncSessionLocal
from app.ai.model_router import ModelRouter, TaskCategory
from app.schemas.smart_budget import BudgetOptimizationRequest, BudgetItem, PriceDetail
from app.services.smart_budget_service import SmartBudgetService

logger = logging.getLogger(__name__)

class TripGenieService:
    def __init__(self):
        self.places = GooglePlacesProvider()
        self.weather = WeatherProvider()
        self.flights = TBOFlightProvider()
        self.hotels = TBOHotelProvider()
        self.rag = RAGService()
        self.router = ModelRouter()

    async def plan_trip(self, request: TripPlanningRequest, user_id: str, role: str) -> TripPlanResult:
        logger.info(f"TripGenie planning trip to {request.destination} for user {user_id}")
        
        # 1. Gather factual data concurrently
        async with asyncio.TaskGroup() as tg:
            places_task = tg.create_task(self.places.search_places(f"top attractions in {request.destination}"))
            
            # Use geocoding mock or real if available, for now pass 0,0 to weather if we don't have lat/lng
            # Let's get places first to grab the lat/lng of the destination for weather
            weather_task = tg.create_task(self._fetch_weather_safe(request.destination))
            rag_task = tg.create_task(self._fetch_rag_safe(request.destination, role))
            
            flight_task = None
            hotel_task = None
            if request.require_live_inventory:
                # Assuming origin is passed via preferences or we hardcode a mock for now
                origin = "NYC" # TODO: extract from user profile
                flight_task = tg.create_task(self.flights.search_flights(origin, request.destination, request.start_date))
                hotel_task = tg.create_task(self.hotels.search_hotels(request.destination, request.start_date, request.end_date))
                
        # 2. Extract Data
        places_data = [p.__dict__ for p in places_task.result()] if not isinstance(places_task.result(), BaseException) else []
        weather_data = weather_task.result() if not isinstance(weather_task.result(), BaseException) else {}
        rag_data = rag_task.result() if not isinstance(rag_task.result(), BaseException) else []
        
        flight_data = []
        if flight_task and not isinstance(flight_task.result(), BaseException):
            flight_data = [f.__dict__ for f in flight_task.result()][:5] # Limit context size
            
        hotel_data = []
        if hotel_task and not isinstance(hotel_task.result(), BaseException):
            hotel_data = [h.__dict__ for h in hotel_task.result()][:5] # Limit context size

        # 3. Prompt Gemini
        grounded_prompt = f"""
You are TripGenie, a strict and highly capable travel planning AI.
Create a trip plan based EXCLUSIVELY on the provided data. DO NOT invent places, prices, availability, or routes.

User Request:
Destination: {request.destination}
Dates: {request.start_date} to {request.end_date}
Travelers: {request.num_travelers}
Budget Target: {request.total_budget_target}
Preferences: {', '.join(request.preferences)}

Factual Data:
Places (Attractions/Restaurants): {json.dumps(places_data, default=str)}
Weather: {json.dumps(weather_data, default=str)}
RAG Context: {json.dumps(rag_data, default=str)}
Live Flights: {json.dumps(flight_data, default=str)}
Live Hotels: {json.dumps(hotel_data, default=str)}

Rules:
1. ONLY suggest places that exist in the 'Places' list or 'RAG Context'.
2. ONLY suggest flights/hotels if they exist in the 'Live Flights'/'Live Hotels' lists.
3. If no flights/hotels are provided, leave those empty or state they must be booked separately.
4. Estimate costs if not provided, but clearly mark them as 'ai_estimate' in the source field. If using Live TBO flights/hotels, use the exact price provided and mark source as 'TBO'.
5. DO NOT hallucinate.
"""

        logger.info("Calling ModelRouter for TripGenie structured generation")
        
        from pydantic import BaseModel
        from app.schemas.trip_genie import TripDay
        
        class GeminiTripResponse(BaseModel):
            trip_summary: str
            itinerary: List[TripDay]
            transport_suggestions: List[str]
            recommendations: List[str]
            warnings: List[str]

        # Use generate_structured to get the core plan
        gemini_plan = await self.router.generate_structured(
            task_category=TaskCategory.TRIP_PLANNING,
            prompt=grounded_prompt,
            schema=GeminiTripResponse,
            system_instruction="You are a strict JSON data generator. Only output the exact JSON structure requested based on the given context."
        )

        # 4. Calculate Budget strictly in Python
        flight_items = []
        hotel_items = []
        experience_items = []
        
        for day in gemini_plan.itinerary:
            for activity in day.activities:
                if activity.estimated_cost > 0:
                    experience_items.append(
                        BudgetItem(
                            item_id=activity.name,
                            name=activity.name,
                            category="experiences",
                            price=PriceDetail(amount=activity.estimated_cost, source=activity.source)
                        )
                    )
        
        # If live flights/hotels were selected, add them to budget
        # For simplicity, if Gemini used a live flight, we'd extract it.
        # Here we just pass what we found if live inventory was requested
        if request.require_live_inventory:
            for f in flight_data:
                flight_items.append(BudgetItem(item_id=f.get('flight_id', 'F1'), name=f.get('airline', 'Flight'), category="flights", price=PriceDetail(amount=f.get('price', 0.0), source="TBO")))
            for h in hotel_data:
                hotel_items.append(BudgetItem(item_id=h.get('hotel_id', 'H1'), name=h.get('name', 'Hotel'), category="hotels", price=PriceDetail(amount=h.get('price', 0.0), source="TBO")))

        budget_request = BudgetOptimizationRequest(
            flight_prices=flight_items,
            hotel_prices=hotel_items,
            transfer_prices=[],
            experience_prices=experience_items,
            budget=request.total_budget_target or 0.0,
            currency=request.currency
        )
        
        budget_result = SmartBudgetService.calculate_budget(budget_request)

        # 5. Construct Final Result
        final_result = TripPlanResult(
            trip_summary=gemini_plan.trip_summary,
            itinerary=gemini_plan.itinerary,
            transport_suggestions=gemini_plan.transport_suggestions,
            budget_breakdown=budget_result,
            recommendations=gemini_plan.recommendations,
            warnings=gemini_plan.warnings
        )
        
        return final_result

    async def _fetch_weather_safe(self, destination: str):
        # We need lat/lng. For now, fetch places first. 
        # Since it's concurrent, we just use a mock or 0,0 for safety if geocoding isn't isolated.
        places = await self.places.search_places(destination)
        if places and len(places) > 0:
            return await self.weather.get_current_weather(places[0].lat, places[0].lng)
        return {"available": False}
        
    async def _fetch_rag_safe(self, destination: str, role: str):
        async with AsyncSessionLocal() as session:
            try:
                return await self.rag.retrieve_context(session, f"Guide to {destination}", role, top_k=3)
            except:
                return []
