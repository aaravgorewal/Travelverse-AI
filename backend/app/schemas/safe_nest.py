from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class SupportRequest(BaseModel):
    problem_description: str
    location: Optional[str] = None
    trip_id: Optional[str] = None

class TrustedResource(BaseModel):
    name: str
    contact_info: str
    type: str = Field(..., description="e.g. 'Embassy', 'Airline', 'Local Emergency'")

class SupportResult(BaseModel):
    problem_summary: str = Field(..., description="Brief summary of the issue understood by AI")
    immediate_steps: List[str] = Field(..., description="Immediate, safe steps the user should take right now")
    trusted_resources: List[TrustedResource] = Field(..., description="Verified backend contacts ONLY")
    next_actions: List[str] = Field(..., description="Longer term resolution steps")
    warnings: List[str] = Field(default_factory=list, description="Safety or financial warnings")
