from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from app.schemas.smart_budget import BudgetOptimizationResult

class TripPlanningRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    num_travelers: int = 1
    total_budget_target: Optional[float] = None
    currency: str = "USD"
    preferences: List[str] = Field(default_factory=list)
    require_live_inventory: bool = False # If true, we fetch TBO data
    require_weather: bool = True

class TripActivity(BaseModel):
    name: str
    description: str
    start_time: str
    end_time: str
    estimated_cost: float = 0.0
    booking_required: bool = False
    source: str = "ai_estimate" # e.g. 'google_places', 'tbo', 'ai_estimate'

class TripDay(BaseModel):
    date: str
    theme: str
    activities: List[TripActivity]
    day_cost: float = 0.0 # Calculated by Python

class TripPlanResult(BaseModel):
    trip_summary: str
    itinerary: List[TripDay]
    transport_suggestions: List[str]
    budget_breakdown: BudgetOptimizationResult = Field(..., description="Python-calculated math summary")
    recommendations: List[str]
    warnings: List[str]
