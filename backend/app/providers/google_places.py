from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider

class GooglePlacesProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_places"

    def __init__(self):
        super().__init__(api_key=settings.GOOGLE_PLACES_API_KEY)

    async def search_places(self, query: str, location: Optional[str] = None, radius: Optional[int] = None) -> Dict[str, Any]:
        """Search for places using Text Search."""
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params: Dict[str, Any] = {"query": query}
        if location:
            params["location"] = location
        if radius:
            params["radius"] = radius
            
        return await self._get(url, params, use_cache=True)

    async def get_place_details(self, place_id: str) -> Dict[str, Any]:
        """Get details for a specific place."""
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {"place_id": place_id}
        return await self._get(url, params, use_cache=True)
