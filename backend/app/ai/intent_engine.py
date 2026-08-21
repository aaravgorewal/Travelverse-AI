import logging
from typing import List, Optional
from pydantic import BaseModel, Field
from enum import Enum

from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)


class Intent(str, Enum):
    # Traveler Intents
    GENERAL_CHAT = "GENERAL_CHAT"
    TRIP_PLANNING = "TRIP_PLANNING"
    FLIGHT_SEARCH = "FLIGHT_SEARCH"
    HOTEL_SEARCH = "HOTEL_SEARCH"
    EXPERIENCE_SEARCH = "EXPERIENCE_SEARCH"
    DESTINATION_INFO = "DESTINATION_INFO"
    RECOMMENDATION = "RECOMMENDATION"
    COMPARISON = "COMPARISON"
    ITINERARY_OPTIMIZATION = "ITINERARY_OPTIMIZATION"
    BUDGET_OPTIMIZATION = "BUDGET_OPTIMIZATION"
    PACKING = "PACKING"
    TRAVEL_SUPPORT = "TRAVEL_SUPPORT"
    BOOKING = "BOOKING"
    BOOKING_CHANGE = "BOOKING_CHANGE"
    BOOKING_CANCELLATION = "BOOKING_CANCELLATION"

    # Agent Intents
    AGENT_COPILOT = "AGENT_COPILOT"
    CUSTOMER_PROFILE = "CUSTOMER_PROFILE"
    PACKAGE_CREATION = "PACKAGE_CREATION"
    PACKAGE_VALIDATION = "PACKAGE_VALIDATION"
    QUOTE_GENERATION = "QUOTE_GENERATION"
    CUSTOMER_MESSAGE = "CUSTOMER_MESSAGE"


class IntentResult(BaseModel):
    intent: str = Field(..., description="The classified intent from the Intent enum.")
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0.")
    required_context: List[str] = Field(default_factory=list, description="Context keys needed (e.g., 'active_trip', 'customer_id').")
    required_tools: List[str] = Field(default_factory=list, description="Backend tools needed (e.g., 'search_flights', 'get_weather').")


# Static mapping of intent -> default context and tools.
# This prevents the AI from hallucinating tool names.
INTENT_METADATA = {
    Intent.GENERAL_CHAT: {
        "context": [],
        "tools": [],
    },
    Intent.TRIP_PLANNING: {
        "context": ["active_trip", "preferences", "budget"],
        "tools": ["search_destinations", "get_weather"],
    },
    Intent.FLIGHT_SEARCH: {
        "context": ["origin", "destination", "dates", "passengers"],
        "tools": ["search_flights"],
    },
    Intent.HOTEL_SEARCH: {
        "context": ["destination", "dates", "guests", "preferences"],
        "tools": ["search_hotels"],
    },
    Intent.EXPERIENCE_SEARCH: {
        "context": ["destination", "dates", "preferences"],
        "tools": ["search_experiences"],
    },
    Intent.DESTINATION_INFO: {
        "context": ["destination"],
        "tools": ["rag_knowledge"],
    },
    Intent.RECOMMENDATION: {
        "context": ["preferences", "budget", "travel_history"],
        "tools": ["rag_knowledge", "search_destinations"],
    },
    Intent.COMPARISON: {
        "context": ["comparison_items"],
        "tools": ["search_flights", "search_hotels"],
    },
    Intent.ITINERARY_OPTIMIZATION: {
        "context": ["active_trip"],
        "tools": ["route_optimizer"],
    },
    Intent.BUDGET_OPTIMIZATION: {
        "context": ["active_trip", "budget"],
        "tools": ["search_flights", "search_hotels"],
    },
    Intent.PACKING: {
        "context": ["destination", "dates"],
        "tools": ["get_weather"],
    },
    Intent.TRAVEL_SUPPORT: {
        "context": ["active_trip", "booking_id"],
        "tools": ["rag_knowledge"],
    },
    Intent.BOOKING: {
        "context": ["booking_items", "customer_id"],
        "tools": ["create_booking"],
    },
    Intent.BOOKING_CHANGE: {
        "context": ["booking_id"],
        "tools": ["modify_booking"],
    },
    Intent.BOOKING_CANCELLATION: {
        "context": ["booking_id"],
        "tools": ["cancel_booking"],
    },
    Intent.AGENT_COPILOT: {
        "context": ["agent_id", "customer_id"],
        "tools": ["rag_knowledge", "search_flights", "search_hotels"],
    },
    Intent.CUSTOMER_PROFILE: {
        "context": ["customer_id"],
        "tools": ["get_customer_profile"],
    },
    Intent.PACKAGE_CREATION: {
        "context": ["customer_id", "preferences", "budget"],
        "tools": ["search_flights", "search_hotels", "search_experiences"],
    },
    Intent.PACKAGE_VALIDATION: {
        "context": ["package_id"],
        "tools": ["validate_package"],
    },
    Intent.QUOTE_GENERATION: {
        "context": ["package_id", "customer_id"],
        "tools": ["generate_quote"],
    },
    Intent.CUSTOMER_MESSAGE: {
        "context": ["customer_id", "message_type"],
        "tools": [],
    },
}


# Schema the AI must conform to when classifying
class RawIntentClassification(BaseModel):
    intent: str = Field(..., description="One of: " + ", ".join([i.value for i in Intent]))
    confidence: float = Field(..., description="Confidence score between 0.0 and 1.0")


INTENT_LIST = "\n".join([f"- {i.value}" for i in Intent])

SYSTEM_INSTRUCTION = f"""You are the intent classification engine for TRAVELVERSE AI.

Given a user message and their role, classify the message into exactly one of these intents:

{INTENT_LIST}

Rules:
- Agent-specific intents (AGENT_COPILOT, CUSTOMER_PROFILE, PACKAGE_CREATION, PACKAGE_VALIDATION, QUOTE_GENERATION, CUSTOMER_MESSAGE) should only be used when the user role is 'agent'.
- If unsure, default to GENERAL_CHAT with low confidence.
- Return your answer as JSON with 'intent' and 'confidence' fields.
"""


class IntentEngine:
    """
    Classifies user messages into canonical intents and resolves
    the required context and tools from a static, secure metadata map.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def classify(self, message: str, user_role: str = "traveler") -> IntentResult:
        prompt = f"User role: {user_role}\nUser message: {message}"

        try:
            raw = await self.router.generate_structured(
                task_category=TaskCategory.CLASSIFICATION,
                prompt=prompt,
                schema=RawIntentClassification,
                system_instruction=SYSTEM_INSTRUCTION,
            )

            # Validate that the AI returned a known intent
            try:
                matched_intent = Intent(raw.intent)
            except ValueError:
                logger.warning(f"AI returned unknown intent '{raw.intent}'. Falling back to GENERAL_CHAT.")
                matched_intent = Intent.GENERAL_CHAT
                raw.confidence = 0.3

            metadata = INTENT_METADATA.get(matched_intent, {"context": [], "tools": []})

            return IntentResult(
                intent=matched_intent.value,
                confidence=raw.confidence,
                required_context=metadata["context"],
                required_tools=metadata["tools"],
            )

        except Exception as e:
            logger.error(f"Intent classification failed: {e}. Defaulting to GENERAL_CHAT.")
            return IntentResult(
                intent=Intent.GENERAL_CHAT.value,
                confidence=0.0,
                required_context=[],
                required_tools=[],
            )
