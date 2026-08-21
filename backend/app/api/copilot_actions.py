from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.api.routes.dependencies import get_current_agent
from app.models.identity import User

from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import uuid

from app.schemas.orchestration import TravelContext, AIResponse, ConfidenceLevel
from app.schemas.copilot import CopilotChatRequest, CopilotPackageRequest, CopilotValidateRequest, CopilotQuoteRequest
from app.schemas.package_validator import PackageValidationRequest
from app.services.copilot import CopilotService
from app.services.package_validator_service import PackageValidatorService
from app.ai.model_router import ModelRouter
from app.ai.grounding_guard import GroundingGuard
from app.services.deal_scope import DealScopeService

router = APIRouter(prefix="/api/v1/copilot", tags=["copilot"])

class CopilotRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    customer_id: Optional[str] = None
    trip_id: Optional[str] = None

@router.post("/chat", response_model=AIResponse)
async def copilot_chat(
    request: CopilotRequest,
    current_agent: User = Depends(get_current_agent)
) -> AIResponse:
    """
    Agent Copilot chat endpoint executing a strict 9-step package generation pipeline.
    """
    # Initialize service dependencies (In real app, inject via FastAPI Depends)
    service = CopilotService(ModelRouter(), GroundingGuard(), DealScopeService())
    
    # Map to internal CopilotChatRequest
    internal_req = CopilotChatRequest(
        agent_id=str(current_agent.id),
        customer_id=request.customer_id,
        trip_id=request.trip_id,
        prompt=request.message,
        conversation_id=request.conversation_id
    )
    
    result = await service.handle_chat(internal_req)
    
    return AIResponse(
        request_id="copilot-request",
        conversation_id=request.conversation_id or "new",
        feature="AgentCopilot",
        message=result.understanding,
        data={"status": result.status, "agent_notes": result.agent_notes, "quotation": result.quotation.model_dump() if result.quotation else None},
        actions=[],
        sources=["TBO", "Google Places"],
        warnings=[],
        confidence="high",
        mock=False
    )

@router.post("/package", response_model=AIResponse)
async def copilot_package(
    request: CopilotPackageRequest,
    current_agent: User = Depends(get_current_agent)
) -> AIResponse:
    """Create a package for a customer."""
    # In a full implementation, this routes to the creation logic.
    return AIResponse(
        request_id="package-req",
        conversation_id="new",
        feature="Copilot Package",
        message=f"Created package for {request.destination}.",
        data={"budget": request.budget, "travelers": request.travelers},
        actions=[],
        sources=[],
        warnings=[],
        confidence="high",
        mock=True
    )

@router.post("/validate", response_model=AIResponse)
async def copilot_validate(
    request: CopilotValidateRequest,
    current_agent: User = Depends(get_current_agent)
) -> AIResponse:
    """Validate an existing package."""
    return AIResponse(
        request_id="val-req",
        conversation_id="new",
        feature="Copilot Validate",
        message=f"Package {request.package_id} is valid.",
        data={},
        actions=[],
        sources=[],
        warnings=[],
        confidence="high",
        mock=True
    )

@router.post("/quote", response_model=AIResponse)
async def copilot_quote(
    request: CopilotQuoteRequest,
    current_agent: User = Depends(get_current_agent)
) -> AIResponse:
    """Generate a quote."""
    return AIResponse(
        request_id="quote-req",
        conversation_id="new",
        feature="Copilot Quote",
        message=f"Quote generated for {request.package_id}.",
        data={"margin": request.margin},
        actions=[],
        sources=[],
        warnings=[],
        confidence="high",
        mock=True
    )

@router.get("/alerts", response_model=AIResponse)
async def copilot_alerts(
    current_agent: User = Depends(get_current_agent)
) -> AIResponse:
    """Get active alerts."""
    return AIResponse(
        request_id="alerts-req",
        conversation_id="new",
        feature="Copilot Alerts",
        message="No critical alerts at this time.",
        data={"alerts": []},
        actions=[],
        sources=[],
        warnings=[],
        confidence="high",
        mock=True
    )
