from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any, Optional
import json
import uuid
from pydantic import BaseModel

from app.schemas.orchestration import TravelContext, AIResponse, ConfidenceLevel
from app.ai.orchestrator import TravelAIOrchestrator
from app.ai.model_router import ModelRouter
from app.providers.gemini import GeminiProvider
from app.tools.registry import create_default_registry
from app.ai.action_gateway import ActionGateway, ActionConfirmationRequest

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# --- Core Singletons ---
_registry = create_default_registry()
_gateway = ActionGateway(tool_registry=_registry)
_ai_provider = GeminiProvider()
_model_router = ModelRouter(provider=_ai_provider)
_orchestrator = TravelAIOrchestrator(router=_model_router, tool_registry=_registry)

def get_action_gateway() -> ActionGateway:
    return _gateway

def get_orchestrator() -> TravelAIOrchestrator:
    return _orchestrator

@router.post("/confirm-action")
async def confirm_action(
    request: ActionConfirmationRequest,
    gateway: ActionGateway = Depends(get_action_gateway)
) -> Dict[str, Any]:
    try:
        return await gateway.execute_confirmed_action(request)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str
    context: TravelContext
    conversation_id: Optional[str] = None

# --- Unified AI Orchestrator Adapter ---
async def execute_feature(
    feature_name: str, 
    user_message: str, 
    context: TravelContext, 
    orchestrator: TravelAIOrchestrator, 
    conversation_id: Optional[str] = None
) -> AIResponse:
    try:
        # Route through the unified pipeline
        orchestrator_response = await orchestrator.execute(user_message, context, feature_override=feature_name)
        
        actions_list = []
        for ui in orchestrator_response.ui_actions:
            actions_list.append({"type": "ui", "widget": ui.widget_name, "props": ui.props})
        for da in orchestrator_response.data_actions:
            actions_list.append({"type": "data", "action": da.action_type, "endpoint": da.endpoint, "payload": da.payload})
            
        warnings = []
        if orchestrator_response.hallucination_flag:
            warnings.append("Hallucination detected and sanitized. Please verify details.")
        if orchestrator_response.requires_confirmation:
            warnings.append("Action requires explicit user confirmation.")
            
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=conversation_id or str(uuid.uuid4()),
            feature=feature_name,
            message=orchestrator_response.text,
            data={"intent": orchestrator_response.intent},
            actions=actions_list,
            sources=[], 
            warnings=warnings,
            confidence=ConfidenceLevel.HIGH if not orchestrator_response.hallucination_flag else ConfidenceLevel.MEDIUM
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", response_model=AIResponse)
async def chat(request: ChatRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    # Natural routing without feature override
    return await execute_feature("Global Assistant", request.message, request.context, orchestrator, request.conversation_id)

@router.post("/plan-trip", response_model=AIResponse)
async def plan_trip(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler", preferences=request.get("preferences", {}))
    msg = f"Plan a trip to {request.get('destination')} for {request.get('dates')}. Context: {json.dumps(request)}"
    return await execute_feature("TripGenie", msg, ctx, orchestrator)

@router.post("/optimize-itinerary", response_model=AIResponse)
async def optimize_itinerary(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Optimize this itinerary based on routes: {json.dumps(request)}"
    return await execute_feature("SmartRoute", msg, ctx, orchestrator)

@router.post("/optimize-budget", response_model=AIResponse)
async def optimize_budget(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Optimize my budget: {json.dumps(request)}"
    return await execute_feature("SmartBudget", msg, ctx, orchestrator)

@router.post("/compare", response_model=AIResponse)
async def compare(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Compare these options: {json.dumps(request)}"
    return await execute_feature("DealScope", msg, ctx, orchestrator)

@router.post("/explain", response_model=AIResponse)
async def explain(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Explain this recommendation: {json.dumps(request)}"
    return await execute_feature("ExplainMate", msg, ctx, orchestrator)

@router.post("/recommend", response_model=AIResponse)
async def recommend(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Recommend activities: {json.dumps(request)}"
    return await execute_feature("ExploreMore", msg, ctx, orchestrator)

@router.post("/destination", response_model=AIResponse)
async def get_destination_knowledge(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Tell me about this destination: {json.dumps(request)}"
    return await execute_feature("LocalSense", msg, ctx, orchestrator)

@router.post("/packing-list", response_model=AIResponse)
async def generate_packing_list(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Generate a packing list for: {json.dumps(request)}"
    return await execute_feature("PackMate", msg, ctx, orchestrator)

@router.post("/travel-pulse", response_model=AIResponse)
async def analyze_travel_pulse(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Analyze travel disruptions for: {json.dumps(request)}"
    return await execute_feature("TravelPulse", msg, ctx, orchestrator)

@router.post("/support", response_model=AIResponse)
async def get_support(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"I need emergency support: {json.dumps(request)}"
    return await execute_feature("SafeNest", msg, ctx, orchestrator)

@router.post("/personalize", response_model=AIResponse)
async def personalize(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="agent") # Must be agent for Client360
    msg = f"Generate a Client360 profile for: {json.dumps(request)}"
    return await execute_feature("Client360", msg, ctx, orchestrator)

@router.post("/create-package", response_model=AIResponse)
async def create_package(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="agent")
    msg = f"Bundle this package: {json.dumps(request)}"
    return await execute_feature("SmartBundle", msg, ctx, orchestrator)

@router.post("/validate-package", response_model=AIResponse)
async def validate_package(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="agent")
    msg = f"Validate this package for logistics: {json.dumps(request)}"
    return await execute_feature("Package Validator", msg, ctx, orchestrator)

@router.post("/generate-quote", response_model=AIResponse)
async def generate_quote(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="agent")
    msg = f"Generate a quote for: {json.dumps(request)}"
    return await execute_feature("SmartQuote", msg, ctx, orchestrator)

@router.post("/customer-message", response_model=AIResponse)
async def generate_customer_message(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="agent")
    msg = f"Draft a customer message: {json.dumps(request)}"
    return await execute_feature("Customer Message", msg, ctx, orchestrator)

@router.post("/voice", response_model=AIResponse)
async def handle_voice(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="traveler")
    msg = f"Voice Request: {json.dumps(request)}"
    return await execute_feature("Voice AI", msg, ctx, orchestrator)

# Note: AlertIQ is primarily a background task but we can expose it if needed
@router.post("/alert-iq", response_model=AIResponse)
async def handle_alert_iq(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator)):
    ctx = TravelContext(user_id="default_user", role="agent")
    msg = f"Generate proactive AlertIQ warnings for: {json.dumps(request)}"
    return await execute_feature("AlertIQ", msg, ctx, orchestrator)
