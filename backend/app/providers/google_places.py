from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider

class GooglePlacesProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_places"

    def __init__(self):
        super().__init__(api_key=settings.GOOGLE_PLACES_API_KEY)
        # Fallback 1: Local cache to serve data if API is down
        self._places_cache: Dict[str, Any] = {}

    async def search_places(self, query: str, location: Optional[str] = None, radius: Optional[int] = None) -> Dict[str, Any]:
        """Search for places using Text Search."""
        cache_key = f"search_{query}_{location}_{radius}"
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params: Dict[str, Any] = {"query": query}
        if location:
            params["location"] = location
        if radius:
            params["radius"] = radius
            
        try:
            result = await self._get(url, params, use_cache=True)
            self._places_cache[cache_key] = result
            return result
        except Exception as e:
            if cache_key in self._places_cache:
                return self._places_cache[cache_key]
            # Fallback 2: Unavailable
            return {
                "results": [],
                "status": "UNAVAILABLE",
                "error_message": "Place information is currently unavailable."
            }

    async def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """Get details for a specific place."""
        cache_key = f"details_{place_id}"
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {"place_id": place_id}
        
        try:
            result = await self._get(url, params, use_cache=True)
            self._places_cache[cache_key] = result
            return result
        except Exception as e:
            if cache_key in self._places_cache:
                return self._places_cache[cache_key]
            return {
                "result": {},
                "status": "UNAVAILABLE",
                "error_message": "Place details are currently unavailable."
            }
