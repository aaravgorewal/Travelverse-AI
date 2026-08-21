import json

with open("backend/app/api/routes/ai_actions.py", "r") as f:
    content = f.read()

# Restore PackageValidatorService
package_validator_import = """from app.schemas.package_validator import PackageValidationRequest
from app.services.package_validator_service import PackageValidatorService
from app.schemas.ai_endpoints import (
    OptimizeItineraryRequest, OptimizeBudgetRequest, CompareRequest,
    ExplainRequest, RecommendRequest, DestinationRequest, PackingListRequest,
    TravelPulseRequest, SupportRequest, PersonalizeRequest, CreatePackageRequest,
    GenerateQuoteRequest, CustomerMessageRequest, AlertIQRequest, AIChatRequest
)"""

if "PackageValidatorService" not in content:
    content = content.replace(
        "from app.schemas.trip_genie import TripPlanningRequest\nfrom app.services.trip_genie_service import TripGenieService",
        f"from app.schemas.trip_genie import TripPlanningRequest\nfrom app.services.trip_genie_service import TripGenieService\n{package_validator_import}"
    )

old_validate = """@router.post("/validate-package", response_model=AIResponse)
async def validate_package(request: Dict[str, Any], orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
    ctx = TravelContext(user_id=str(current_agent.id), role=current_agent.role)
    msg = f"Validate this package for logistics: {json.dumps(request)}"
    return await execute_feature("Package Validator", msg, ctx, orchestrator)"""

new_validate = """@router.post("/validate-package", response_model=AIResponse)
async def validate_package(request: PackageValidationRequest, orchestrator: TravelAIOrchestrator = Depends(get_orchestrator), current_agent: User = Depends(get_current_agent)):
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
    return await execute_feature("Package Validation", msg, ctx, orchestrator)"""

content = content.replace(old_validate, new_validate)

# Replace Dict[str, Any] with precise types
replacements = {
    "async def optimize_itinerary(request: Dict[str, Any]": "async def optimize_itinerary(request: OptimizeItineraryRequest",
    "async def optimize_budget(request: Dict[str, Any]": "async def optimize_budget(request: OptimizeBudgetRequest",
    "async def compare(request: Dict[str, Any]": "async def compare(request: CompareRequest",
    "async def explain(request: Dict[str, Any]": "async def explain(request: ExplainRequest",
    "async def recommend(request: Dict[str, Any]": "async def recommend(request: RecommendRequest",
    "async def get_destination_knowledge(request: Dict[str, Any]": "async def get_destination_knowledge(request: DestinationRequest",
    "async def generate_packing_list(request: Dict[str, Any]": "async def generate_packing_list(request: PackingListRequest",
    "async def analyze_travel_pulse(request: Dict[str, Any]": "async def analyze_travel_pulse(request: TravelPulseRequest",
    "async def get_support(request: Dict[str, Any]": "async def get_support(request: SupportRequest",
    "async def personalize(request: Dict[str, Any]": "async def personalize(request: PersonalizeRequest",
    "async def create_package(request: Dict[str, Any]": "async def create_package(request: CreatePackageRequest",
    "async def generate_quote(request: Dict[str, Any]": "async def generate_quote(request: GenerateQuoteRequest",
    "async def customer_message(request: Dict[str, Any]": "async def customer_message(request: CustomerMessageRequest",
    "async def handle_alert_iq(request: Dict[str, Any]": "async def handle_alert_iq(request: AlertIQRequest",
    "async def chat(request: Dict[str, Any]": "async def chat(request: AIChatRequest",
}

for k, v in replacements.items():
    content = content.replace(k, v)

with open("backend/app/api/routes/ai_actions.py", "w") as f:
    f.write(content)

print("Done")
