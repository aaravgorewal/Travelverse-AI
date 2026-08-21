from pydantic import BaseModel, Field
from typing import List, Optional

class PackingRequest(BaseModel):
    destination: str
    start_date: str
    end_date: str
    activities: List[str] = Field(default_factory=list, description="Planned activities (e.g. hiking, swimming)")
    traveler_profile: str = Field(..., description="Details about the travelers (e.g. 'couple with a toddler')")
    include_weather: bool = True

class PackingCategory(BaseModel):
    category_name: str
    items: List[str]

class PackingListResult(BaseModel):
    documents: List[str]
    clothing: List[str]
    electronics: List[str]
    activity_equipment: List[str]
    essentials: List[str]
    weather_context: Optional[str] = None
    warnings: List[str] = Field(default_factory=list, description="Any specific warnings or disclaimers")
