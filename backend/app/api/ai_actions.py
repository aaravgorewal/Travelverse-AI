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

from app.schemas.smart_route import ItineraryOptimizationRequest
from app.services.smart_route import SmartRouteService
from app.providers.google_maps import GoogleMapsProvider

_maps_provider = GoogleMapsProvider()
_smart_route_service = SmartRouteService(maps_provider=_maps_provider, router=_model_router)

def get_smart_route_service() -> SmartRouteService:
    return _smart_route_service

@router.post("/optimize-itinerary", response_model=AIResponse)
async def optimize_itinerary(
    request: ItineraryOptimizationRequest,
    service: SmartRouteService = Depends(get_smart_route_service)
) -> AIResponse:
    """
    SmartRoute endpoint.
    Optimizes an itinerary using Google Maps distance matrix and Gemini logic.
    """
    try:
        result = await service.optimize(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="SmartRoute",
            message="Your itinerary has been optimized based on travel times and your preferences.",
            data=result.model_dump(),
            actions=[],
            sources=["google_maps"],
            warnings=result.warnings,
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.smart_budget import BudgetOptimizationRequest
from app.services.smart_budget import SmartBudgetService

_smart_budget_service = SmartBudgetService(router=_model_router)

def get_smart_budget_service() -> SmartBudgetService:
    return _smart_budget_service

@router.post("/optimize-budget", response_model=AIResponse)
async def optimize_budget(
    request: BudgetOptimizationRequest,
    service: SmartBudgetService = Depends(get_smart_budget_service)
) -> AIResponse:
    """
    SmartBudget endpoint.
    Optimizes a budget using Python for math and Gemini for reasoning.
    """
    try:
        result = await service.optimize(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="SmartBudget",
            message="Your budget analysis is complete.",
            data=result.model_dump(),
            actions=[],
            sources=[],
            warnings=[],
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.trip_genie import TripPlanningRequest
from app.services.trip_genie import TripGenieService
from app.ai.grounding_guard import GroundingGuard

_grounding_guard = GroundingGuard(router=_model_router)
_trip_genie_service = TripGenieService(router=_model_router, guard=_grounding_guard)

def get_trip_genie_service() -> TripGenieService:
    return _trip_genie_service

@router.post("/plan-trip", response_model=AIResponse)
async def plan_trip(
    request: TripPlanningRequest,
    service: TripGenieService = Depends(get_trip_genie_service)
) -> AIResponse:
    """
    TripGenie flagship endpoint.
    Orchestrates multiple external APIs, generates the itinerary via Gemini,
    and calculates final budgets deterministically.
    """
    try:
        result = await service.plan_trip(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="TripGenie",
            message="I've generated a comprehensive itinerary for your trip.",
            data=result.model_dump(),
            actions=[],
            sources=["google_places", "weather_provider"],
            warnings=result.warnings,
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.deal_scope import ComparisonRequest
from app.services.deal_scope import DealScopeService

_deal_scope_service = DealScopeService(router=_model_router)

def get_deal_scope_service() -> DealScopeService:
    return _deal_scope_service

@router.post("/compare", response_model=AIResponse)
async def compare(
    request: ComparisonRequest,
    service: DealScopeService = Depends(get_deal_scope_service)
) -> AIResponse:
    """
    DealScope endpoint.
    Determines winners using Python math, then uses Gemini to explain the qualitative tradeoffs.
    """
    try:
        result = await service.compare(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="DealScope",
            message="Here is a comparison of your options.",
            data=result.model_dump(),
            actions=[],
            sources=[],
            warnings=[],
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.explain_mate import ExplainRequest
from app.services.explain_mate import ExplainMateService

_explain_mate_service = ExplainMateService(router=_model_router)

def get_explain_mate_service() -> ExplainMateService:
    return _explain_mate_service

@router.post("/explain", response_model=AIResponse)
async def explain(
    request: ExplainRequest,
    service: ExplainMateService = Depends(get_explain_mate_service)
) -> AIResponse:
    """
    ExplainMate endpoint.
    Explains why a product was recommended based purely on the provided data.
    """
    try:
        result = await service.explain(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="ExplainMate",
            message="Here is why I recommended this for you.",
            data=result.model_dump(),
            actions=[],
            sources=[],
            warnings=[],
            confidence=result.confidence
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.explore_more import RecommendationRequest
from app.services.explore_more import ExploreMoreService

_explore_more_service = ExploreMoreService(router=_model_router)

def get_explore_more_service() -> ExploreMoreService:
    return _explore_more_service

@router.post("/recommend", response_model=AIResponse)
async def recommend(
    request: RecommendationRequest,
    service: ExploreMoreService = Depends(get_explore_more_service)
) -> AIResponse:
    """
    ExploreMore endpoint.
    Hyper-local recommendation engine grounded in Google Places data.
    """
    try:
        result = await service.recommend(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="ExploreMore",
            message=f"I found {len(result.recommendations)} personalized recommendations for you.",
            data=result.model_dump(),
            actions=[],
            sources=["google_places"],
            warnings=[],
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.local_sense import DestinationKnowledgeRequest
from app.services.local_sense import LocalSenseService

_local_sense_service = LocalSenseService(router=_model_router)

def get_local_sense_service() -> LocalSenseService:
    return _local_sense_service

@router.post("/destination", response_model=AIResponse)
async def get_destination_knowledge(
    request: DestinationKnowledgeRequest,
    service: LocalSenseService = Depends(get_local_sense_service)
) -> AIResponse:
    """
    LocalSense endpoint.
    Destination intelligence engine using RAG to pull cultural and regulatory context.
    """
    try:
        result = await service.get_destination_knowledge(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="LocalSense",
            message=f"Here is what you need to know about {request.destination}.",
            data=result.model_dump(),
            actions=[],
            sources=result.sources,
            warnings=[],
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.pack_mate import PackingRequest
from app.services.pack_mate import PackMateService

_pack_mate_service = PackMateService(router=_model_router)

def get_pack_mate_service() -> PackMateService:
    return _pack_mate_service

@router.post("/packing-list", response_model=AIResponse)
async def generate_packing_list(
    request: PackingRequest,
    service: PackMateService = Depends(get_pack_mate_service)
) -> AIResponse:
    """
    PackMate endpoint.
    Generates a categorized packing list based on destination, weather, and activities.
    """
    try:
        result = await service.generate_list(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="PackMate",
            message="Here is your personalized packing list.",
            data=result.model_dump(),
            actions=[],
            sources=["weather_provider"] if result.weather_context else [],
            warnings=result.warnings,
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

from app.schemas.travel_pulse import TravelPulseRequest
from app.services.travel_pulse import TravelPulseService

_travel_pulse_service = TravelPulseService(router=_model_router)

def get_travel_pulse_service() -> TravelPulseService:
    return _travel_pulse_service

@router.post("/travel-pulse", response_model=AIResponse)
async def analyze_travel_pulse(
    request: TravelPulseRequest,
    service: TravelPulseService = Depends(get_travel_pulse_service)
) -> AIResponse:
    """
    TravelPulse endpoint.
    Proactive trip monitoring separating factual event detection from AI explanation.
    """
    try:
        result = await service.analyze_pulse(request)
        
        return AIResponse(
            request_id=str(uuid.uuid4()),
            conversation_id=str(uuid.uuid4()),
            feature="TravelPulse",
            message=f"Analyzed {len(result.alerts)} active events.",
            data=result.model_dump(),
            actions=[],
            sources=[],
            warnings=[],
            confidence=ConfidenceLevel.HIGH
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
