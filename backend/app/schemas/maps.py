from pydantic import BaseModel, Field
from typing import Optional, List

class Coordinate(BaseModel):
    lat: float
    lng: float

class PlaceDetails(BaseModel):
    place_id: str
    name: str
    formatted_address: str
    location: Coordinate
    rating: Optional[float] = None
    user_ratings_total: Optional[int] = None
    types: List[str] = Field(default_factory=list)

class GeocodeResult(BaseModel):
    place_id: str
    formatted_address: str
    location: Coordinate

class RouteStep(BaseModel):
    distance_meters: int
    duration_seconds: int
    html_instructions: str
    polyline: str

class RouteDetails(BaseModel):
    distance_meters: int
    duration_seconds: int
    start_location: Coordinate
    end_location: Coordinate
    overview_polyline: str
    steps: List[RouteStep] = Field(default_factory=list)
