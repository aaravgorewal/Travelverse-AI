from sqlalchemy import Column, String, Integer, DateTime
from sqlalchemy.sql import func
from .base import BaseModel

class DatasetRegistry(BaseModel):
    __tablename__ = "dataset_registry"
    
    # We can rely on BaseModel's id for dataset_id, but if a specific semantic dataset_id is needed, we can define one. 
    # For now, BaseModel.id acts as dataset_id.
    
    dataset_name = Column(String, index=True, nullable=False)
    version = Column(String, nullable=True)
    source = Column(String, nullable=False)
    license = Column(String, nullable=False)
    status = Column(String, default="active") # active, archiving, processing, error
    record_count = Column(Integer, default=0)
    
    # last_updated is handled by BaseModel.updated_at, but we can explicitly add one for the registry semantic meaning if preferred.
    # We will just rely on BaseModel's updated_at.
