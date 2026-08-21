from sqlalchemy import Column, DateTime, Uuid
from sqlalchemy.sql import func
import uuid
from app.database.session import Base

class BaseModel(Base):
    __abstract__ = True

    id = Column(Uuid, primary_key=True, index=True, default=uuid.uuid4)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
