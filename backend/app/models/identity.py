from sqlalchemy import Uuid, Column, String, Boolean, Integer, JSON, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel

class Agency(BaseModel):
    __tablename__ = "agencies"
    
    name = Column(String, nullable=False)
    contact_email = Column(String, nullable=True)
    contact_phone = Column(String, nullable=True)
    
    agents = relationship("Agent", back_populates="agency")

class User(BaseModel):
    __tablename__ = "users"

    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    role = Column(String, default="traveler")
    avatar = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    
    agent_profile = relationship("Agent", back_populates="user", uselist=False)
    customer_profile = relationship("Customer", back_populates="user", uselist=False)

class Agent(BaseModel):
    __tablename__ = "agents"
    
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    agency_id = Column(Uuid, ForeignKey("agencies.id", ondelete="CASCADE"), index=True, nullable=True)
    
    title = Column(String, nullable=True)
    total_sales = Column(Integer, default=0)
    
    user = relationship("User", back_populates="agent_profile")
    agency = relationship("Agency", back_populates="agents")
    preferences = relationship("AgentPreference", back_populates="agent", uselist=False)
    # customers = relationship("Customer", back_populates="assigned_agent") # Depending on structure

class Customer(BaseModel):
    __tablename__ = "customers"
    
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), unique=True, index=True, nullable=True) # Optional if guest
    agent_id = Column(Uuid, ForeignKey("agents.id", ondelete="CASCADE"), index=True, nullable=True) # If managed by an agent
    
    name = Column(String, nullable=False)
    email = Column(String, index=True, nullable=False)
    phone = Column(String, nullable=True)
    loyalty_tier = Column(String, nullable=True)
    notes = Column(String, nullable=True)
    
    user = relationship("User", back_populates="customer_profile")
    # assigned_agent = relationship("Agent", back_populates="customers")
    preferences = relationship("CustomerPreference", back_populates="customer", uselist=False)

class CustomerPreference(BaseModel):
    __tablename__ = "customer_preferences"
    
    customer_id = Column(Uuid, ForeignKey("customers.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    preferred_cabin = Column(String, nullable=True)
    preferred_hotel_brand = Column(String, nullable=True)
    dietary_requirements = Column(String, nullable=True)
    json_data = Column(JSON, nullable=True) # Catch-all for travel styles, etc.
    
    customer = relationship("Customer", back_populates="preferences")

class AgentPreference(BaseModel):
    __tablename__ = "agent_preferences"
    
    agent_id = Column(Uuid, ForeignKey("agents.id", ondelete="CASCADE"), unique=True, index=True, nullable=False)
    
    default_margin_percentage = Column(Integer, default=10)
    json_data = Column(JSON, nullable=True)
    
    agent = relationship("Agent", back_populates="preferences")
