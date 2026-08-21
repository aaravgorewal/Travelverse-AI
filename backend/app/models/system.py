from sqlalchemy import Uuid, Column, String, Integer, ForeignKey, JSON
from .base import BaseModel

class Notification(BaseModel):
    __tablename__ = "notifications"
    
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    title = Column(String, nullable=False)
    message = Column(String, nullable=False)
    status = Column(String, default="unread")
    notification_type = Column(String, nullable=True)

class Alert(BaseModel):
    __tablename__ = "alerts"
    
    agent_id = Column(Uuid, ForeignKey("agents.id", ondelete="CASCADE"), index=True, nullable=False)
    alert_type = Column(String, nullable=False)
    message = Column(String, nullable=False)
    severity = Column(String, default="info")
    status = Column(String, default="active")
    action_data = Column(JSON, nullable=True)

class APIUsage(BaseModel):
    __tablename__ = "api_usage"
    
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=True)
    endpoint = Column(String, index=True, nullable=False)
    status_code = Column(Integer, nullable=False)
    latency_ms = Column(Integer, nullable=True)
