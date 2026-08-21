from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider

class GoogleMapsProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_maps"

    def __init__(self):
        # Maps API often shares the Maps/Places key
        super().__init__(api_key=settings.GOOGLE_MAPS_API_KEY)

    async def get_elevation(self, lat: float, lng: float) -> Dict[str, Any]:
        """Get elevation for a location."""
        url = "https://maps.googleapis.com/maps/api/elevation/json"
        params = {"locations": f"{lat},{lng}"}
        return await self._get(url, params, use_cache=True)
        
    async def get_distance_matrix(self, origins: List[str], destinations: List[str]) -> Dict[str, Any]:
        """Get travel distance and time for a matrix of origins and destinations."""
        url = "https://maps.googleapis.com/maps/api/distancematrix/json"
        params = {
            "origins": "|".join(origins),
            "destinations": "|".join(destinations)
        }
        return await self._get(url, params, use_cache=True)
