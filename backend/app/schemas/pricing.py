from pydantic import BaseModel, Field, field_validator
from datetime import datetime, timezone
from typing import Optional

class TrustedPrice(BaseModel):
    amount: float = Field(..., description="The numerical value of the price.")
    currency: str = Field(..., description="3-letter ISO currency code.")
    source: str = Field(..., description="The origin of the price (e.g., 'tbo', 'amadeus', 'manual').")
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    live: bool = Field(..., description="True if fetched live, False if cached or estimated.")
    
    @field_validator('amount')
    def amount_must_be_positive(cls, v):
        if v < 0:
            raise ValueError('Price amount must be zero or positive')
        return v
        
    @field_validator('currency')
    def currency_must_be_3_chars(cls, v):
        if len(v) != 3:
            raise ValueError('Currency must be a 3-letter ISO code')
        return v.upper()
