import logging
import json
from typing import List, Dict, Any

from app.schemas.alert_iq import AlertIQResult, AlertIQItem
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class AlertIQService:
    """
    Agent AlertIQ engine.
    Analyzes raw system events and prioritizes them based on urgency, financial impact, and customer impact.
    """
    
    SYSTEM_INSTRUCTION = """
    You are AlertIQ for TRAVELVERSE AI. Your job is to analyze raw system events for travel agents.
    
    CRITICAL RULES:
    1. Score each alert from 1-100 based on urgency, financial impact, and customer impact.
    2. Suggest a specific, actionable `recommended_action`.
    3. Return ONLY the prioritized list of alerts, sorted from highest score to lowest.
    4. Do not invent new alerts not present in the raw data.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _mock_fetch_raw_agent_events(self, agent_id: str) -> List[Dict[str, Any]]:
        """
        Mock DB fetch of raw, unprocessed system events for a specific agent.
        """
        return [
            {"id": "ev_1", "type": "price_change", "details": "Flight price for Trip ID 104 increased by $400."},
            {"id": "ev_2", "type": "customer_request", "details": "Customer Jane Doe requested a vegan meal for her flight tomorrow."},
            {"id": "ev_3", "type": "booking_change", "details": "Hotel cancellation received for John Smith's booking next week."},
            {"id": "ev_4", "type": "trip_conflict", "details": "Flight delay causes missed connection for Trip ID 992."}
        ]

    async def analyze_alerts(self, agent_id: str) -> AlertIQResult:
        logger.info(f"Running AlertIQ analysis for agent {agent_id}")
        
        # 1. Fetch Raw Events
        raw_events = self._mock_fetch_raw_agent_events(agent_id)
        
        if not raw_events:
            return AlertIQResult(agent_id=agent_id, total_alerts=0, critical_alerts=0, alerts=[])
        
        # 2. Construct AI Prompt
        prompt = f"""
        Raw System Events:
        {json.dumps(raw_events, indent=2)}
        
        Analyze, prioritize (1-100), and recommend actions for these events.
        """
        
        try:
            # Reusing the AlertIQResult schema for the inner list, but we need to extract the list.
            # We'll let the model router try to fit it into an interim Pydantic model.
            from pydantic import BaseModel
            class AIAlertPrioritization(BaseModel):
                alerts: List[AlertIQItem]
                
            prioritized: AIAlertPrioritization = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=AIAlertPrioritization,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            # Sort by priority score descending
            sorted_alerts = sorted(prioritized.alerts, key=lambda x: x.priority_score, reverse=True)
            critical_count = sum(1 for a in sorted_alerts if a.priority_score >= 80)
            
            return AlertIQResult(
                agent_id=agent_id,
                total_alerts=len(sorted_alerts),
                critical_alerts=critical_count,
                alerts=sorted_alerts
            )
            
        except Exception as e:
            logger.error(f"AlertIQ AI generation failed: {e}")
            raise RuntimeError("Failed to analyze agent alerts.")
