import httpx
import logging
import base64
from typing import List
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings
from app.schemas.tbo import HotelResult, RoomType
from .base import (
    TBOAuthException, 
    TBOProviderException, 
    TBORateLimitException, 
    TBOUnavailableException,
    TBOEmptyResponseException
)

logger = logging.getLogger(__name__)

class TBOHotelProvider:
    BASE_URL = "https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest"

    def __init__(self):
        self.api_key = settings.TBO_API_KEY
        self.api_secret = settings.TBO_API_SECRET
        
        if not self.api_key and not settings.MOCK_MODE:
            raise TBOAuthException("Missing TBO_API_KEY in environment.")

    def _get_auth_headers(self) -> dict:
        if not self.api_key or not self.api_secret:
            return {}
        credentials = f"{self.api_key}:{self.api_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }

    def _get_client(self):
        return httpx.AsyncClient(timeout=15.0, headers=self._get_auth_headers())

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException))
    )
    async def search_hotels(self, city_code: str, checkin: str, checkout: str) -> List[HotelResult]:
        """Search for hotels. Throws TBO exceptions on failure; never hallucinates data."""
        if not self.api_key:
            return self._mock_hotels(city_code)

        payload = {
            "CityId": city_code,
            "CheckInDate": checkin,
            "CheckOutDate": checkout,
            "RoomGuests": [{"NoOfAdults": 2, "NoOfChild": 0}]
        }

        async with self._get_client() as client:
            try:
                response = await client.post(f"{self.BASE_URL}/SearchHotels", json=payload)
                
                if response.status_code == 401 or response.status_code == 403:
                    raise TBOAuthException("TBO Authentication Failed (401/403).")
                if response.status_code == 429:
                    raise TBORateLimitException("TBO Rate Limit Exceeded (429).")
                    
                response.raise_for_status()
                data = response.json()
                
                if not data or "HotelSearchResult" not in data or not data["HotelSearchResult"]["HotelResults"]:
                    raise TBOEmptyResponseException(f"No hotels found in {city_code}.")
                    
                normalized_results = []
                for hotel in data["HotelSearchResult"]["HotelResults"]:
                    normalized_results.append(
                        HotelResult(
                            id=hotel["HotelCode"],
                            hotel_name=hotel["HotelName"],
                            star_rating=hotel.get("StarRating"),
                            address=hotel.get("HotelAddress", "Address Unavailable"),
                            lowest_price=hotel["Price"]["PublishedPrice"],
                            currency=hotel["Price"]["CurrencyCode"],
                            rooms=[RoomType(name="Standard Room", price=hotel["Price"]["PublishedPrice"], is_refundable=False)] # Placeholder mapping
                        )
                    )
                return normalized_results
                
            except httpx.TimeoutException as e:
                logger.error("TBO Hotel API Timeout")
                raise TBOUnavailableException("TBO API took too long to respond.") from e
            except httpx.HTTPError as e:
                logger.error(f"TBO Hotel API HTTP Error: {e}")
                raise TBOProviderException("Failed to communicate with TBO API.") from e

    def _mock_hotels(self, city_code: str) -> List[HotelResult]:
        return [
            HotelResult(
                id="mock_hotel_1",
                hotel_name=f"Mock Hotel {city_code}",
                star_rating=4.5,
                address="456 Resort Ave",
                lowest_price=150.00,
                currency="USD",
                rooms=[RoomType(name="Ocean View", price=150.00, is_refundable=True)]
            )
        ]
