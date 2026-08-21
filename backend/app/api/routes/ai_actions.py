from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from typing import Dict, Any, Optional, List
import json
import uuid
from pydantic import BaseModel

from app.schemas.orchestration import TravelContext, AIResponse, ConfidenceLevel
from app.schemas.ai_endpoints import (
    OptimizeItineraryRequest, OptimizeBudgetRequest, CompareRequest,
    ExplainRequest, RecommendRequest, DestinationRequest, PackingListRequest,
    TravelPulseRequest, SupportRequest, PersonalizeRequest, CreatePackageRequest,
    GenerateQuoteRequest, CopilotValidateRequest, CopilotQuoteRequest, CopilotPackageRequest,
    CustomerMessageRequest, AlertIQRequest
)
from app.ai.orchestrator import TravelAIOrchestrator
from app.ai.model_router import ModelRouter
from app.providers.gemini import GeminiProvider
from app.tools.registry import create_default_registry
from app.ai.action_gateway import ActionGateway, ActionConfirmationRequest, ActionPrepareRequest
from app.api.dependencies import get_current_user, get_current_traveler, get_current_agent
from app.models.identity import User
from app.database.session import AsyncSessionLocal
from app.services.conversation import ConversationService

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

@router.post("/prepare-action")
async def prepare_action(
    request: ActionPrepareRequest,
    gateway: ActionGateway = Depends(get_action_gateway),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    try:
        # Override user details with authenticated ones
        request.user_id = str(current_user.id)
        request.role = current_user.role
        token = await gateway.prepare_action(request)
        return {"status": "success", "token": token}
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/confirm-action")
async def confirm_action(
    request: ActionConfirmationRequest,
    gateway: ActionGateway = Depends(get_action_gateway),
    current_user: User = Depends(get_current_user)
) -> Dict[str, Any]:
    try:
        request.user_id = str(current_user.id)
        request.role = current_user.role
        return await gateway.execute_confirmed_action(request)
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    location_context: Optional[Dict[str, Any]] = None

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
async def chat(request: ChatRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_user)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role, preferences=request.preferences or {}, location_context=request.location_context)
    return await execute_feature("Global Assistant", request.message, ctx, orchestrator, request.conversation_id)

@router.post("/chat/stream")
async def chat_stream(request: ChatRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_user)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role, preferences=request.preferences or {}, location_context=request.location_context)
    
    async def event_generator():
        try:
            stream_gen = await orchestrator.execute_stream(request.message, ctx, feature_override="Global Assistant")
            async for chunk in stream_gen:
                yield chunk
        except Exception as e:
            yield f"data: {json.dumps({'event': 'error', 'content': str(e)})}\n\n"
            
    return StreamingResponse(event_generator(), media_type="text/event-stream")

@router.post("/plan-trip", response_model=AIResponse)
async def plan_trip(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role, preferences=request.get("preferences", {}))
    msg = f"Plan a trip to {request.get('destination')} for {request.get('dates')}. Context: {json.dumps(request)}"
    return await execute_feature("TripGenie", msg, ctx, orchestrator)

@router.post("/optimize-itinerary", response_model=AIResponse)
async def optimize_itinerary(request: OptimizeItineraryRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Optimize this itinerary based on routes: {json.dumps(request)}"
    return await execute_feature("SmartRoute", msg, ctx, orchestrator)

@router.post("/optimize-budget", response_model=AIResponse)
async def optimize_budget(request: OptimizeBudgetRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Optimize my budget: {json.dumps(request)}"
    return await execute_feature("SmartBudget", msg, ctx, orchestrator)

@router.post("/compare", response_model=AIResponse)
async def compare(request: CompareRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Compare these options: {json.dumps(request)}"
    return await execute_feature("DealScope", msg, ctx, orchestrator)

@router.post("/explain", response_model=AIResponse)
async def explain(request: ExplainRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Explain this recommendation: {json.dumps(request)}"
    return await execute_feature("ExplainMate", msg, ctx, orchestrator)

@router.post("/recommend", response_model=AIResponse)
async def recommend(request: RecommendRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Recommend activities: {json.dumps(request)}"
    return await execute_feature("ExploreMore", msg, ctx, orchestrator)

@router.post("/destination", response_model=AIResponse)
async def get_destination_knowledge(request: DestinationRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Tell me about this destination: {json.dumps(request)}"
    return await execute_feature("LocalSense", msg, ctx, orchestrator)

@router.post("/packing-list", response_model=AIResponse)
async def generate_packing_list(request: PackingListRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Generate a packing list for: {json.dumps(request)}"
    return await execute_feature("PackMate", msg, ctx, orchestrator)

@router.post("/travel-pulse", response_model=AIResponse)
async def analyze_travel_pulse(request: TravelPulseRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Analyze travel disruptions for: {json.dumps(request)}"
    return await execute_feature("TravelPulse", msg, ctx, orchestrator)

@router.post("/support", response_model=AIResponse)
async def get_support(request: SupportRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_traveler)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"I need emergency support: {json.dumps(request)}"
    return await execute_feature("SafeNest", msg, ctx, orchestrator)

@router.post("/personalize", response_model=AIResponse)
async def personalize(request: PersonalizeRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role) 
    msg = f"Generate a Client360 profile for: {json.dumps(request)}"
    return await execute_feature("Client360", msg, ctx, orchestrator)

@router.post("/create-package", response_model=AIResponse)
async def create_package(request: CreatePackageRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role)
    msg = f"Bundle this package: {json.dumps(request)}"
    return await execute_feature("SmartBundle", msg, ctx, orchestrator)

@router.post("/validate-package", response_model=AIResponse)
async def validate_package(request: CopilotValidateRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    # 1. Deterministic checks
    validation_result = PackageValidatorService.validate(request)
    
    # 2. Halt on blocking errors
    if not validation_result.is_valid:
        return AIResponse(
            request_id="pkg-val",
            conversation_id="pkg-val-session",
            feature="Package Validation",
            message="Blocking errors found in package. Cannot proceed.",
            data=validation_result.model_dump(),
            actions=[],
            sources=["Deterministic Validator"],
            warnings=[],
            confidence="high",
            mock=False
        )
        
    # 3. Consult Gemini for higher level recommendations since it's valid
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role)
    msg = f"Package passed deterministic checks. Provide high-level recommendations for this package: {request.model_dump_json()}"
    return await execute_feature("Package Validation", msg, ctx, orchestrator)

@router.post("/generate-quote", response_model=AIResponse)
async def generate_quote(request: GenerateQuoteRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role)
    msg = f"Generate a quote for: {json.dumps(request)}"
    return await execute_feature("SmartQuote", msg, ctx, orchestrator)

@router.post("/customer-message", response_model=AIResponse)
async def customer_message(request: CustomerMessageRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role, customer_id=request.get("customer_id"))
    return await execute_feature("Customer Message", request.get("message", ""), ctx, orchestrator)

@router.get("/conversations")
async def list_conversations(current_user: User = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        service = ConversationService(session)
        conversations = await service.list_conversations(str(current_user.id))
        return [{"id": str(c.id), "title": c.title, "status": c.status, "created_at": c.created_at} for c in conversations]

@router.get("/conversations/{conversation_id}")
async def get_conversation(conversation_id: str, current_user: User = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        service = ConversationService(session)
        try:
            messages = await service.get_conversation_history(str(current_user.id), conversation_id)
            return [{"id": str(m.id), "role": m.role, "content": m.content, "created_at": m.created_at} for m in messages]
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str, current_user: User = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        service = ConversationService(session)
        try:
            await service.delete_conversation(str(current_user.id), conversation_id)
            return {"status": "success"}
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))

@router.post("/voice", response_model=AIResponse)
async def handle_voice(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_user: User = Depends(get_current_user)):
    ctx = TravelContext(user_id=str(current_user.id), role=current_user.role)
    msg = f"Voice Request: {json.dumps(request)}"
    return await execute_feature("Voice AI", msg, ctx, orchestrator)

@router.post("/alert-iq", response_model=AIResponse)
async def handle_alert_iq(request: AlertIQRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role)
    msg = f"Generate proactive AlertIQ warnings for: {json.dumps(request)}"
    return await execute_feature("AlertIQ", msg, ctx, orchestrator)

@router.delete("/memory/{key}")
async def delete_memory(key: str, current_user: User = Depends(get_current_user)):
    async with AsyncSessionLocal() as session:
        service = ConversationService(session)
        try:
            await service.delete_memory(str(current_user.id), key)
            return {"status": "success"}
        except PermissionError as e:
            raise HTTPException(status_code=403, detail=str(e))
