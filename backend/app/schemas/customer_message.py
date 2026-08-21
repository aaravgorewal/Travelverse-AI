from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CustomerMessageRequest(BaseModel):
    message_type: str = Field(..., description="'quotation', 'itinerary', 'reminder', 'change_notification', or 'follow_up'")
    customer_name: str
    agent_name: str
    trip_details: Dict[str, Any] = Field(default_factory=dict, description="Verified backend data (e.g. flight times, hotel, price)")
    tone: str = Field("professional", description="e.g. 'professional', 'warm', 'urgent'")

class CustomerMessageResult(BaseModel):
    subject: str = Field(..., description="Email or message subject line")
    body: str = Field(..., description="The main body of the message")
    call_to_action: Optional[str] = Field(None, description="E.g., 'Click here to pay', 'Please confirm your passport details'")
