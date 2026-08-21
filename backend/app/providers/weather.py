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
        # Fallback 1: Local cache to serve data if API is down
        self._weather_cache: Dict[str, Any] = {}

    async def get_current_weather(self, lat: float, lng: float) -> Dict[str, Any]:
        cache_key = f"current_{lat}_{lng}"
        
        if not self.api_key:
            logger.warning("WEATHER_API_KEY is missing. Checking cache.")
            return self._weather_cache.get(cache_key, UNAVAILABLE_WEATHER_RESPONSE)

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
                result = {
                    "source": "weatherapi",
                    "live": True,
                    "available": True,
                    "location": data.get("location", {}).get("name"),
                    "temp_c": data.get("current", {}).get("temp_c"),
                    "condition": data.get("current", {}).get("condition", {}).get("text"),
                    "raw": data
                }
                self._weather_cache[cache_key] = result
                return result
        except Exception as e:
            logger.error(f"Weather API failed for current weather: {e}")
            if cache_key in self._weather_cache:
                logger.info("Serving current weather from fallback cache.")
                return self._weather_cache[cache_key]
            # Fallback 2: Unavailable
            return UNAVAILABLE_WEATHER_RESPONSE

    async def get_forecast(self, lat: float, lng: float, days: int = 5) -> Dict[str, Any]:
        cache_key = f"forecast_{lat}_{lng}_{days}"
        
        if not self.api_key:
            logger.warning("WEATHER_API_KEY is missing. Checking cache.")
            return self._weather_cache.get(cache_key, UNAVAILABLE_WEATHER_RESPONSE)

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
                
                result = {
                    "source": "weatherapi",
                    "live": True,
                    "available": True,
                    "forecast_days": data.get("forecast", {}).get("forecastday", []),
                    "raw": data
                }
                self._weather_cache[cache_key] = result
                return result
        except Exception as e:
            logger.error(f"Weather API failed for forecast: {e}")
            if cache_key in self._weather_cache:
                logger.info("Serving forecast from fallback cache.")
                return self._weather_cache[cache_key]
            # Fallback 2: Unavailable
            return UNAVAILABLE_WEATHER_RESPONSE
