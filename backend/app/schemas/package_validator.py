from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from enum import Enum

class ValidationComponent(BaseModel):
    id: str
    type: str = Field(..., description="'flight', 'hotel', 'transfer', or 'activity'")
    name: str
    start_time: str = Field(..., description="ISO8601 datetime string")
    end_time: str = Field(..., description="ISO8601 datetime string")
    cost: float
    guests: int
    location: Optional[str] = None

class PackageValidationRequest(BaseModel):
    budget_limit: float
    traveler_count: int
    components: List[ValidationComponent]

class ValidationCheck(str, Enum):
    DATE_CONFLICT = "date_conflict"
    ACTIVITY_OVERLAP = "activity_overlap"
    ROUTE_FEASIBILITY = "route_feasibility"
    BUDGET = "budget"
    TRAVELER_COUNT = "traveler_count"
    MISSING_TRANSFER = "missing_transfer"
    DUPLICATE_PRODUCT = "duplicate_product"
    INVALID_DATES = "invalid_dates"
    INVALID_INVENTORY = "invalid_inventory"
    BOOKING_STATE = "booking_state"

class ValidationSeverity(str, Enum):
    ERROR = "error"
    WARNING = "warning"
    PASS = "pass"

class ValidationItem(BaseModel):
    check: ValidationCheck
    severity: ValidationSeverity
    message: str
    related_items: List[str] = Field(default_factory=list, description="IDs of package items involved")

class ValidationResult(BaseModel):
    is_valid: bool = True
    errors: List[ValidationItem] = Field(default_factory=list, description="Hard deterministic failures (e.g. math/dates)")
    warnings: List[ValidationItem] = Field(default_factory=list, description="Soft AI-detected logistical issues")
    passed_checks: List[ValidationItem] = Field(default_factory=list, description="Passed deterministic checks")
