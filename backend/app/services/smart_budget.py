import logging
import json
from typing import Dict, Any, List

from app.schemas.smart_budget import (
    BudgetOptimizationRequest,
    BudgetOptimizationResult,
    AISuggestedCut
)
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

from pydantic import BaseModel

# Subset of BudgetOptimizationResult for the AI to return, to avoid it trying to return the math fields
class AIBudgetReasoning(BaseModel):
    ai_suggestions: List[str]
    suggested_cuts: List[AISuggestedCut]

class SmartBudgetService:
    """
    Combines deterministic Python calculations with LLM-based financial reasoning.
    Never lets the LLM perform sums, differences, or percentages.
    """
    
    SYSTEM_INSTRUCTION = """
    You are SmartBudget for TRAVELVERSE AI. Your job is to provide qualitative financial advice and suggest cuts.
    You will be provided with the ALREADY CALCULATED totals, variance, and category percentages.
    DO NOT perform any math. Your job is only to reason about the tradeoffs based on the numbers provided.
    Provide actionable suggestions and identify non-essential items that could be cut or swapped if the user is over budget.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    async def optimize(self, request: BudgetOptimizationRequest) -> BudgetOptimizationResult:
        # 1. Deterministic Math (Python)
        calculated_total = 0.0
        category_totals: Dict[str, float] = {}
        
        for item in request.items:
            # MVP assumes all items match the request currency
            calculated_total += item.cost
            category_totals[item.category] = category_totals.get(item.category, 0.0) + item.cost
            
        variance = request.total_budget - calculated_total
        
        if variance < 0:
            status = "OVER_BUDGET"
        elif variance > 0:
            status = "UNDER_BUDGET"
        else:
            status = "ON_BUDGET"
            
        category_percentages = {}
        if calculated_total > 0:
            for cat, total in category_totals.items():
                category_percentages[cat] = round((total / calculated_total) * 100, 2)

        # 2. Construct AI Prompt with Math Already Solved
        prompt = f"""
        User's Total Budget: {request.total_budget} {request.currency}
        Calculated Total Cost: {calculated_total} {request.currency}
        Variance: {variance} {request.currency} ({status})
        
        Category Breakdown (%):
        {json.dumps(category_percentages, indent=2)}
        
        Goals: {request.optimization_goals}
        
        Items List:
        {json.dumps([i.model_dump() for i in request.items], indent=2)}
        
        Based on these figures, provide your qualitative recommendations and suggest any cuts.
        """
        
        # 3. Ask Gemini for Reasoning
        ai_reasoning = None
        try:
            ai_reasoning = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=AIBudgetReasoning,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
        except Exception as e:
            logger.error(f"SmartBudget AI reasoning failed: {e}")
            # Degrade gracefully, returning just the math if AI fails
            pass
            
        return BudgetOptimizationResult(
            calculated_total=calculated_total,
            variance=variance,
            status=status,
            category_percentages=category_percentages,
            ai_suggestions=ai_reasoning.ai_suggestions if ai_reasoning else ["AI reasoning temporarily unavailable."],
            suggested_cuts=ai_reasoning.suggested_cuts if ai_reasoning else []
        )
