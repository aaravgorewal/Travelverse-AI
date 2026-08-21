from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider, PlaceResult

class GooglePlacesProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_places"

    def __init__(self):
        super().__init__(api_key=settings.GOOGLE_PLACES_API_KEY)
        self._places_cache: Dict[str, List[PlaceResult]] = {}

    async def search_places(self, query: str, location: Optional[str] = None, radius: Optional[int] = None) -> List[PlaceResult]:
        """Search for places using Text Search."""
        cache_key = f"search_{query}_{location}_{radius}"
        url = "https://maps.googleapis.com/maps/api/place/textsearch/json"
        params: Dict[str, Any] = {"query": query}
        if location:
            params["location"] = location
        if radius:
            params["radius"] = radius
            
        try:
            resp = await self._get(url, params, use_cache=True)
            results = []
            for r in resp.get("results", []):
                geom = r.get("geometry", {}).get("location", {})
                results.append(PlaceResult(
                    place_id=r.get("place_id", ""),
                    name=r.get("name", ""),
                    address=r.get("formatted_address", ""),
                    rating=r.get("rating", 0.0),
                    types=r.get("types", []),
                    lat=geom.get("lat", 0.0),
                    lng=geom.get("lng", 0.0)
                ))
            self._places_cache[cache_key] = results
            return results
        except Exception as e:
            if cache_key in self._places_cache:
                return self._places_cache[cache_key]
            return [PlaceResult(live=False, available=False, error_reason="api_unavailable")]

    async def get_place_details(self, place_id: str) -> PlaceResult:
        """Get details for a specific place."""
        cache_key = f"details_{place_id}"
        url = "https://maps.googleapis.com/maps/api/place/details/json"
        params = {"place_id": place_id}
        
        try:
            resp = await self._get(url, params, use_cache=True)
            r = resp.get("result", {})
            if not r:
                return PlaceResult(live=False, available=False, error_reason="not_found")
                
            geom = r.get("geometry", {}).get("location", {})
            result = PlaceResult(
                place_id=r.get("place_id", ""),
                name=r.get("name", ""),
                address=r.get("formatted_address", ""),
                rating=r.get("rating", 0.0),
                types=r.get("types", []),
                lat=geom.get("lat", 0.0),
                lng=geom.get("lng", 0.0)
            )
            self._places_cache[cache_key] = [result]
            return result
        except Exception as e:
            if cache_key in self._places_cache and self._places_cache[cache_key]:
                return self._places_cache[cache_key][0]
            return PlaceResult(live=False, available=False, error_reason="api_unavailable")
