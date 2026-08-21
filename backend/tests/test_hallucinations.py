import pytest
import asyncio
from app.ai.grounding_guard import GroundingGuard
from app.ai.model_router import ModelRouter
from app.providers.gemini import GeminiProvider

@pytest.mark.asyncio
async def test_grounding_guard_price_hallucination():
    router = ModelRouter(provider=GeminiProvider())
    guard = GroundingGuard(router)
    
    trusted_context = "The hotel 'Grand Tokyo' is available for your dates. No pricing information is currently available."
    ai_response = "I found the Grand Tokyo hotel for your dates! The price is $250 per night."
    
    result = await guard.validate(ai_response, trusted_context)
    
    assert result.is_hallucination is True, "Guard failed to detect price hallucination"
    assert "250" not in result.sanitized_text, "Sanitized text leaked the hallucinated price"

@pytest.mark.asyncio
async def test_grounding_guard_weather_hallucination():
    router = ModelRouter(provider=GeminiProvider())
    guard = GroundingGuard(router)
    
    trusted_context = "Flight booked for June 12th to London."
    ai_response = "You're booked for London! Expect sunny weather with highs of 75F."
    
    result = await guard.validate(ai_response, trusted_context)
    
    assert result.is_hallucination is True, "Guard failed to detect weather hallucination"
    assert "75" not in result.sanitized_text or "sunny" not in result.sanitized_text.lower(), "Sanitized text leaked the hallucinated weather"

@pytest.mark.asyncio
async def test_grounding_guard_fully_grounded():
    router = ModelRouter(provider=GeminiProvider())
    guard = GroundingGuard(router)
    
    trusted_context = "Flight booked for June 12th to London. Total price is $450."
    ai_response = "Your flight to London on June 12th is booked. The total price is $450."
    
    result = await guard.validate(ai_response, trusted_context)
    
    assert result.is_hallucination is False, "Guard falsely flagged grounded response"

