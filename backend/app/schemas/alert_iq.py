from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

class AlertIQItem(BaseModel):
    id: str
    category: str = Field(..., description="e.g., 'booking_change', 'customer_request', 'price_change'")
    priority_score: int = Field(..., description="1-100 score based on urgency and financial/customer impact")
    summary: str = Field(..., description="A short summary of what happened")
    recommended_action: str = Field(..., description="Actionable advice for the agent")

class AlertIQResult(BaseModel):
    agent_id: str
    total_alerts: int
    critical_alerts: int
    alerts: List[AlertIQItem] = Field(..., description="List of prioritized alerts")
