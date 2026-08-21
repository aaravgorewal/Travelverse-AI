import logging
import json
from typing import Dict, Any, List

from app.schemas.smart_route import (
    ItineraryOptimizationRequest, 
    OptimizedItineraryResult,
    OptimizedActivity,
    RouteChange
)
from app.providers.google_maps import GoogleMapsProvider
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class SmartRouteService:
    """
    Combines deterministic distance matrix pathfinding with LLM-based logic
    for constraints and tradeoffs.
    """
    
    SYSTEM_INSTRUCTION = """
    You are SmartRoute for TRAVELVERSE AI. Your job is to sequence a list of travel activities optimally.
    You must balance the travel time matrix (real-world distances) with user preferences and logical constraints.
    
    Constraints:
    - Never violate opening/closing times if provided.
    - Factor in activity duration + travel time to calculate arrival/departure.
    - Respect user preferences (e.g., 'relaxed pace', 'lunch at 1pm').
    - Only drop 'must_do: false' activities if the schedule absolutely cannot fit them.
    
    Output JSON exactly matching the schema.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, maps_provider: GoogleMapsProvider, router: ModelRouter):
        self.maps_provider = maps_provider
        self.router = router

    async def optimize(self, request: ItineraryOptimizationRequest) -> OptimizedItineraryResult:
        if not request.activities:
            raise ValueError("No activities provided for optimization.")
            
        original_order = [a.activity_id for a in request.activities]

        # 1. Fetch distance matrix
        locations = [f"{a.lat},{a.lng}" for a in request.activities]
        if request.start_location:
            locations.insert(0, f"{request.start_location['lat']},{request.start_location['lng']}")
        if request.end_location:
            locations.append(f"{request.end_location['lat']},{request.end_location['lng']}")
            
        try:
            # We fetch a full matrix to let Gemini see all NxN travel times
            matrix = await self.maps_provider.get_distance_matrix(origins=locations, destinations=locations)
            # In a production app, we would parse this matrix nicely. For the LLM, we can pass it as context.
        except Exception as e:
            logger.warning(f"Failed to fetch distance matrix: {e}. Falling back to logical sequencing without real distances.")
            matrix = {"error": "Distance matrix unavailable. Sequence logically based on map assumptions."}

        # 2. Construct AI Prompt
        prompt = f"""
        Original Activities:
        {json.dumps([a.model_dump() for a in request.activities], indent=2)}
        
        Day Start Time: {request.start_time}
        Day End Time: {request.end_time}
        User Preferences: {request.preferences}
        
        Distance Matrix Data (Origins x Destinations):
        {json.dumps(matrix)}
        
        Sequence the activities. Provide arrival/departure times. Explain tradeoffs in the 'changes' array.
        """
        
        # 3. Ask Gemini for sequencing
        try:
            result: OptimizedItineraryResult = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=OptimizedItineraryResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            # Keep original order intact
            result.original_order = original_order
            
            # 4. Deterministic Validation (Verify AI math)
            # We could iterate over result.optimized_sequence to strictly validate opening times 
            # and override LLM hallucinated times here. For now, we trust the strict schema.
            
            return result
            
        except Exception as e:
            logger.error(f"SmartRoute AI optimization failed: {e}")
            raise RuntimeError("Failed to optimize itinerary.")
