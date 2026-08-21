import httpx
import logging
from typing import List, Optional
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings
from app.schemas.maps import PlaceDetails, Coordinate
from .base import GoogleMapsAuthException, GoogleMapsProviderException, GoogleMapsRateLimitException, GoogleMapsNotFoundException

logger = logging.getLogger(__name__)

class GooglePlacesProvider:
    BASE_URL = "https://maps.googleapis.com/maps/api/place"

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
    async def search_places(self, query: str) -> List[PlaceDetails]:
        if not self.api_key:
            return self._mock_places(query)

        params = {
            "query": query,
            "key": self.api_key
        }

        async with self._get_client() as client:
            try:
                response = await client.get(f"{self.BASE_URL}/textsearch/json", params=params)
                response.raise_for_status()
                data = response.json()
                
                if data.get("status") == "REQUEST_DENIED":
                    raise GoogleMapsAuthException("Google Maps API Key is invalid.")
                if data.get("status") == "OVER_QUERY_LIMIT":
                    raise GoogleMapsRateLimitException("Google Maps Quota exceeded.")
                    
                results = []
                for item in data.get("results", []):
                    results.append(
                        PlaceDetails(
                            place_id=item["place_id"],
                            name=item["name"],
                            formatted_address=item.get("formatted_address", ""),
                            location=Coordinate(
                                lat=item["geometry"]["location"]["lat"],
                                lng=item["geometry"]["location"]["lng"]
                            ),
                            rating=item.get("rating"),
                            user_ratings_total=item.get("user_ratings_total"),
                            types=item.get("types", [])
                        )
                    )
                return results
            except httpx.HTTPStatusError as e:
                logger.error(f"Google Places API HTTP Error: {e.response.status_code}")
                raise GoogleMapsProviderException(f"API Error: {e.response.status_code}") from e

    def _mock_places(self, query: str) -> List[PlaceDetails]:
        return [
            PlaceDetails(
                place_id="mock_place_1",
                name=f"Mock result for {query}",
                formatted_address="123 Mock Street",
                location=Coordinate(lat=0.0, lng=0.0),
                rating=4.5,
                user_ratings_total=100,
                types=["point_of_interest"]
            )
        ]
