import logging
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.schemas.orchestration import TravelContext, UniversalAIResponse, UIAction, DataAction
from app.ai.model_router import ModelRouter, TaskCategory
from app.ai.intent_engine import IntentEngine, IntentResult
from app.ai.grounding_guard import GroundingGuard
from app.tools.registry import ToolRegistry
from app.services.context_builder import ContextBuilder
from app.services.rag.rag_service import RAGService
from sqlalchemy.ext.asyncio import AsyncSession
from app.database.session import AsyncSessionLocal

logger = logging.getLogger(__name__)

class AIActionDecision(BaseModel):
    response_text: str = Field(..., description="The natural language response to the user.")
    ui_widgets: List[str] = Field(default_factory=list, description="Names of UI widgets to render (e.g., 'FlightCard', 'ItineraryView').")
    pending_data_calls: List[Dict[str, Any]] = Field(default_factory=list, description="Data payloads for external execution.")
    is_destructive_or_financial: bool = Field(default=False, description="True if this action costs money or deletes data.")


class TravelAIOrchestrator:
    """
    The central intelligence pipeline for TRAVELVERSE AI.
    All feature requests route through this 13-step process.
    """

    def __init__(self, router: ModelRouter, tool_registry: ToolRegistry):
        self.router = router
        self.intent_engine = IntentEngine(router)
        self.tool_registry = tool_registry
        self.grounding_guard = GroundingGuard(router)
        self.context_builder = ContextBuilder()
        self.rag_service = RAGService()

    async def execute(self, user_message: str, context: TravelContext, feature_override: Optional[str] = None) -> UniversalAIResponse:
        """Main execution pipeline."""
        
        # 1. Validate request
        self._validate_request(user_message, context)
        
        # 2. Classify intent (or force feature if explicitly called)
        if feature_override:
            intent = feature_override.lower().replace(" ", "_")
            intent_result = IntentResult(intent=intent, required_tools=[], confidence=1.0)
        else:
            intent_result = await self.intent_engine.classify(user_message, context.role)
            intent = intent_result.intent
        
        # 3. Build preliminary DB Context
        db_context = self._fetch_db_context(context)
        
        # 4. Determine required tools
        tools = self._determine_required_tools(intent_result)
        
        # 5. Retrieve RAG knowledge
        rag_documents = await self._retrieve_rag_knowledge(intent, user_message, context.role)
        
        # 6. Execute approved tools
        tool_results = await self._execute_approved_tools(tools, user_message, db_context, context.role)
        
        # 7. Construct grounded context using ContextBuilder
        grounded_prompt = self.context_builder.build_context(
            user_request=user_message,
            live_api_results=tool_results,
            current_trip=db_context.get("trip_data"),
            booking_data=db_context.get("booking_data"),
            customer_preferences=context.preferences,
            rag_documents=rag_documents,
            user_profile=None,
            destination_data=context.location_context
        )
        
        # 8. Call AI model
        ai_decision = await self._call_ai_model(intent, grounded_prompt, context.preferred_language)
        
        # 9. Validate response
        self._validate_response(ai_decision)
        
        # 10. Run hallucination guard
        guard_result = await self.grounding_guard.validate(ai_decision.response_text, grounded_prompt)
        
        if guard_result.is_hallucination:
            ai_decision.response_text = guard_result.sanitized_text
        
        # 11. Determine actions
        ui_actions, data_actions = self._determine_actions(ai_decision)
        
        # 12. Require confirmation for sensitive actions
        requires_confirmation = self._require_confirmation(ai_decision, data_actions)
        
        # 13. Return universal response
        return self._return_universal_response(
            text=ai_decision.response_text,
            ui_actions=ui_actions,
            data_actions=data_actions,
            requires_confirmation=requires_confirmation,
            hallucination_flag=guard_result.is_hallucination,
            intent=intent
        )

    def _validate_request(self, message: str, context: TravelContext):
        if not message.strip():
            raise ValueError("User message cannot be empty.")
        if not context.user_id or not context.role:
            raise ValueError("TravelContext must include user_id and role.")

    def _fetch_db_context(self, context: TravelContext) -> Dict[str, Any]:
        return {
            "trip_data": {"active_trip_id": context.active_trip_id} if context.active_trip_id else None,
            "booking_data": None
        }

    def _determine_required_tools(self, intent_result: IntentResult) -> List[str]:
        return intent_result.required_tools

    async def _retrieve_rag_knowledge(self, intent: str, message: str, role: str) -> List[Dict[str, Any]]:
        # In a real app we would pass a DB session. Using AsyncSessionLocal here.
        async with AsyncSessionLocal() as session:
            try:
                results = await self.rag_service.retrieve_context(
                    session=session,
                    query=message,
                    user_role=role,
                    top_k=5
                )
                return results
            except Exception as e:
                logger.error(f"RAG Retrieval failed: {e}")
                return []

    async def _execute_approved_tools(self, tools: List[str], message: str, context: Dict[str, Any], user_role: str) -> Dict[str, Any]:
        results = {}
        for tool_name in tools:
            try:
                result = await self.tool_registry.execute(tool_name, {"message": message, **context}, user_role)
                results[tool_name] = result
            except PermissionError as e:
                results[tool_name] = {"status": "permission_denied", "error": str(e)}
            except ValueError as e:
                results[tool_name] = {"status": "not_found", "error": str(e)}
            except Exception as e:
                results[tool_name] = {"status": "error", "error": str(e)}
        return results

    async def _call_ai_model(self, intent: str, grounded_prompt: str, preferred_language: str) -> AIActionDecision:
        # Route logic for different feature intents
        category = TaskCategory.TRIP_PLANNING if "planning" in intent or intent in ["tripgenie", "smartroute"] else TaskCategory.SIMPLE_CHAT
        
        system_instruction = f"""
        You are TRAVELVERSE AI. Answer the user based strictly on the provided Context and Tool Outputs.
        Decide which UI widgets to show, and if any external systems need data payloads sent to them.
        
        FEATURE FOCUS: You are executing the '{intent}' feature. Adjust your persona and output to match.
        
        MULTILINGUAL RULES:
        1. You MUST respond to the user in {preferred_language}.
        2. CRITICAL: You MUST NOT translate or modify structured identifiers. 
           Booking IDs, flight numbers, hotel names, dates, currencies, and destination names MUST remain exactly as they appear in the Context.
        """
        
        result = await self.router.generate_structured(
            task_category=category,
            prompt=grounded_prompt,
            schema=AIActionDecision,
            system_instruction=system_instruction
        )
        return result

    def _validate_response(self, decision: AIActionDecision):
        if not decision.response_text:
            decision.response_text = "I processed your request, but couldn't generate a text response."

    def _determine_actions(self, decision: AIActionDecision):
        ui_actions = [UIAction(widget_name=w) for w in decision.ui_widgets]
        data_actions = [DataAction(action_type="api_call", payload=p) for p in decision.pending_data_calls]
        return ui_actions, data_actions

    def _require_confirmation(self, decision: AIActionDecision, data_actions: List[DataAction]) -> bool:
        if decision.is_destructive_or_financial:
            return True
        for action in data_actions:
            if action.action_type in ["book_flight", "process_payment", "cancel_trip"]:
                return True
        return False

    def _return_universal_response(self, text: str, ui_actions: List[UIAction], data_actions: List[DataAction], requires_confirmation: bool, hallucination_flag: bool, intent: str) -> UniversalAIResponse:
        if hallucination_flag:
            text = "I'm sorry, I cannot verify the exact details of that request securely. Please double check the live prices."
            
        return UniversalAIResponse(
            text=text,
            ui_actions=ui_actions,
            data_actions=data_actions,
            requires_confirmation=requires_confirmation,
            hallucination_flag=hallucination_flag,
            intent=intent
        )
