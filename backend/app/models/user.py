from sqlalchemy import Column, String, Boolean, Integer, Float, JSON
from app.database import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="traveler")
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    passport_number = Column(String, nullable=True)
    passport_expiry = Column(String, nullable=True)
    nationality = Column(String, nullable=True)
    home_city = Column(String, nullable=True)
    preferred_language = Column(String, nullable=True)
    
    # Store arrays and complex objects as JSON for simplicity
    travel_styles = Column(JSON, nullable=True)
    budget_preference = Column(String, nullable=True)
    favorite_destinations = Column(JSON, nullable=True)
    interests = Column(JSON, nullable=True)
    dietary_preferences = Column(JSON, nullable=True)
    mobility_requirements = Column(JSON, nullable=True)
    
    dietary = Column(String, nullable=True)
    seat_preference = Column(String, nullable=True)
    preferred_cabin = Column(String, nullable=True)
    
    loyalty_points = Column(Integer, default=0)
    carbon_offset_kg = Column(Float, default=0.0)
    
    travel_preferences = Column(JSON, nullable=True)
    onboarding_completed = Column(Boolean, default=False)
