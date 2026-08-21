import logging
import json
from typing import Dict, Any, List, Optional

from pydantic import BaseModel

from app.schemas.deal_scope import (
    ComparisonRequest,
    ComparisonResult,
    ItemAnalysis,
    ComparisonCandidate
)
from app.ai.model_router import ModelRouter, TaskCategory

logger = logging.getLogger(__name__)

class AIAnalysisResult(BaseModel):
    analysis: List[ItemAnalysis]

class DealScopeService:
    """
    Combines deterministic Python item selection with LLM-based qualitative comparison.
    Never lets the LLM invent prices or declare the 'cheapest' option on its own.
    """
    
    SYSTEM_INSTRUCTION = """
    You are DealScope for TRAVELVERSE AI. Your job is to provide qualitative analysis of the provided candidates.
    You will be provided with the ALREADY CALCULATED winners (Cheapest, Premium, Best Value, Best Match).
    DO NOT invent prices. DO NOT change the winners.
    Your job is only to write the advantages, disadvantages, and tradeoffs for each candidate based on their features and metadata.
    Output EXACTLY the JSON schema requested.
    """

    def __init__(self, router: ModelRouter):
        self.router = router

    def _calculate_best_value(self, candidates: List[ComparisonCandidate], weight: float) -> Optional[str]:
        if not candidates:
            return None
            
        best_candidate = None
        best_score = -float('inf')
        
        for c in candidates:
            # Simple formula: (rating / price). If no rating, fallback to 1.
            r = c.rating if c.rating else 1.0
            p = c.price if c.price > 0 else 0.01 # prevent div by zero
            score = (r * weight) / p
            if score > best_score:
                best_score = score
                best_candidate = c
                
        return best_candidate.id if best_candidate else None

    def _calculate_best_match(self, candidates: List[ComparisonCandidate], preferences: List[str]) -> Optional[str]:
        if not candidates or not preferences:
            return None
            
        best_candidate = None
        best_score = -1
        pref_set = set([p.lower() for p in preferences])
        
        for c in candidates:
            score = 0
            # Rough keyword matching in features/metadata
            feature_text = " ".join(c.features).lower()
            metadata_text = json.dumps(c.metadata).lower()
            
            for p in pref_set:
                if p in feature_text or p in metadata_text:
                    score += 1
                    
            if score > best_score:
                best_score = score
                best_candidate = c
                
        return best_candidate.id if best_candidate else None

    async def compare(self, request: ComparisonRequest) -> ComparisonResult:
        if not request.candidates:
            raise ValueError("No candidates provided for comparison.")

        # 1. Deterministic Selection (Python)
        # Cheapest: lowest price
        cheapest_candidate = min(request.candidates, key=lambda x: x.price)
        cheapest_id = cheapest_candidate.id
        
        # Premium: highest price (or highest rating if preferred, sticking to price for now)
        premium_candidate = max(request.candidates, key=lambda x: x.price)
        premium_id = premium_candidate.id
        
        # Best Value: formula
        best_value_id = self._calculate_best_value(request.candidates, request.quality_weight)
        
        # Best Match: keyword scoring against preferences
        best_match_id = self._calculate_best_match(request.candidates, request.preferences)
        # If no preferences matched, fallback to highest rated
        if not best_match_id:
            top_rated = max(request.candidates, key=lambda x: x.rating or 0.0)
            best_match_id = top_rated.id

        # 2. Construct AI Prompt with Math Already Solved
        prompt = f"""
        User Preferences: {request.preferences}
        
        Python-Calculated Winners:
        - Cheapest: {cheapest_id}
        - Premium: {premium_id}
        - Best Value: {best_value_id}
        - Best Match: {best_match_id}
        
        Candidates:
        {json.dumps([c.model_dump() for c in request.candidates], indent=2)}
        
        Generate the qualitative analysis (advantages, disadvantages, tradeoffs) for each candidate.
        """
        
        # 3. Ask Gemini for Reasoning
        ai_response = None
        try:
            ai_response: AIAnalysisResult = await self.router.generate_structured(
                task_category=TaskCategory.COMPLEX_REASONING,
                prompt=prompt,
                schema=AIAnalysisResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
        except Exception as e:
            logger.error(f"DealScope AI reasoning failed: {e}")
            # Fallback to empty analysis if AI fails
            pass
            
        return ComparisonResult(
            cheapest_id=cheapest_id,
            premium_id=premium_id,
            best_value_id=best_value_id,
            best_match_id=best_match_id,
            analysis=ai_response.analysis if ai_response else []
        )
