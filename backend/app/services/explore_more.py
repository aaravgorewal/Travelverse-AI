import logging
import json
import asyncio
from typing import Dict, Any, List

from app.schemas.explore_more import RecommendationRequest, RecommendationResult, PlaceRecommendation
from app.ai.model_router import ModelRouter, TaskCategory
from app.providers.google_places import GooglePlacesProvider

logger = logging.getLogger(__name__)

class AIRecommendationResult(BaseModel):
    recommendations: List[PlaceRecommendation]

from pydantic import BaseModel

class ExploreMoreService:
    """
    Hyper-local recommendation engine.
    Fetches real places from Google and uses Gemini to filter and explain the matches.
    """
    
    SYSTEM_INSTRUCTION = """
    You are ExploreMore for TRAVELVERSE AI. Your job is to select the best places from the provided list
    based on the user's specific preferences and context.
    
    CRITICAL RULES:
    1. ONLY recommend places that exist in the provided Context Data list.
    2. DO NOT invent locations, restaurants, or attractions.
    3. Ensure you map the exact place_id from the context to your recommendation.
    4. Provide clear, personalized reasoning for why you picked each place based on the user's preferences.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, router: ModelRouter):
        self.router = router
        self.places = GooglePlacesProvider()

    async def recommend(self, request: RecommendationRequest) -> RecommendationResult:
        logger.info(f"Starting ExploreMore search in {request.location}")
        
        # 1. Data Fetching (Python)
        # We fire off parallel searches for each category to cast a wide net
        async def fetch_category(cat: str):
            query = f"top {cat} in {request.location}"
            return await self.places.search_places(query)
            
        tasks = [fetch_category(cat) for cat in request.categories]
        results = await asyncio.gather(*tasks)
        
        # Flatten the results into a single pool of real places
        raw_places_pool = []
        for res_list in results:
            if isinstance(res_list, list):
                raw_places_pool.extend(res_list)
        
        # Deduplicate by place_id
        unique_places = {p.get("place_id"): p for p in raw_places_pool if p.get("place_id")}
        
        if not unique_places:
            logger.warning("No real places found to recommend.")
            return RecommendationResult(
                recommendations=[],
                map_center=request.location,
                search_radius_meters=request.search_radius_meters
            )
            
        # 2. Construct Prompt for Filtering
        prompt = f"""
        User Preferences: {request.preferences}
        Trip Context: {request.trip_context or 'None'}
        
        Real Ground-Truth Places Pool (Choose ONLY from these):
        {json.dumps(list(unique_places.values()), indent=2)}
        
        Filter this list down to the best matches. Provide personalized reasoning for each.
        """

        # 3. AI Filtering & Reasoning
        ai_response = None
        try:
            ai_response: AIRecommendationResult = await self.router.generate_structured(
                task_category=TaskCategory.RECOMMENDATION,
                prompt=prompt,
                schema=AIRecommendationResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
        except Exception as e:
            logger.error(f"ExploreMore AI filtering failed: {e}")
            raise RuntimeError("Failed to generate recommendations.")
            
        # 4. Validation (Ensure AI didn't invent a place ID)
        validated_recs = []
        for rec in ai_response.recommendations:
            if rec.place_id in unique_places:
                validated_recs.append(rec)
            else:
                logger.warning(f"AI hallucinated place_id {rec.place_id}. Stripping from results.")
                
        return RecommendationResult(
            recommendations=validated_recs,
            map_center=request.location,
            search_radius_meters=request.search_radius_meters
        )
