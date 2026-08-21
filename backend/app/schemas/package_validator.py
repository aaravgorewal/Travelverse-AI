from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ValidationComponent(BaseModel):
    id: str
    type: str = Field(..., description="'flight', 'hotel', 'transfer', or 'activity'")
    name: str
    start_time: str = Field(..., description="ISO8601 datetime string")
    end_time: str = Field(..., description="ISO8601 datetime string")
    cost: float
    guests: int

class PackageValidationRequest(BaseModel):
    budget_limit: float
    traveler_count: int
    components: List[ValidationComponent]

class ValidationResult(BaseModel):
    is_valid: bool
    errors: List[str] = Field(default_factory=list, description="Hard deterministic failures (e.g. math/dates)")
    warnings: List[str] = Field(default_factory=list, description="Soft AI-detected logistical issues")
