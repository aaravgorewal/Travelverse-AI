from sqlalchemy import Column, String, ForeignKey, JSON
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
