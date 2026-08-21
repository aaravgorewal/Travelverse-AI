import httpx
import logging
from typing import Optional
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings
from app.schemas.maps import GeocodeResult, Coordinate
from .base import GoogleMapsAuthException, GoogleMapsProviderException, GoogleMapsRateLimitException, GoogleMapsNotFoundException

logger = logging.getLogger(__name__)

class GoogleGeocodingProvider:
    BASE_URL = "https://maps.googleapis.com/maps/api/geocode"

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
    async def geocode(self, address: str) -> GeocodeResult:
        if not self.api_key:
            return self._mock_geocode(address)

        params = {
            "address": address,
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
                    raise GoogleMapsNotFoundException(f"Address not found: {address}")
                    
                result = data["results"][0]
                
                return GeocodeResult(
                    place_id=result["place_id"],
                    formatted_address=result["formatted_address"],
                    location=Coordinate(
                        lat=result["geometry"]["location"]["lat"],
                        lng=result["geometry"]["location"]["lng"]
                    )
                )
            except httpx.HTTPStatusError as e:
                logger.error(f"Google Geocoding API HTTP Error: {e.response.status_code}")
                raise GoogleMapsProviderException(f"API Error: {e.response.status_code}") from e

    def _mock_geocode(self, address: str) -> GeocodeResult:
        return GeocodeResult(
            place_id="mock_place_id",
            formatted_address=f"{address} (Mocked)",
            location=Coordinate(lat=40.7128, lng=-74.0060)
        )
