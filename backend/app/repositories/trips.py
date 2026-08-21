from sqlalchemy.orm import Session
from app.models.trips import Trip
from app.models.bookings import Booking
from .base import BaseRepository

class TripRepository(BaseRepository[Trip]):
    def __init__(self):
        super().__init__(Trip)

class BookingRepository(BaseRepository[Booking]):
    def __init__(self):
        super().__init__(Booking)

trip_repo = TripRepository()
booking_repo = BookingRepository()
