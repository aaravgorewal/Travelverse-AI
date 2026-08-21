from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider

class GoogleGeocodingProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_geocoding"

    def __init__(self):
        super().__init__(api_key=settings.GOOGLE_GEOCODING_API_KEY)

    async def geocode(self, address: str) -> Dict[str, Any]:
        """Convert a textual address into geographic coordinates."""
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"address": address}
        return await self._get(url, params, use_cache=True)

    async def reverse_geocode(self, lat: float, lng: float) -> Dict[str, Any]:
        """Convert geographic coordinates into a human-readable address."""
        url = "https://maps.googleapis.com/maps/api/geocode/json"
        params = {"latlng": f"{lat},{lng}"}
        return await self._get(url, params, use_cache=True)
