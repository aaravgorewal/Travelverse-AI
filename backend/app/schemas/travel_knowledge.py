from pydantic import BaseModel, Field
from typing import Optional, List, Any

class DestinationSchema(BaseModel):
    destination_id: Optional[str] = None
    name: Optional[str] = None
    country: Optional[str] = None
    country_code: Optional[str] = None
    region: Optional[str] = None
    currency: Optional[str] = None
    languages: Optional[List[str]] = None
    timezone: Optional[str] = None
    description: Optional[str] = None
    travel_styles: Optional[List[str]] = None
    best_time: Optional[str] = None
    culture: Optional[str] = None
    food: Optional[str] = None
    transport: Optional[str] = None
    etiquette: Optional[str] = None
    accessibility: Optional[str] = None
    safety_guidance: Optional[str] = None
    sources: Optional[List[str]] = None

class PlaceSchema(BaseModel):
    place_id: Optional[str] = None
    name: Optional[str] = None
    destination_id: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    category: Optional[str] = None
    description: Optional[str] = None
    rating: Optional[float] = None
    price_level: Optional[int] = None
    opening_hours: Optional[Any] = None
    source: Optional[str] = None

class ActivitySchema(BaseModel):
    activity_id: Optional[str] = None
    name: Optional[str] = None
    destination_id: Optional[str] = None
    category: Optional[str] = None
    duration: Optional[str] = None
    price: Optional[float] = None
    description: Optional[str] = None
    source: Optional[str] = None

class PolicySchema(BaseModel):
    policy_id: Optional[str] = None
    category: Optional[str] = None
    title: Optional[str] = None
    content: Optional[str] = None
    effective_date: Optional[str] = None
    source: Optional[str] = None
    access_role: Optional[str] = None
