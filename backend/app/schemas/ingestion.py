from pydantic import BaseModel, Field, validator
from typing import Optional, Any
from datetime import datetime

class IngestedRecord(BaseModel):
    """
    Standard schema for all records ingested into TRAVELVERSE AI.
    """
    dataset_name: str = Field(..., description="The name of the dataset this record belongs to")
    dataset_version: str = Field(default="1.0", description="The version of the dataset")
    source: str = Field(..., description="The original source of the data (e.g., 'wiki', 'tbo', 'manual')")
    source_url: Optional[str] = Field(None, description="The URL or path to the source")
    record_id: str = Field(..., description="The unique identifier from the source system")
    license: str = Field(..., description="License type for the content. Must be explicitly provided.")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Payload can be any valid JSON structure representing the actual record data
    payload: dict[str, Any] = Field(..., description="The actual data payload")

    @validator("license")
    def validate_license(cls, v):
        if not v or v.strip().lower() in ["none", "unknown", ""]:
            raise ValueError("Records must have an explicitly defined valid license. Unknown or unlicensed content is rejected.")
        return v
