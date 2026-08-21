from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any

class TravelContext(BaseModel):
    """
    Contextual wrapper providing environmental grounding for the orchestrator.
    """
    user_id: str
    role: str = Field(..., description="Role of the user (e.g., 'traveler', 'agent')")
    session_id: Optional[str] = None
    active_trip_id: Optional[str] = None
    location_context: Optional[str] = None
    preferred_language: str = Field(default="English", description="e.g. English, Hindi, Hinglish")
    preferences: Optional[Dict[str, Any]] = Field(default_factory=dict)
    recent_searches: Optional[List[str]] = Field(default_factory=list)

class UIAction(BaseModel):
    """Represents a frontend widget to render."""
    widget_name: str
    props: Dict[str, Any] = Field(default_factory=dict)

class DataAction(BaseModel):
    """Represents a backend API or tool call required."""
    action_type: str
    endpoint: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)

class UniversalAIResponse(BaseModel):
    """
    The standardized output structure returned by the TravelAIOrchestrator to the frontend.
    """
    text: str = Field(..., description="The conversational response to display to the user.")
    ui_actions: List[UIAction] = Field(default_factory=list, description="Widgets the frontend should render.")
    data_actions: List[DataAction] = Field(default_factory=list, description="Data operations or pending tool calls.")
    requires_confirmation: bool = Field(default=False, description="Flag indicating if the user must explicitly approve the action.")
    hallucination_flag: bool = Field(default=False, description="Flag indicating if the guard detected a potential hallucination.")
    intent: Optional[str] = Field(None, description="The classified intent of the user request.")

from enum import Enum

class ConfidenceLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

class AIResponse(BaseModel):
    """
    Standardized top-level HTTP envelope for all AI endpoints.
    Never return raw model output directly to the client.
    """
    request_id: str = Field(..., description="Unique ID for the AI request lifecycle.")
    conversation_id: str = Field(..., description="Thread or session ID.")
    feature: str = Field(..., description="The TRAVELVERSE AI feature (e.g. 'TripGenie', 'AgentCopilot').")
    message: str = Field(..., description="The conversational response text (often mapped from UniversalAIResponse.text).")
    data: Dict[str, Any] = Field(default_factory=dict, description="Structured feature data or payload.")
    actions: List[Dict[str, Any]] = Field(default_factory=list, description="UI or Data actions the frontend should handle.")
    sources: List[str] = Field(default_factory=list, description="List of knowledge base or provider sources used to ground the response.")
    warnings: List[str] = Field(default_factory=list, description="Any warnings, such as hallucination flags or fallback notices.")
    confidence: ConfidenceLevel = Field(..., description="The confidence level of the response or intent classification.")
