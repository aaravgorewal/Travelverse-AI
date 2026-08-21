import os
from pathlib import Path

MODELS_DIR = Path("backend/app/models")
MODELS_DIR.mkdir(parents=True, exist_ok=True)

# 1. Base Model
base_py = """from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy import Column, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
import datetime

class Base:
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

Base = declarative_base(cls=Base)
"""

# 2. Identity
identity_py = """from sqlalchemy import Column, String, ForeignKey, JSON
from sqlalchemy.orm import relationship
from .base import Base

class User(Base):
    __tablename__ = "users"
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="traveler")

class Agency(Base):
    __tablename__ = "agencies"
    name = Column(String, nullable=False)

class Customer(Base):
    __tablename__ = "customers"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    first_name = Column(String)
    last_name = Column(String)

class Agent(Base):
    __tablename__ = "agents"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    agency_id = Column(ForeignKey("agencies.id", ondelete="SET NULL"))

class CustomerPreference(Base):
    __tablename__ = "customer_preferences"
    customer_id = Column(ForeignKey("customers.id", ondelete="CASCADE"), unique=True)
    preferences = Column(JSON, default=dict)

class AgentPreference(Base):
    __tablename__ = "agent_preferences"
    agent_id = Column(ForeignKey("agents.id", ondelete="CASCADE"), unique=True)
    settings = Column(JSON, default=dict)
"""

# 3. Inventory
inventory_py = """from sqlalchemy import Column, String, ForeignKey, Float, JSON
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
"""

# 4. Trips
trips_py = """from sqlalchemy import Column, String, ForeignKey, Date, JSON
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
"""

# 5. Bookings
bookings_py = """from sqlalchemy import Column, String, ForeignKey, Float, Boolean
from .base import Base

class Booking(Base):
    __tablename__ = "bookings"
    trip_id = Column(ForeignKey("trips.id", ondelete="CASCADE"))
    status = Column(String)
    total_price = Column(Float)

class BookingItem(Base):
    __tablename__ = "booking_items"
    booking_id = Column(ForeignKey("bookings.id", ondelete="CASCADE"))
    item_type = Column(String)
    price = Column(Float)

class Flight(Base):
    __tablename__ = "flights"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    flight_number = Column(String)

class Hotel(Base):
    __tablename__ = "hotels"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    hotel_name = Column(String)

class Transfer(Base):
    __tablename__ = "transfers"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    vehicle_type = Column(String)

class Experience(Base):
    __tablename__ = "experiences"
    booking_item_id = Column(ForeignKey("booking_items.id", ondelete="CASCADE"))
    experience_name = Column(String)
"""

# 6. AI
ai_py = """from sqlalchemy import Column, String, ForeignKey, JSON
from .base import Base

class Conversation(Base):
    __tablename__ = "conversations"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    context = Column(JSON, default=dict)

class Message(Base):
    __tablename__ = "messages"
    conversation_id = Column(ForeignKey("conversations.id", ondelete="CASCADE"))
    role = Column(String)
    content = Column(String)

class AIMemory(Base):
    __tablename__ = "ai_memory"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    memory_key = Column(String)
    memory_value = Column(JSON)

class AIRequest(Base):
    __tablename__ = "ai_requests"
    prompt = Column(String)

class AIResponse(Base):
    __tablename__ = "ai_responses"
    request_id = Column(ForeignKey("ai_requests.id", ondelete="CASCADE"))
    content = Column(String)

class AIAction(Base):
    __tablename__ = "ai_actions"
    response_id = Column(ForeignKey("ai_responses.id", ondelete="CASCADE"))
    action_type = Column(String)
"""

# 7. RAG
rag_py = """from sqlalchemy import Column, String, ForeignKey
# In a real setup we'd use pgvector here
# from pgvector.sqlalchemy import Vector
from .base import Base

class KnowledgeDocument(Base):
    __tablename__ = "knowledge_documents"
    title = Column(String)
    content = Column(String)

class KnowledgeChunk(Base):
    __tablename__ = "knowledge_chunks"
    document_id = Column(ForeignKey("knowledge_documents.id", ondelete="CASCADE"))
    text = Column(String)
    # embedding = Column(Vector(768))
"""

# 8. System
system_py = """from sqlalchemy import Column, String, ForeignKey, JSON, Integer
from .base import Base

class Notification(Base):
    __tablename__ = "notifications"
    user_id = Column(ForeignKey("users.id", ondelete="CASCADE"))
    message = Column(String)

class Alert(Base):
    __tablename__ = "alerts"
    severity = Column(String)
    message = Column(String)

class APIUsage(Base):
    __tablename__ = "api_usage"
    endpoint = Column(String)
    calls = Column(Integer, default=0)
"""

init_py = """from .base import Base
from .identity import User, Customer, Agent, Agency, CustomerPreference, AgentPreference
from .inventory import Destination, Location, Place, Activity
from .trips import Trip, TripDay, ItineraryItem
from .bookings import Booking, BookingItem, Flight, Hotel, Transfer, Experience
from .ai import Conversation, Message, AIMemory, AIRequest, AIResponse, AIAction
from .rag import KnowledgeDocument, KnowledgeChunk
from .system import Notification, Alert, APIUsage
"""

if __name__ == "__main__":
    (MODELS_DIR / "base.py").write_text(base_py)
    (MODELS_DIR / "identity.py").write_text(identity_py)
    (MODELS_DIR / "inventory.py").write_text(inventory_py)
    (MODELS_DIR / "trips.py").write_text(trips_py)
    (MODELS_DIR / "bookings.py").write_text(bookings_py)
    (MODELS_DIR / "ai.py").write_text(ai_py)
    (MODELS_DIR / "rag.py").write_text(rag_py)
    (MODELS_DIR / "system.py").write_text(system_py)
    (MODELS_DIR / "__init__.py").write_text(init_py)
    print("Models written successfully.")
