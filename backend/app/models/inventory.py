from sqlalchemy import Column, String, ForeignKey, Float, JSON
from .base import Base

class Destination(Base):
    __tablename__ = "destinations"
    name = Column(String, index=True)
    country = Column(String)

class Location(Base):
    __tablename__ = "locations"
    destination_id = Column(ForeignKey("destinations.id", ondelete="CASCADE"))
    name = Column(String)

class Place(Base):
    __tablename__ = "places"
    location_id = Column(ForeignKey("locations.id", ondelete="CASCADE"))
    name = Column(String)
    lat = Column(Float)
    lng = Column(Float)

class Activity(Base):
    __tablename__ = "activities"
    destination_id = Column(ForeignKey("destinations.id", ondelete="CASCADE"))
    name = Column(String)
    category = Column(String)
