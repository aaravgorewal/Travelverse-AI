import httpx
import logging
from typing import Dict, Any, List
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings

logger = logging.getLogger(__name__)

class WeatherProvider:
    # Defaulting to OpenWeatherMap standard endpoints
    BASE_URL = "https://api.openweathermap.org/data/2.5"
    
    def __init__(self):
        self.api_key = settings.WEATHER_API_KEY
        
    def _get_client(self):
        # Strict timeout to prevent hanging the orchestrator
        return httpx.AsyncClient(timeout=5.0)
        
    def _get_unavailable_response(self) -> Dict[str, Any]:
        """Strict fallback payload to definitively tell Gemini that weather is unavailable."""
        return {
            "available": False,
            "source": None
        }

    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=5),
        stop=stop_after_attempt(2),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException))
    )
    async def get_current_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        """Fetch current weather. Returns the strict unavailable payload on failure."""
        if not self.api_key:
            logger.warning("WEATHER_API_KEY is missing. Returning unavailable fallback.")
            return self._get_unavailable_response()
            
        params = {
            "lat": lat,
            "lon": lng,
            "appid": self.api_key,
            "units": "metric"
        }
        
        async with self._get_client() as client:
            try:
                response = await client.get(f"{self.BASE_URL}/weather", params=params)
                response.raise_for_status()
                data = response.json()
                
                return {
                    "available": True,
                    "source": "OpenWeatherMap",
                    "temperature": data.get("main", {}).get("temp"),
                    "condition": data.get("weather", [{}])[0].get("main"),
                    "description": data.get("weather", [{}])[0].get("description")
                }
            except (httpx.HTTPError, httpx.TimeoutException) as e:
                logger.error(f"Weather API failed for get_current_weather: {e}")
                return self._get_unavailable_response()

    @retry(
        wait=wait_exponential(multiplier=1, min=1, max=5),
        stop=stop_after_attempt(2),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException))
    )
    async def get_forecast(self, lat: float, lng: float, days: int = 5) -> Dict[str, Any]:
        """Fetch weather forecast. Returns the strict unavailable payload on failure."""
        if not self.api_key:
            logger.warning("WEATHER_API_KEY is missing. Returning unavailable fallback.")
            return self._get_unavailable_response()
            
        params = {
            "lat": lat,
            "lon": lng,
            "appid": self.api_key,
            "units": "metric",
            "cnt": days * 8 # OpenWeatherMap 3-hour step logic
        }
        
        async with self._get_client() as client:
            try:
                response = await client.get(f"{self.BASE_URL}/forecast", params=params)
                response.raise_for_status()
                data = response.json()
                
                forecast_list = []
                for item in data.get("list", []):
                    forecast_list.append({
                        "datetime": item.get("dt_txt"),
                        "temperature": item.get("main", {}).get("temp"),
                        "condition": item.get("weather", [{}])[0].get("main")
                    })
                
                return {
                    "available": True,
                    "source": "OpenWeatherMap",
                    "forecast": forecast_list
                }
            except (httpx.HTTPError, httpx.TimeoutException) as e:
                logger.error(f"Weather API failed for get_forecast: {e}")
                return self._get_unavailable_response()
