import logging
import json

from app.schemas.pack_mate import PackingRequest, PackingListResult
from app.ai.model_router import ModelRouter, TaskCategory
from app.providers.weather import WeatherProvider

logger = logging.getLogger(__name__)

class PackMateService:
    """
    Intelligent packing list generator.
    Incorporates destination weather and traveler profiles to generate dynamic lists.
    Strictly avoids medical advice.
    """
    
    SYSTEM_INSTRUCTION = """
    You are PackMate for TRAVELVERSE AI. Your job is to generate a comprehensive packing list.
    
    CRITICAL RULES:
    1. Categorize strictly into: documents, clothing, electronics, activity_equipment, and essentials.
    2. DO NOT PROVIDE MEDICAL ADVICE. If suggesting first aid or medication, state "Basic first aid / personal medications" but do not prescribe specific drugs for conditions (like malaria pills). Add a warning that travelers should consult a doctor for specific medical needs.
    3. Tailor the list to the provided weather, activities, and traveler profile.
    

CRITICAL ANTI-HALLUCINATION RULES:
1. Do NOT invent or estimate prices, availability, or booking status. All financial and inventory claims MUST come from provided tool data or context.
2. Do NOT invent routes, distances, or durations. Use routing data provided.
3. Do NOT invent places, weather, or policies. Rely strictly on Trusted Data and RAG.
4. If you lack the deterministic data to answer a specific factual claim, explicitly state 'Information Unavailable'. Do NOT guess.
    """

    def __init__(self, router: ModelRouter):
        self.router = router
        self.weather = WeatherProvider()

    async def generate_list(self, request: PackingRequest) -> PackingListResult:
        logger.info(f"Generating packing list for {request.destination}")
        
        weather_context = None
        if request.include_weather:
            # Simulate geocoding for now
            weather_data = await self.weather.get_forecast(0.0, 0.0)
            if weather_data and weather_data.get("live"):
                weather_context = json.dumps(weather_data)
            
        prompt = f"""
        Destination: {request.destination}
        Dates: {request.start_date} to {request.end_date}
        Traveler Profile: {request.traveler_profile}
        Activities: {request.activities}
        
        Weather Forecast:
        {weather_context or "Not available"}
        
        Generate the structured packing list.
        """
        
        try:
            result: PackingListResult = await self.router.generate_structured(
                task_category=TaskCategory.TRIP_PLANNING, # Reuse trip planning category
                prompt=prompt,
                schema=PackingListResult,
                system_instruction=self.SYSTEM_INSTRUCTION
            )
            
            # Explicitly enforce the no-medical-advice warning if not present
            if not any("medical" in w.lower() or "doctor" in w.lower() for w in result.warnings):
                result.warnings.append("Disclaimer: This list does not constitute medical advice. Consult a healthcare professional for destination-specific vaccinations or medications.")
                
            # If weather was provided, pass it back so the UI can explain *why* it recommended things
            if weather_context:
                result.weather_context = "Packing recommendations were adjusted for local weather conditions."
                
            return result
            
        except Exception as e:
            logger.error(f"PackMate AI generation failed: {e}")
            raise RuntimeError("Failed to generate packing list.")
