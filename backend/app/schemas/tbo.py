from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class FlightResult(BaseModel):
    id: str
    airline: str
    flight_number: str
    departure_airport: str
    arrival_airport: str
    departure_time: datetime
    arrival_time: datetime
    duration_minutes: int
    price: float
    currency: str = "USD"
    cabin_class: str

class RoomType(BaseModel):
    name: str
    price: float
    is_refundable: bool

class HotelResult(BaseModel):
    id: str
    hotel_name: str
    star_rating: Optional[float] = None
    address: str
    amenities: List[str] = Field(default_factory=list)
    rooms: List[RoomType] = Field(default_factory=list)
    lowest_price: float
    currency: str = "USD"

class AvailabilityResult(BaseModel):
    is_available: bool
    inventory_id: str
    latest_price: float
    currency: str = "USD"
    price_changed: bool = False

class BookingResult(BaseModel):
    booking_reference: str
    status: str # "CONFIRMED", "PENDING", "FAILED"
    final_price: float
    currency: str = "USD"
    message: Optional[str] = None
