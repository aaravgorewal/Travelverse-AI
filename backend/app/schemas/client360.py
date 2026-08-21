from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class PersonalizeRequest(BaseModel):
    customer_id: str
    agent_id: str = Field(..., description="The ID of the agent requesting the data (for authorization context)")

class ClientSummary(BaseModel):
    travel_preferences: List[str] = Field(..., description="e.g., 'Prefers aisle seats', 'Likes boutique hotels'")
    past_trips_summary: str = Field(..., description="High-level summary of where they have traveled")
    booking_patterns: str = Field(..., description="e.g., 'Usually books 2 months in advance', 'Always adds travel insurance'")
    budget_preferences: str = Field(..., description="e.g., 'Mid-range', 'Luxury', 'Budget-conscious'")
    preferred_products: List[str] = Field(..., description="e.g., 'All-inclusive resorts', 'Direct flights'")

class PersonalizeResult(BaseModel):
    customer_name: str
    summary: ClientSummary
    warnings: List[str] = Field(default_factory=list, description="Any system warnings about data access")
