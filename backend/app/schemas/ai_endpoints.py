from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class AIChatRequest(BaseModel):
    message: str = Field(..., description="The user's chat message.")
    conversation_id: Optional[str] = Field(None, description="The active conversation ID, if continuing a thread.")

class OptimizeItineraryRequest(BaseModel):
    itinerary_id: str = Field(..., description="The ID of the itinerary to optimize.")
    preferences: Optional[Dict[str, Any]] = Field(None, description="Additional preferences for optimization.")
    constraints: Optional[Dict[str, Any]] = Field(None, description="Constraints like budget, pacing, etc.")

class OptimizeBudgetRequest(BaseModel):
    trip_id: str = Field(..., description="The ID of the trip to optimize.")
    target_budget: float = Field(..., description="The target budget to optimize towards.")
    currency: str = Field("USD", description="Currency of the target budget.")

class CompareRequest(BaseModel):
    items: List[str] = Field(..., description="List of item IDs (flights, hotels, activities) to compare.")
    criteria: Optional[List[str]] = Field(None, description="Specific criteria for comparison (e.g. price, duration).")

class ExplainRequest(BaseModel):
    topic: str = Field(..., description="The topic, action, or recommendation to explain.")
    context_id: Optional[str] = Field(None, description="Related context ID (e.g., a trip or package ID).")

class RecommendRequest(BaseModel):
    preferences: Dict[str, Any] = Field(..., description="User preferences for the recommendation.")
    location: Optional[str] = Field(None, description="Target location for recommendations.")

class DestinationRequest(BaseModel):
    destination: str = Field(..., description="The destination to get information about.")
    interests: Optional[List[str]] = Field(None, description="Specific interests for the destination.")

class PackingListRequest(BaseModel):
    destination: str = Field(..., description="The destination for the packing list.")
    duration_days: int = Field(..., description="Number of days for the trip.")
    weather: Optional[str] = Field(None, description="Expected weather or season.")

class TravelPulseRequest(BaseModel):
    location: str = Field(..., description="The location to check current pulse/trends.")
    categories: Optional[List[str]] = Field(None, description="Categories like events, weather, alerts.")

class SupportRequest(BaseModel):
    query: str = Field(..., description="The support query or issue description.")
    booking_id: Optional[str] = Field(None, description="Related booking ID if applicable.")

class PersonalizeRequest(BaseModel):
    user_id: str = Field(..., description="The user ID to personalize content for.")
    context: Dict[str, Any] = Field(default_factory=dict, description="Contextual data for personalization.")

class CreatePackageRequest(BaseModel):
    destination: str = Field(..., description="Destination for the package.")
    budget: float = Field(..., description="Total budget constraint.")
    travelers: int = Field(..., description="Number of travelers.")
    preferences: Optional[Dict[str, Any]] = Field(None, description="Additional preferences.")

class GenerateQuoteRequest(BaseModel):
    package_id: str = Field(..., description="The ID of the package to quote.")
    currency: str = Field("USD", description="The currency for the quote.")

class CustomerMessageRequest(BaseModel):
    customer_id: str = Field(..., description="The customer ID.")
    intent: str = Field(..., description="The intent of the message (e.g., follow-up, quotation).")
    context: Optional[Dict[str, Any]] = Field(None, description="Context for message generation.")

class AlertIQRequest(BaseModel):
    context: str = Field(..., description="The context to analyze for alerts.")

class CopilotPackageRequest(BaseModel):
    destination: str = Field(..., description="Destination for the package.")
    budget: float = Field(..., description="Total budget constraint.")
    travelers: int = Field(..., description="Number of travelers.")
    preferences: Optional[Dict[str, Any]] = Field(None, description="Additional preferences.")

class CopilotValidateRequest(BaseModel):
    package_id: str = Field(..., description="The ID of the package to validate.")

class CopilotQuoteRequest(BaseModel):
    package_id: str = Field(..., description="The ID of the package to quote.")
    margin: Optional[float] = Field(None, description="Optional margin to apply.")
