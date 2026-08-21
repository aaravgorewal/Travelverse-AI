from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class CopilotChatRequest(BaseModel):
    agent_id: str
    prompt: str = Field(..., description="Natural language prompt from the agent")
    customer_id: Optional[str] = None
    conversation_id: Optional[str] = None

class CopilotPackageItem(BaseModel):
    type: str = Field(..., description="e.g. flight, hotel, activity")
    name: str
    cost: float
    details: str

class CopilotPackage(BaseModel):
    items: List[CopilotPackageItem]
    subtotal: float
    markup: float
    total: float
    currency: str = "USD"

class CopilotChatResult(BaseModel):
    understanding: str = Field(..., description="What Copilot understood from the prompt")
    status: str = Field(..., description="'success', 'partial', or 'needs_info'")
    quotation: Optional[CopilotPackage] = Field(None, description="The final package for the customer")
    agent_notes: str = Field(..., description="Internal tradeoffs, warnings, math breakdown for the agent only")
    missing_info_needed: Optional[str] = Field(None, description="If status is needs_info, what is missing")
