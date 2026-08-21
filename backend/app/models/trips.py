from sqlalchemy import Column, String, ForeignKey, Date, JSON
from .base import Base

class Trip(Base):
    __tablename__ = "trips"
    customer_id = Column(ForeignKey("customers.id", ondelete="CASCADE"))
    name = Column(String)
    start_date = Column(Date)
    end_date = Column(Date)

class TripDay(Base):
    __tablename__ = "trip_days"
    trip_id = Column(ForeignKey("trips.id", ondelete="CASCADE"))
    date = Column(Date)
    day_index = Column(String)

class ItineraryItem(Base):
    __tablename__ = "itinerary_items"
    trip_day_id = Column(ForeignKey("trip_days.id", ondelete="CASCADE"))
    title = Column(String)
    item_type = Column(String)
