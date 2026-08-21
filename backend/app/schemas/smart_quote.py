from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class QuoteRequestItem(BaseModel):
    id: str
    type: str
    name: str
    price: float
    confirmed_details: str = Field(..., description="Details from backend inventory that must not be hallucinated")

class QuoteRequest(BaseModel):
    customer_name: str
    package_name: str
    items: List[QuoteRequestItem]
    total_price: float
    currency: str = "USD"
    agent_name: str

class QuoteSection(BaseModel):
    title: str
    content: str = Field(..., description="Polished, professional text for this section")

class SmartQuoteResult(BaseModel):
    header_message: str = Field(..., description="A warm greeting to the customer")
    sections: List[QuoteSection] = Field(..., description="Sections detailing the package (e.g., 'Your Flights', 'Your Accommodation')")
    terms_summary: str = Field(..., description="A polite summary of booking terms/conditions")
