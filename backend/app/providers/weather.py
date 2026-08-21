from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
import httpx
import logging

from app.core.config import settings

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Fallback structure
# ---------------------------------------------------------------------------

UNAVAILABLE_WEATHER_RESPONSE = {
    "source": "weather_provider",
    "live": False,
    "available": False,
    "status": "data_unavailable"
}


class WeatherProvider(ABC):
    """
    Abstract interface for Weather APIs.
    Ensures the LLM never fabricates weather by forcing a strict contract.
    """

    @abstractmethod
    async def get_current_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        pass

    @abstractmethod
    async def get_forecast(self, lat: float, lng: float, days: int = 5) -> Dict[str, Any]:
        pass


class ConfiguredWeatherProvider(WeatherProvider):
    """
    Standard implementation using a weather API (e.g., OpenWeatherMap or WeatherAPI).
    Currently implemented against a generic structure, adjustable to the exact endpoint.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.WEATHER_API_KEY
        self.base_url = "https://api.weatherapi.com/v1" # Example default
        self.timeout = 10.0

    async def get_current_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("WEATHER_API_KEY is missing. Returning data_unavailable.")
            return UNAVAILABLE_WEATHER_RESPONSE

        url = f"{self.base_url}/current.json"
        params = {
            "key": self.api_key,
            "q": f"{lat},{lng}"
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                
                # Standardize the payload
                return {
                    "source": "weatherapi",
                    "live": True,
                    "available": True,
                    "location": data.get("location", {}).get("name"),
                    "temp_c": data.get("current", {}).get("temp_c"),
                    "condition": data.get("current", {}).get("condition", {}).get("text"),
                    "raw": data
                }
        except Exception as e:
            logger.error(f"Weather API failed for current weather: {e}")
            return UNAVAILABLE_WEATHER_RESPONSE

    async def get_forecast(self, lat: float, lng: float, days: int = 5) -> Dict[str, Any]:
        if not self.api_key:
            logger.warning("WEATHER_API_KEY is missing. Returning data_unavailable.")
            return UNAVAILABLE_WEATHER_RESPONSE

        url = f"{self.base_url}/forecast.json"
        params = {
            "key": self.api_key,
            "q": f"{lat},{lng}",
            "days": min(days, 14) # Bound the maximum days based on typical API limits
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                
                return {
                    "source": "weatherapi",
                    "live": True,
                    "available": True,
                    "forecast_days": data.get("forecast", {}).get("forecastday", []),
                    "raw": data
                }
        except Exception as e:
            logger.error(f"Weather API failed for forecast: {e}")
            return UNAVAILABLE_WEATHER_RESPONSE
