from sqlalchemy import Uuid, Column, String, Integer, Float, ForeignKey, JSON
from .base import BaseModel

class Destination(BaseModel):
    __tablename__ = "destinations"
    
    name = Column(String, nullable=False, index=True)
    country = Column(String, nullable=False)
    region = Column(String, nullable=True)
    description = Column(String, nullable=True)

class Location(BaseModel):
    __tablename__ = "locations"
    
    destination_id = Column(Uuid, ForeignKey("destinations.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=True)
    lng = Column(Float, nullable=True)

class Place(BaseModel):
    __tablename__ = "places"
    
    location_id = Column(Uuid, ForeignKey("locations.id", ondelete="CASCADE"), index=True, nullable=False)
    name = Column(String, nullable=False)
    category = Column(String, nullable=True) # attraction, restaurant, etc.
    details = Column(JSON, nullable=True)

class Flight(BaseModel):
    __tablename__ = "flights"
    
    airline = Column(String, nullable=False)
    flight_number = Column(String, nullable=False)
    origin = Column(String, nullable=False)
    destination = Column(String, nullable=False)
    departure_time = Column(String, nullable=True)
    arrival_time = Column(String, nullable=True)
    price = Column(Float, nullable=True)

class Hotel(BaseModel):
    __tablename__ = "hotels"
    
    destination_id = Column(Uuid, ForeignKey("destinations.id", ondelete="CASCADE"), index=True, nullable=True)
    name = Column(String, nullable=False)
    rating = Column(Float, nullable=True)
    price_per_night = Column(Float, nullable=True)
    amenities = Column(JSON, nullable=True)

class Transfer(BaseModel):
    __tablename__ = "transfers"
    
    name = Column(String, nullable=False)
    transfer_type = Column(String, nullable=True)
    price = Column(Float, nullable=True)

class Experience(BaseModel):
    __tablename__ = "experiences"
    
    destination_id = Column(Uuid, ForeignKey("destinations.id", ondelete="CASCADE"), index=True, nullable=True)
    name = Column(String, nullable=False)
    duration_minutes = Column(Integer, nullable=True)
    price = Column(Float, nullable=True)
