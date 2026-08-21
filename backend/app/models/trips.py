from sqlalchemy import Column, String, Integer, JSON, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from .base import BaseModel

class Trip(BaseModel):
    __tablename__ = "trips"
    
    customer_id = Column(String, ForeignKey("customers.id"), index=True, nullable=False)
    agent_id = Column(String, ForeignKey("agents.id"), index=True, nullable=True)
    destination_id = Column(String, ForeignKey("destinations.id"), index=True, nullable=True)
    
    title = Column(String, nullable=False)
    status = Column(String, default="planning") # planning, booked, completed, cancelled
    start_date = Column(DateTime, nullable=True)
    end_date = Column(DateTime, nullable=True)
    total_budget = Column(Integer, nullable=True)
    
    days = relationship("TripDay", back_populates="trip", cascade="all, delete-orphan")
    # bookings = relationship("Booking", back_populates="trip") # from bookings module

class TripDay(BaseModel):
    __tablename__ = "trip_days"
    
    trip_id = Column(String, ForeignKey("trips.id"), index=True, nullable=False)
    day_number = Column(Integer, nullable=False)
    date = Column(DateTime, nullable=True)
    theme = Column(String, nullable=True)
    
    trip = relationship("Trip", back_populates="days")
    activities = relationship("Activity", back_populates="trip_day", cascade="all, delete-orphan")

class Activity(BaseModel):
    __tablename__ = "activities"
    
    trip_day_id = Column(String, ForeignKey("trip_days.id"), index=True, nullable=False)
    
    title = Column(String, nullable=False)
    description = Column(String, nullable=True)
    time = Column(String, nullable=True)
    activity_type = Column(String, nullable=True) # dining, sightseeing, transit
    estimated_cost = Column(Integer, nullable=True)
    
    trip_day = relationship("TripDay", back_populates="activities")
