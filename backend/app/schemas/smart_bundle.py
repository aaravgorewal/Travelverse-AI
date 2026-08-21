from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class BundleRequest(BaseModel):
    destination: str
    dates: str
    preferences: List[str] = Field(default_factory=list)
    budget: Optional[float] = None

class BundleComponent(BaseModel):
    type: str = Field(..., description="'flight', 'hotel', 'transfer', or 'experience'")
    name: str
    cost: float
    details: str

class SmartBundleResult(BaseModel):
    package_name: str
    components: List[BundleComponent]
    price: float = Field(..., description="Mathematically calculated by Python")
    currency: str = "USD"
    tradeoffs: str = Field(..., description="AI explanation of why this bundle was put together")
    warnings: List[str] = Field(default_factory=list)
