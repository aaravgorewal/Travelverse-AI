import logging
import json
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.schemas.orchestration import TravelContext, UniversalAIResponse, UIAction, DataAction
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

# --- Internal Schemas for Structured AI Calls ---
class IntentClassification(BaseModel):
    intent: str = Field(..., description="The classified intent, e.g., 'flight_search', 'general_chat', 'booking', 'cancel'")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")
    required_tools: List[str] = Field(default_factory=list, description="List of internal tool names required to fulfill this intent")

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

    def __init__(self, router: ModelRouter):
        self.router = router

    async def execute(self, user_message: str, context: TravelContext) -> UniversalAIResponse:
        """Main execution pipeline."""
        
        # 1. Validate request
        self._validate_request(user_message, context)
        
        # 2. Classify intent
        intent_info = await self._classify_intent(user_message, context)
        intent = intent_info.intent
        
        # 3. Build context
        db_context = self._build_context(context)
        
        # 4. Determine required tools
        tools = self._determine_required_tools(intent_info)
        
        # 5. Retrieve RAG knowledge if needed
        rag_knowledge = await self._retrieve_rag_knowledge(intent, user_message)
        
        # 6. Execute approved tools
        tool_results = await self._execute_approved_tools(tools, user_message, db_context)
        
        # 7. Construct grounded context
        grounded_prompt = self._construct_grounded_context(
            user_message=user_message,
            db_context=db_context,
            rag_knowledge=rag_knowledge,
            tool_results=tool_results
        )
        
        # 8. Call AI model
        ai_decision = await self._call_ai_model(intent, grounded_prompt)
        
        # 9. Validate response
        self._validate_response(ai_decision)
        
        # 10. Run hallucination guard
        hallucination_check = await self._run_hallucination_guard(ai_decision.response_text, grounded_prompt)
        
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
            hallucination_flag=hallucination_check.is_hallucination,
            intent=intent
        )

    # --- Pipeline Steps Implementation ---

    def _validate_request(self, message: str, context: TravelContext):
        if not message.strip():
            raise ValueError("User message cannot be empty.")
        if not context.user_id or not context.role:
            raise ValueError("TravelContext must include user_id and role.")

    async def _classify_intent(self, message: str, context: TravelContext) -> IntentClassification:
        system_instruction = "You are an intent classifier for a travel AI. Output JSON conforming to the schema."
        prompt = f"User role: {context.role}\nMessage: {message}"
        
        result = await self.router.generate_structured(
            task_category=TaskCategory.CLASSIFICATION,
            prompt=prompt,
            schema=IntentClassification,
            system_instruction=system_instruction
        )
        return result

    def _build_context(self, context: TravelContext) -> Dict[str, Any]:
        # In a real scenario, this fetches from the DB using Repositories based on context.active_trip_id etc.
        return {
            "user_role": context.role,
            "preferences": context.preferences,
            "location": context.location_context,
            "trip_data": "DB Fetch Simulation" if context.active_trip_id else None
        }

    def _determine_required_tools(self, intent_info: IntentClassification) -> List[str]:
        # Maps the AI's requested tools to actual registered backend functions.
        # Hardcoding a whitelist check here ensures security.
        allowed_tools = ["search_flights", "search_hotels", "get_weather"]
        return [tool for tool in intent_info.required_tools if tool in allowed_tools]

    async def _retrieve_rag_knowledge(self, intent: str, message: str) -> str:
        # If intent is general info or planning, query pgvector.
        if intent in ["general_chat", "trip_planning", "info"]:
            # Simulated pgvector search
            return "RAG Knowledge: Traveling to Japan requires a valid passport. Kyoto is famous for temples."
        return ""

    async def _execute_approved_tools(self, tools: List[str], message: str, context: Dict[str, Any]) -> Dict[str, Any]:
        # Execute safe, read-only tools server-side before generation.
        results = {}
        for tool in tools:
            # Dispatch to actual provider adapters (e.g. TBO, Weather API)
            results[tool] = {"status": "simulated_success", "data": "Tool output here"}
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

    async def _call_ai_model(self, intent: str, grounded_prompt: str) -> AIActionDecision:
        # Route to complex reasoning if planning, otherwise simple chat.
        category = TaskCategory.TRIP_PLANNING if intent == "trip_planning" else TaskCategory.SIMPLE_CHAT
        
        system_instruction = """
        You are TRAVELVERSE AI. Answer the user based strictly on the provided Context and Tool Outputs.
        Decide which UI widgets to show, and if any external systems need data payloads sent to them.
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

    async def _run_hallucination_guard(self, ai_response: str, context: str) -> HallucinationCheck:
        system_instruction = "You are a safeguard. Does the AI Response invent prices, hotels, or facts not present in the Context? Return JSON."
        prompt = f"Context:\n{context}\n\nAI Response:\n{ai_response}"
        
        result = await self.router.generate_structured(
            task_category=TaskCategory.CLASSIFICATION, # Fast model
            prompt=prompt,
            schema=HallucinationCheck,
            system_instruction=system_instruction
        )
        return result

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
