import logging
import json
from typing import List, Dict, Any

from app.schemas.travel_pulse import TravelPulseRequest, TravelPulseResult, PulseAlert
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class AIExplanationResult(BaseModel):
    alerts: List[PulseAlert]

from pydantic import BaseModel

class TravelPulseService:
    """
    Proactive trip monitoring engine.
    Uses deterministic Python rules to catch events (delays, weather), 
    and Gemini strictly to explain the downstream impact and suggest actions.
    """
    
    SYSTEM_INSTRUCTION = """
    You are TravelPulse for TRAVELVERSE AI. Your job is to explain the impact of detected travel events.
    
    CRITICAL RULES:
    1. You are provided with a list of RAW EVENTS detected by the system.
    2. DO NOT invent new alerts or events. You may only process the provided RAW EVENTS.
    3. For each event, determine the severity (high, medium, low), explain the downstream impact, and suggest a recommended action.
    4. Keep the exact 'event' string and 'source' string provided by the system.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _run_deterministic_rules(self, request: TravelPulseRequest) -> List[Dict[str, str]]:
        """
        Python rule engine to catch factual events.
        """
        raw_events = []
        
        # Rule 1: Flight Delays/Cancellations
        for flight in request.flight_status_payload:
            status = flight.get("status", "ON_TIME")
            if status != "ON_TIME":
                raw_events.append({
                    "event": f"Flight {flight.get('flight_number')} status changed to {status}.",
                    "source": "tbo_flight_status"
                })
                
        # Rule 2: Severe Weather
        for weather in request.weather_payload:
            condition = weather.get("condition", "").lower()
            if any(bad_weather in condition for bad_weather in ["rain", "storm", "snow", "hurricane"]):
                raw_events.append({
                    "event": f"Severe weather ({condition}) reported for {weather.get('location')}.",
                    "source": "weather_provider"
                })
                
        # Rule 3: Pass-through system alerts
        for alert in request.system_alerts:
            raw_events.append({
                "event": alert.get("message", "Unknown system alert"),
                "source": "system"
            })
            
        return raw_events

    async def analyze_pulse(self, request: TravelPulseRequest) -> TravelPulseResult:
        logger.info(f"Running TravelPulse analysis for trip {request.trip_id}")
        
        # 1. Deterministic Rule Engine
        raw_events = self._run_deterministic_rules(request)
        
        if not raw_events:
            return TravelPulseResult(alerts=[])
            
        # 2. Construct Prompt for AI Synthesis
        prompt = f"""
        RAW EVENTS DETECTED:
        {json.dumps(raw_events, indent=2)}
        
        Explain the impact of these events and recommend actions. 
        Output exactly one PulseAlert for each RAW EVENT provided.
        """
        
        # 3. AI Explanation
        try:
            ai_response: AIExplanationResult = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=AIExplanationResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            # Simple validation: make sure the AI didn't drop or invent events
            # (In a production system, we'd do a strict mapping by ID)
            if len(ai_response.alerts) != len(raw_events):
                logger.warning(f"TravelPulse AI returned {len(ai_response.alerts)} alerts, but {len(raw_events)} were provided.")
                
            return TravelPulseResult(alerts=ai_response.alerts)
            
        except Exception as e:
            logger.error(f"TravelPulse AI synthesis failed: {e}")
            raise RuntimeError("Failed to analyze travel pulse.")
