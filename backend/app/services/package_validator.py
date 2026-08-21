import logging
import json
from datetime import datetime

from pydantic import BaseModel
from typing import List

from app.schemas.package_validator import PackageValidationRequest, ValidationResult, ValidationComponent
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class AILogisticalWarnings(BaseModel):
    warnings: List[str]

class PackageValidatorService:
    """
    Two-phase validation engine.
    Phase 1 (Python): Hard deterministic checks (budget, counts, date formats).
    Phase 2 (Gemini): Soft logistical reasoning (missing transfers, impossible geography).
    """
    
    SYSTEM_INSTRUCTION = """
    You are the Package Validator for TRAVELVERSE AI. Your job is to find logistical flaws in the proposed itinerary.
    
    CRITICAL RULES:
    1. Do not check math or budget. Python has already done that.
    2. Look for impossible routes (e.g. Activity 1 ends far away from where Activity 2 begins within minutes).
    3. Look for missing transfers (e.g. Flight lands but no transfer to hotel is booked).
    4. Look for overlapping activities.
    5. Return a list of specific, actionable warnings.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _run_deterministic_checks(self, request: PackageValidationRequest) -> List[str]:
        errors = []
        
        # 1. Budget Check
        total_cost = sum(c.cost for c in request.components)
        if total_cost > request.budget_limit:
            errors.append(f"Budget Violation: Total cost ({total_cost}) exceeds limit ({request.budget_limit}).")
            
        # 2. Traveler Count Check
        for c in request.components:
            if c.guests != request.traveler_count:
                errors.append(f"Inconsistent Travelers: {c.name} is booked for {c.guests} guests, but package requires {request.traveler_count}.")
                
        # 3. Duplicate Products
        seen_ids = set()
        for c in request.components:
            if c.id in seen_ids:
                errors.append(f"Duplicate Product: Component ID {c.id} ({c.name}) is booked multiple times.")
            seen_ids.add(c.id)
            
        # 4. Basic Date Formatting (Ensure ISO8601 can be parsed)
        for c in request.components:
            try:
                datetime.fromisoformat(c.start_time.replace('Z', '+00:00'))
                datetime.fromisoformat(c.end_time.replace('Z', '+00:00'))
            except ValueError:
                errors.append(f"Invalid Date Format: {c.name} has invalid start/end times.")
                
        return errors

    async def validate_package(self, request: PackageValidationRequest) -> ValidationResult:
        logger.info("Running deterministic validation on package...")
        
        # Phase 1: Python checks
        errors = self._run_deterministic_checks(request)
        
        # If hard errors exist, short-circuit and fail immediately. No need to burn LLM tokens.
        if errors:
            return ValidationResult(is_valid=False, errors=errors, warnings=[])
            
        # Phase 2: AI checks
        prompt = f"""
        Please review this mathematically-valid itinerary for logistical flaws:
        
        {json.dumps([c.model_dump() for c in request.components], indent=2)}
        """
        
        try:
            ai_result: AILogisticalWarnings = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=AILogisticalWarnings,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            is_valid = len(ai_result.warnings) == 0
            return ValidationResult(
                is_valid=is_valid,
                errors=[],
                warnings=ai_result.warnings
            )
            
        except Exception as e:
            logger.error(f"Validator AI generation failed: {e}")
            raise RuntimeError("Failed to run AI validation on package.")
