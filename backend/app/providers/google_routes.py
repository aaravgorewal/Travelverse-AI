from typing import Any, Dict, List, Optional
from app.core.config import settings
from .google_base import BaseGoogleProvider, RouteResult

class GoogleRoutesProvider(BaseGoogleProvider):
    PROVIDER_NAME = "google_routes"

    def __init__(self):
        super().__init__(api_key=settings.GOOGLE_ROUTES_API_KEY)
        self._routes_cache: Dict[str, RouteResult] = {}

    async def compute_routes(self, origin: str, destination: str, mode: str = "DRIVE") -> RouteResult:
        """Compute route between origin and destination."""
        cache_key = f"route_{origin}_{destination}_{mode}"
        url = "https://routes.googleapis.com/directions/v2:computeRoutes"
        
        headers = {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": self.api_key,
            "X-Goog-FieldMask": "routes.distanceMeters,routes.duration,routes.polyline.encodedPolyline"
        }
        
        body = {
            "origin": {"address": origin},
            "destination": {"address": destination},
            "travelMode": mode
        }
        
        try:
            if not self.is_configured:
                raise Exception("API Key not configured")
                
            client = self._get_client()
            resp = await client.post(url, json=body, headers=headers)
            resp.raise_for_status()
            data = resp.json()
            
            routes = data.get("routes", [])
            if not routes:
                return RouteResult(live=False, available=False, error_reason="no_route_found")
                
            first_route = routes[0]
            duration_str = first_route.get("duration", "0s")
            duration_seconds = int(duration_str.replace("s", "")) if duration_str.endswith("s") else 0
            
            result = RouteResult(
                distance_meters=first_route.get("distanceMeters", 0),
                duration_seconds=duration_seconds,
                polyline=first_route.get("polyline", {}).get("encodedPolyline", "")
            )
            
            self._routes_cache[cache_key] = result
            return result
        except Exception as e:
            if cache_key in self._routes_cache:
                return self._routes_cache[cache_key]
            return RouteResult(live=False, available=False, error_reason="api_unavailable")
