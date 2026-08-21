from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class ItineraryActivity(BaseModel):
    activity_id: str
    name: str
    lat: float
    lng: float
    duration_minutes: int
    opening_time: Optional[str] = None # e.g., "09:00"
    closing_time: Optional[str] = None # e.g., "17:00"
    must_do: bool = False

class ItineraryOptimizationRequest(BaseModel):
    activities: List[ItineraryActivity]
    start_time: str = "09:00"
    end_time: str = "20:00"
    start_location: Optional[Dict[str, float]] = None # {"lat": ..., "lng": ...}
    end_location: Optional[Dict[str, float]] = None
    preferences: List[str] = Field(default_factory=list, description="User constraints (e.g., 'relaxed pace', 'lunch at 1pm')")

class RouteChange(BaseModel):
    activity_id: str
    reason: str = Field(..., description="Tradeoff explanation (e.g., 'Moved to morning to avoid crossing town twice')")

class OptimizedActivity(BaseModel):
    activity_id: str
    name: str
    arrival_time: str
    departure_time: str
    travel_time_from_previous_mins: int
    distance_from_previous_km: float

class OptimizedItineraryResult(BaseModel):
    original_order: List[str] = Field(..., description="List of activity IDs in original order")
    optimized_sequence: List[OptimizedActivity]
    changes: List[RouteChange]
    warnings: List[str] = Field(default_factory=list)
