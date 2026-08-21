import logging
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.schemas.orchestration import TravelContext, UniversalAIResponse, UIAction, DataAction
from app.ai.model_router import ModelRouter, TaskCategory
from app.ai.intent_engine import IntentEngine, IntentResult
from app.ai.grounding_guard import GroundingGuard
from app.tools.registry import ToolRegistry

logger = logging.getLogger(__name__)

class HallucinationCheck(BaseModel):
    is_hallucination: bool = Field(..., description="True if the response contains fabricated facts, prices, or locations not present in the context.")
    reason: str = Field(..., description="Explanation of the verdict.")

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

    async def execute(self, user_message: str, context: TravelContext) -> UniversalAIResponse:
        """Main execution pipeline."""
        
        # 1. Validate request
        self._validate_request(user_message, context)
        
        # 2. Classify intent (delegated to IntentEngine)
        intent_result = await self.intent_engine.classify(user_message, context.role)
        intent = intent_result.intent
        
        # 3. Build context
        db_context = self._build_context(context)
        
        # 4. Determine required tools (from IntentEngine metadata)
        tools = self._determine_required_tools(intent_result)
        
        # 5. Retrieve RAG knowledge if needed
        rag_knowledge = await self._retrieve_rag_knowledge(intent, user_message)
        
        # 6. Execute approved tools (permission-gated via ToolRegistry)
        tool_results = await self._execute_approved_tools(tools, user_message, db_context, context.role)
        
        # 7. Construct grounded context
        grounded_prompt = self._construct_grounded_context(
            user_message=user_message,
            db_context=db_context,
            rag_knowledge=rag_knowledge,
            tool_results=tool_results
        )
        
        # 8. Call AI model
        ai_decision = await self._call_ai_model(intent, grounded_prompt, context.preferred_language)
        
        # 9. Validate response
        self._validate_response(ai_decision)
        
        # 10. Run hallucination guard
        guard_result = await self.grounding_guard.validate(ai_decision.response_text, grounded_prompt)
        
        # If hallucination was detected, swap the text for the sanitized version
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

    # --- Pipeline Steps Implementation ---

    def _validate_request(self, message: str, context: TravelContext):
        if not message.strip():
            raise ValueError("User message cannot be empty.")
        if not context.user_id or not context.role:
            raise ValueError("TravelContext must include user_id and role.")

    def _build_context(self, context: TravelContext) -> Dict[str, Any]:
        # In a real scenario, this fetches from the DB using Repositories based on context.active_trip_id etc.
        return {
            "user_role": context.role,
            "preferences": context.preferences,
            "location": context.location_context,
            "trip_data": "DB Fetch Simulation" if context.active_trip_id else None
        }

    def _determine_required_tools(self, intent_result: IntentResult) -> List[str]:
        # Tools are now resolved from the static IntentEngine metadata, not AI hallucination.
        return intent_result.required_tools

    async def _retrieve_rag_knowledge(self, intent: str, message: str) -> str:
        # If intent is general info or planning, query pgvector.
        if intent in ["general_chat", "trip_planning", "info"]:
            # Simulated pgvector search
            return "RAG Knowledge: Traveling to Japan requires a valid passport. Kyoto is famous for temples."
        return ""

    async def _execute_approved_tools(self, tools: List[str], message: str, context: Dict[str, Any], user_role: str) -> Dict[str, Any]:
        """Execute tools through the ToolRegistry, which validates permissions before dispatch."""
        results = {}
        for tool_name in tools:
            try:
                result = await self.tool_registry.execute(tool_name, {"message": message, **context}, user_role)
                results[tool_name] = result
            except PermissionError as e:
                logger.warning(f"Permission denied for tool '{tool_name}': {e}")
                results[tool_name] = {"status": "permission_denied", "error": str(e)}
            except ValueError as e:
                logger.warning(f"Tool '{tool_name}' not found: {e}")
                results[tool_name] = {"status": "not_found", "error": str(e)}
            except Exception as e:
                logger.error(f"Tool '{tool_name}' execution failed: {e}")
                results[tool_name] = {"status": "error", "error": str(e)}
        return results

    def _construct_grounded_context(self, user_message: str, db_context: Dict[str, Any], rag_knowledge: str, tool_results: Dict[str, Any]) -> str:
        return f"""
        User Message: {user_message}
        ---
        Database Context: {json.dumps(db_context)}
        ---
        RAG Knowledge: {rag_knowledge}
        ---
        Tool Outputs: {json.dumps(tool_results)}
        """

    async def _call_ai_model(self, intent: str, grounded_prompt: str, preferred_language: str) -> AIActionDecision:
        # Route to complex reasoning if planning, otherwise simple chat.
        category = TaskCategory.TRIP_PLANNING if intent == "trip_planning" else TaskCategory.SIMPLE_CHAT
        
        system_instruction = f"""
        You are TRAVELVERSE AI. Answer the user based strictly on the provided Context and Tool Outputs.
        Decide which UI widgets to show, and if any external systems need data payloads sent to them.
        
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
            logger.warning("AI generated an empty text response. Providing fallback.")
            decision.response_text = "I processed your request, but couldn't generate a text response."

    def _determine_actions(self, decision: AIActionDecision):
        ui_actions = [UIAction(widget_name=w) for w in decision.ui_widgets]
        data_actions = [DataAction(action_type="api_call", payload=p) for p in decision.pending_data_calls]
        return ui_actions, data_actions

    def _require_confirmation(self, decision: AIActionDecision, data_actions: List[DataAction]) -> bool:
        # If the AI flagged it as financial/destructive, OR if specific dangerous payloads exist.
        if decision.is_destructive_or_financial:
            return True
        for action in data_actions:
            if action.action_type in ["book_flight", "process_payment", "cancel_trip"]:
                return True
        return False

    def _return_universal_response(self, text: str, ui_actions: List[UIAction], data_actions: List[DataAction], requires_confirmation: bool, hallucination_flag: bool, intent: str) -> UniversalAIResponse:
        
        if hallucination_flag:
            # Overwrite text if dangerous hallucination detected
            text = "I'm sorry, I cannot verify the exact details of that request securely. Please double check the live prices."
            
        return UniversalAIResponse(
            text=text,
            ui_actions=ui_actions,
            data_actions=data_actions,
            requires_confirmation=requires_confirmation,
            hallucination_flag=hallucination_flag,
            intent=intent
        )
