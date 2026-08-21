from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class RecommendationRequest(BaseModel):
    location: str = Field(..., description="Name or coordinates of the target location.")
    categories: List[str] = Field(..., description="e.g. ['restaurants', 'attractions']")
    preferences: List[str] = Field(default_factory=list, description="e.g. ['vegan', 'quiet']")
    search_radius_meters: int = 5000
    trip_context: Optional[str] = None # e.g. "Traveling with 2 toddlers"

class PlaceRecommendation(BaseModel):
    place_id: str = Field(..., description="The real Google Place ID (or dataset ID)")
    name: str
    match_reasoning: str = Field(..., description="Why this place fits the user's specific preferences and context.")
    estimated_relevance_score: int = Field(..., description="0-100 score of how well it matches.")

class RecommendationResult(BaseModel):
    recommendations: List[PlaceRecommendation]
    map_center: str
    search_radius_meters: int
