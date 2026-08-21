from sqlalchemy import Column, DateTime, String
from sqlalchemy.sql import func
import uuid
from app.database.session import Base

class BaseModel(Base):
    __abstract__ = True

    id = Column(String(36), primary_key=True, index=True, default=lambda: str(uuid.uuid4()))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
