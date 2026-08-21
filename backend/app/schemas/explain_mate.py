from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class ProductData(BaseModel):
    product_id: str
    name: str
    category: str
    description: Optional[str] = None
    price: Optional[float] = None
    rating: Optional[float] = None
    features: List[str] = Field(default_factory=list)
    metadata: Dict[str, Any] = Field(default_factory=dict)

class ExplainRequest(BaseModel):
    product: ProductData
    user_context: str = Field(..., description="Details about what the user is looking for (e.g., 'family of 4, wants beach, budget conscious')")

class ExplainResult(BaseModel):
    match_reasons: List[str] = Field(..., description="Why this product fits the user context.")
    pros: List[str] = Field(..., description="General advantages of this product.")
    cons: List[str] = Field(..., description="General disadvantages or warnings.")
    tradeoffs: str = Field(..., description="Summary of tradeoffs the user is making by choosing this.")
    confidence: str = Field(..., description="high, medium, or low confidence in this recommendation.")
