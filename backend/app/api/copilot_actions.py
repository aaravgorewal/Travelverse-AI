from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import uuid

from app.schemas.orchestration import TravelContext, AIResponse, ConfidenceLevel
from app.ai.orchestrator import TravelAIOrchestrator
from app.api.routes.dependencies import get_current_agent
from app.models.identity import User
from app.api.routes.ai_actions import get_orchestrator, execute_feature
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])

class CopilotChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    customer_id: Optional[str] = None
    trip_id: Optional[str] = None

@router.post("/chat", response_model=AIResponse)
async def copilot_chat(
    request: CopilotChatRequest,
    orchestrator: TravelAIOrchestrator = Depends(get_orchestrator),
    current_agent: User = Depends(get_current_agent)
) -> AIResponse:
    """
    Agent Copilot chat endpoint connecting to unified orchestrator.
    Determines agent identity, authorization, available tools.
    """
    ctx = TravelContext(
        user_id=str(current_agent.id), 
        role=current_agent.role,
        customer_id=request.customer_id,
        trip_id=request.trip_id
    )
    return await execute_feature("Agent Copilot", request.message, ctx, orchestrator, request.conversation_id)
