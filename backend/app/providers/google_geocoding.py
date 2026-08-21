from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider, GeocodingResult

class GoogleGeocodingProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_geocoding"

    def __init__(self):
        super().__init__(api_key=settings.GOOGLE_GEOCODING_API_KEY)
        self._geocode_cache: Dict[str, GeocodingResult] = {}

    async def geocode(self, address: str) -> GeocodingResult:
        """Geocode an address to lat/lng."""
        cache_key = f"geocode_{address}"
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"address": address}
        
        try:
            resp = await self._get(url, params, use_cache=True)
            results = resp.get("results", [])
            
            if not results:
                return GeocodingResult(live=False, available=False, error_reason="no_results")
                
            first_result = results[0]
            geom = first_result.get("geometry", {}).get("location", {})
            
            result = GeocodingResult(
                lat=geom.get("lat", 0.0),
                lng=geom.get("lng", 0.0),
                formatted_address=first_result.get("formatted_address", ""),
                place_id=first_result.get("place_id", "")
            )
            
            self._geocode_cache[cache_key] = result
            return result
        except Exception as e:
            if cache_key in self._geocode_cache:
                return self._geocode_cache[cache_key]
            return GeocodingResult(live=False, available=False, error_reason="api_unavailable")

    async def reverse_geocode(self, lat: float, lng: float) -> GeocodingResult:
        """Reverse geocode lat/lng to an address."""
        cache_key = f"reverse_{lat}_{lng}"
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"latlng": f"{lat},{lng}"}
        
        try:
            resp = await self._get(url, params, use_cache=True)
            results = resp.get("results", [])
            
            if not results:
                return GeocodingResult(live=False, available=False, error_reason="no_results")
                
            first_result = results[0]
            geom = first_result.get("geometry", {}).get("location", {})
            
            result = GeocodingResult(
                lat=geom.get("lat", lat),
                lng=geom.get("lng", lng),
                formatted_address=first_result.get("formatted_address", ""),
                place_id=first_result.get("place_id", "")
            )
            
            self._geocode_cache[cache_key] = result
            return result
        except Exception as e:
            if cache_key in self._geocode_cache:
                return self._geocode_cache[cache_key]
            return GeocodingResult(live=False, available=False, error_reason="api_unavailable")
