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
    1. You are provided with a list of RAW EVENTS deterministically detected by the backend system.
    2. NEVER generate an alert or explanation without supporting data from the RAW EVENTS list.
    3. DO NOT invent new events (e.g. do not guess a flight is delayed if it isn't in the raw list).
    4. For each event, determine the severity (high, medium, low), explain the downstream impact, and suggest a recommended action.
    5. Keep the exact 'event' string and 'source' string provided by the system.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _run_deterministic_rules(self, request: TravelPulseRequest) -> List[Dict[str, str]]:
        """
        Python rule engine to catch factual events from the trip and bookings.
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
                
        # Advanced Rules using bookings and trip
        bookings = request.bookings
        flights = sorted([b for b in bookings if b.get("type") == "flight"], key=lambda x: x.get("departure_time", ""))
        hotels = sorted([b for b in bookings if b.get("type") == "hotel"], key=lambda x: x.get("check_in", ""))
        transfers = [b for b in bookings if b.get("type") == "transfer"]
        
        # Rule 3: Tight connection (gap < 90 mins)
        for i in range(len(flights) - 1):
            # Very simplistic MVP date parsing check, assuming ISO strings
            f1_arr = flights[i].get("arrival_time")
            f2_dep = flights[i+1].get("departure_time")
            if f1_arr and f2_dep and f1_arr[:10] == f2_dep[:10]:
                # In production, parse real datetimes and diff them. For MVP:
                raw_events.append({
                    "event": f"Tight connection detected between flights {flights[i].get('id')} and {flights[i+1].get('id')}.",
                    "source": "trip_logic"
                })
                
        # Rule 4: Missing transfer
        for flight in flights:
            arr_date = flight.get("arrival_time", "")[:10]
            for hotel in hotels:
                if hotel.get("check_in", "")[:10] == arr_date:
                    # Check if there is a transfer on this date
                    has_transfer = any(t.get("date", "")[:10] == arr_date for t in transfers)
                    if not has_transfer:
                        raw_events.append({
                            "event": f"Missing transfer from airport to hotel on {arr_date}.",
                            "source": "trip_logic"
                        })
                        
        # Rule 5: Schedule conflict
        activities = [b for b in bookings if b.get("type") == "activity"]
        for act in activities:
            act_date = act.get("date", "")[:10]
            for flight in flights:
                if flight.get("departure_time", "")[:10] == act_date:
                    raw_events.append({
                        "event": f"Potential schedule conflict between activity {act.get('id')} and flight {flight.get('id')}.",
                        "source": "trip_logic"
                    })
                    
        # Rule 6: Unusual itinerary gap (No hotel or activity for a date within trip range)
        # Simplified for MVP
        if request.trip.get("start_date") and request.trip.get("end_date"):
            # Mocking a check
            if not hotels and not activities:
                 raw_events.append({
                    "event": f"Unusual itinerary gap detected: Missing accommodations or activities.",
                    "source": "trip_logic"
                })
                 
        # Rule 7: Customer follow-up
        if request.trip.get("end_date"):
            # MVP mock string check
            raw_events.append({
                "event": f"Trip {request.trip_id} ends on {request.trip.get('end_date')}. Schedule follow-up.",
                "source": "trip_logic"
            })

        # Rule 8: Pass-through system alerts
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
