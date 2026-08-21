from sqlalchemy import Column, String, ForeignKey, JSON, Integer
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
