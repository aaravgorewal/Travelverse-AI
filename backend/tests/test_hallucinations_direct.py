import asyncio
from app.ai.grounding_guard import GroundingGuard
from app.ai.model_router import ModelRouter
from app.providers.gemini import GeminiProvider
import sys

async def main():
    router = ModelRouter(provider=GeminiProvider())
    guard = GroundingGuard(router)
    
    trusted_context = "The hotel 'Grand Tokyo' is available for your dates. No pricing information is currently available."
    ai_response = "I found the Grand Tokyo hotel for your dates! The price is $250 per night."
    
    result = await guard.validate(ai_response, trusted_context)
    
    if not result.is_hallucination:
        print("FAILED: Guard failed to detect price hallucination")
        sys.exit(1)
        
    print("SUCCESS: Price hallucination detected.")
    
    trusted_context_weather = "Flight booked for June 12th to London."
    ai_response_weather = "You're booked for London! Expect sunny weather with highs of 75F."
    
    result_weather = await guard.validate(ai_response_weather, trusted_context_weather)
    if not result_weather.is_hallucination:
        print("FAILED: Guard failed to detect weather hallucination")
        sys.exit(1)
        
    print("SUCCESS: Weather hallucination detected.")

if __name__ == "__main__":
    asyncio.run(main())
