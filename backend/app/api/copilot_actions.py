from fastapi import APIRouter, Depends, HTTPException
import uuid

from app.models.ai import AIResponse, ConfidenceLevel
from app.schemas.copilot import CopilotChatRequest
from app.services.copilot import CopilotService
from app.ai.model_router import ModelRouter
from app.ai.grounding_guard import GroundingGuard
from app.services.deal_scope import DealScopeService

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])

_model_router = ModelRouter()
_guard = GroundingGuard(router=_model_router)
_deal_scope = DealScopeService(router=_model_router)
_copilot_service = CopilotService(router=_model_router, guard=_guard, deal_scope=_deal_scope)

def get_copilot_service() -> CopilotService:
    return _copilot_service

@router.post("/chat", response_model=AIResponse)
async def copilot_chat(
    request: CopilotChatRequest,
    service: CopilotService = Depends(get_copilot_service)
) -> AIResponse:
    """
    Agent Copilot endpoint.
    9-step orchestration engine for Travel Agents.
    """
    try:
        result = await service.handle_chat(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=request.conversation_id or str(uuid.uuid4()),
            feature="AgentCopilot",
            message=result.understanding,
            data=result.model_dump(),
            actions=[],
            sources=[],
            warnings=[],
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
