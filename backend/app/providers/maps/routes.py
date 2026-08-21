import httpx
import logging
from typing import Optional
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings
from app.schemas.maps import RouteDetails, RouteStep, Coordinate
from .base import GoogleMapsAuthException, GoogleMapsProviderException, GoogleMapsRateLimitException, GoogleMapsNotFoundException

logger = logging.getLogger(__name__)

class GoogleRoutesProvider:
    BASE_URL = "https://maps.googleapis.com/maps/api/directions"

    def __init__(self):
        self.api_key = settings.GOOGLE_MAPS_API_KEY
        if not self.api_key and not settings.MOCK_MODE:
            raise GoogleMapsAuthException("Missing GOOGLE_MAPS_API_KEY in environment.")

    def _get_client(self):
        return httpx.AsyncClient(timeout=10.0)

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type(httpx.HTTPError)
    )
    async def get_directions(self, origin: str, destination: str, mode: str = "driving") -> RouteDetails:
        if not self.api_key:
            return self._mock_route(origin, destination)

        params = {
            "origin": origin,
            "destination": destination,
            "mode": mode,
            "key": self.api_key
        }

        async with self._get_client() as client:
            try:
                response = await client.get(f"{self.BASE_URL}/json", params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "REQUEST_DENIED":
                    raise GoogleMapsAuthException("Google Maps API Key is invalid.")
                if data.get("status") == "OVER_QUERY_LIMIT":
                    raise GoogleMapsRateLimitException("Google Maps Quota exceeded.")
                if data.get("status") == "ZERO_RESULTS":
                    raise GoogleMapsNotFoundException(f"No route found between {origin} and {destination}")
                    
                route = data["routes"][0]
                leg = route["legs"][0]
                
                steps = []
                for step in leg["steps"]:
                    steps.append(
                        RouteStep(
                            distance_meters=step["distance"]["value"],
                            duration_seconds=step["duration"]["value"],
                            html_instructions=step["html_instructions"],
                            polyline=step["polyline"]["points"]
                        )
                    )
                    
                return RouteDetails(
                    distance_meters=leg["distance"]["value"],
                    duration_seconds=leg["duration"]["value"],
                    start_location=Coordinate(lat=leg["start_location"]["lat"], lng=leg["start_location"]["lng"]),
                    end_location=Coordinate(lat=leg["end_location"]["lat"], lng=leg["end_location"]["lng"]),
                    overview_polyline=route["overview_polyline"]["points"],
                    steps=steps
                )
            except httpx.HTTPStatusError as e:
                logger.error(f"Google Routes API HTTP Error: {e.response.status_code}")
                raise GoogleMapsProviderException(f"API Error: {e.response.status_code}") from e

    def _mock_route(self, origin: str, destination: str) -> RouteDetails:
        return RouteDetails(
            distance_meters=15000,
            duration_seconds=1800,
            start_location=Coordinate(lat=0.0, lng=0.0),
            end_location=Coordinate(lat=0.1, lng=0.1),
            overview_polyline="mock_polyline"
        )
