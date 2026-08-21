from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.ai.action_gateway import ActionGateway, ActionConfirmationRequest
from app.tools.registry import create_default_registry

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# In a real app, ToolRegistry should be injected as a dependency or exist as a singleton.
# For demonstration, we'll instantiate it here with default tools.
_registry = create_default_registry()
_gateway = ActionGateway(tool_registry=_registry)

def get_action_gateway() -> ActionGateway:
    return _gateway

@router.post("/confirm-action")
async def confirm_action(
    request: ActionConfirmationRequest,
    gateway: ActionGateway = Depends(get_action_gateway)
) -> Dict[str, Any]:
    """
    Confirms and executes a sensitive AI-proposed action.
    Validates user, permissions, and explicit confirmation flag before execution.
    """
    try:
        result = await gateway.execute_confirmed_action(request)
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from pydantic import BaseModel
from typing import Optional
import uuid

from app.schemas.orchestration import TravelContext, AIResponse, ConfidenceLevel
from app.ai.orchestrator import TravelAIOrchestrator
from app.ai.model_router import ModelRouter
from app.providers.ai_base import AIProvider
from app.providers.gemini import GeminiProvider

class ChatRequest(BaseModel):
    message: str
    context: TravelContext
    conversation_id: Optional[str] = None

# Instantiate dependencies
_ai_provider = GeminiProvider()
_model_router = ModelRouter(provider=_ai_provider)
_orchestrator = TravelAIOrchestrator(router=_model_router, tool_registry=_registry)

def get_orchestrator() -> TravelAIOrchestrator:
    return _orchestrator

def map_intent_to_feature(intent: str) -> str:
    """Routes an intent to its consumer-facing feature name."""
    mapping = {
        "TRIP_PLANNING": "TripGenie",
        "ITINERARY_OPTIMIZATION": "TripGenie",
        "BUDGET_OPTIMIZATION": "SmartBudget",
        "DESTINATION_INFO": "ExplainMate",
        "RECOMMENDATION": "ExploreMore",
        "EXPERIENCE_SEARCH": "ExploreMore",
        "PACKING": "PackMate",
        "BOOKING_CHANGE": "TravelPulse",
        "BOOKING_CANCELLATION": "TravelPulse",
        "TRAVEL_SUPPORT": "SafeNest",
        "AGENT_COPILOT": "Agent Copilot",
        "PACKAGE_CREATION": "Agent Copilot",
        "QUOTE_GENERATION": "Agent Copilot",
        "CUSTOMER_MESSAGE": "Agent Copilot",
        "FLIGHT_SEARCH": "Global Assistant",
        "HOTEL_SEARCH": "Global Assistant",
        "GENERAL_CHAT": "Global Assistant"
    }
    return mapping.get(intent, "Global Assistant")

@router.post("/chat", response_model=AIResponse)
async def chat(
    request: ChatRequest,
    orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)
) -> AIResponse:
    """
    Global Travel Assistant endpoint.
    Understands natural language and routes it through the central Orchestrator.
    """
    try:
        # Run the 13-step intelligence pipeline
        orchestrator_response = await orchestrator.execute(request.message, request.context)
        
        feature_name = map_intent_to_feature(orchestrator_response.intent) if orchestrator_response.intent else "Global Assistant"
        
        # Serialize actions to dictionaries for the JSON response
        actions_list = []
        for ui in orchestrator_response.ui_actions:
            actions_list.append({"type": "ui", "widget": ui.widget_name, "props": ui.props})
        for da in orchestrator_response.data_actions:
            actions_list.append({"type": "data", "action": da.action_type, "endpoint": da.endpoint, "payload": da.payload})
            
        warnings = []
        if orchestrator_response.hallucination_flag:
            warnings.append("Hallucination detected and sanitized. Please verify prices.")
        if orchestrator_response.requires_confirmation:
            warnings.append("Action requires explicit user confirmation.")
            
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=request.conversation_id or str(uuid.uuid4()),
            feature=feature_name,
            message=orchestrator_response.text,
            data={"intent": orchestrator_response.intent},
            actions=actions_list,
            sources=[], # Will populate when RAG is fully integrated
            warnings=warnings,
            confidence=ConfidenceLevel.HIGH if not orchestrator_response.hallucination_flag else ConfidenceLevel.MEDIUM
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
