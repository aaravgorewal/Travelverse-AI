import logging
import httpx
import os
import json
import hashlib
from datetime import datetime, timedelta
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal Normalized Schemas
# ---------------------------------------------------------------------------

class BaseWeatherResult(BaseModel):
    source: str = "weatherapi"
    live: bool = True
    available: bool = True
    error_reason: Optional[str] = None

class WeatherData(BaseModel):
    temperature: float = 0.0
    conditions: str = ""
    precipitation: float = 0.0
    wind: float = 0.0
    timestamp: str = ""

class WeatherResult(BaseWeatherResult, WeatherData):
    pass

class ForecastResult(BaseWeatherResult):
    forecast_days: List[WeatherData] = []

# ---------------------------------------------------------------------------
# Redis Cache for Weather Data
# ---------------------------------------------------------------------------
from app.core.redis import RedisCacheService

class WeatherCache:
    def __init__(self, ttl_seconds: int = 1800): # 30 mins TTL
        self.ttl = ttl_seconds
        self._redis = RedisCacheService()

    async def get(self, key: str) -> Optional[Any]:
        return await self._redis.get(key)

    async def set(self, key: str, value: Any):
        await self._redis.set(key, value, self.ttl)

_weather_cache = WeatherCache()

# ---------------------------------------------------------------------------
# Provider Implementation
# ---------------------------------------------------------------------------

class ConfiguredWeatherProvider:
    """
    Standard implementation using WeatherAPI.
    Never fabricates current weather. Returns unavailable if network fails.
    """
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.WEATHER_API_KEY
        self.base_url = "https://api.weatherapi.com/v1"
        self.timeout = 10.0

    async def get_current_weather(self, lat: float, lng: float) -> WeatherResult:
        cache_key = f"weather:current_{lat}_{lng}"
        
        cached = await _weather_cache.get(cache_key)
        if cached:
            return WeatherResult(**cached)
            
        if not self.api_key:
            return WeatherResult(live=False, available=False, error_reason="credentials_missing")

        url = f"{self.base_url}/current.json"
        params = {"key": self.api_key, "q": f"{lat},{lng}"}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                
                current = data.get("current", {})
                result = WeatherResult(
                    temperature=current.get("temp_c", 0.0),
                    conditions=current.get("condition", {}).get("text", "Unknown"),
                    precipitation=current.get("precip_mm", 0.0),
                    wind=current.get("wind_kph", 0.0),
                    timestamp=current.get("last_updated", "")
                )
                
                await _weather_cache.set(cache_key, result.model_dump())
                return result
                
        except Exception as e:
            logger.error(f"Weather API failed for current weather: {e}")
            return WeatherResult(live=False, available=False, error_reason="api_unavailable")

    async def get_forecast(self, lat: float, lng: float, days: int = 5) -> ForecastResult:
        cache_key = f"weather:forecast_{lat}_{lng}_{days}"
        
        cached = await _weather_cache.get(cache_key)
        if cached:
            return ForecastResult(**cached)
            
        if not self.api_key:
            return ForecastResult(live=False, available=False, error_reason="credentials_missing")

        url = f"{self.base_url}/forecast.json"
        params = {"key": self.api_key, "q": f"{lat},{lng}", "days": min(days, 14)}

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                resp = await client.get(url, params=params)
                resp.raise_for_status()
                data = resp.json()
                
                forecast_days_data = data.get("forecast", {}).get("forecastday", [])
                parsed_days = []
                
                for day_data in forecast_days_data:
                    day_info = day_data.get("day", {})
                    parsed_days.append(WeatherData(
                        temperature=day_info.get("avgtemp_c", 0.0),
                        conditions=day_info.get("condition", {}).get("text", "Unknown"),
                        precipitation=day_info.get("totalprecip_mm", 0.0),
                        wind=day_info.get("maxwind_kph", 0.0),
                        timestamp=day_data.get("date", "")
                    ))
                
                result = ForecastResult(forecast_days=parsed_days)
                
                await _weather_cache.set(cache_key, result.model_dump())
                return result
                
        except Exception as e:
            logger.error(f"Weather API failed for forecast: {e}")
            return ForecastResult(live=False, available=False, error_reason="api_unavailable")
