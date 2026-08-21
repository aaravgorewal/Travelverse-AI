import httpx
import logging
import base64
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings
from app.schemas.tbo import BookingResult
from .base import (
    TBOAuthException, 
    TBOProviderException, 
    TBORateLimitException, 
    TBOUnavailableException
)

logger = logging.getLogger(__name__)

class TBOBookingProvider:
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
        return httpx.AsyncClient(timeout=30.0, headers=self._get_auth_headers()) # Longer timeout for booking

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(2), # Fewer retries for booking to prevent duplicate charges
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException))
    )
    async def book_inventory(self, inventory_id: str, passenger_details: dict) -> BookingResult:
        """Executes a live booking. Throws TBO exceptions on failure."""
        if not self.api_key:
            return self._mock_booking(inventory_id)

        payload = {
            "ResultIndex": inventory_id,
            "Passengers": passenger_details
        }

        async with self._get_client() as client:
            try:
                response = await client.post(f"{self.BASE_URL}/Book", json=payload)
                
                if response.status_code == 401 or response.status_code == 403:
                    raise TBOAuthException("TBO Authentication Failed (401/403).")
                if response.status_code == 429:
                    raise TBORateLimitException("TBO Rate Limit Exceeded (429).")
                    
                response.raise_for_status()
                data = response.json()
                
                # Assume a structure for Booking
                if data.get("Status") == 1: # Assuming 1 is Success in TBO
                    return BookingResult(
                        booking_reference=data["Response"]["BookingId"],
                        status="CONFIRMED",
                        final_price=data["Response"]["Price"],
                        currency="USD"
                    )
                else:
                    return BookingResult(
                        booking_reference="N/A",
                        status="FAILED",
                        final_price=0.0,
                        currency="USD",
                        message=data.get("Error", {}).get("ErrorMessage", "Booking failed.")
                    )
                
            except httpx.TimeoutException as e:
                logger.error("TBO Booking API Timeout")
                raise TBOUnavailableException("TBO Booking API took too long to respond.") from e
            except httpx.HTTPError as e:
                logger.error(f"TBO Booking API HTTP Error: {e}")
                raise TBOProviderException("Failed to communicate with TBO Booking API.") from e

    def _mock_booking(self, inventory_id: str) -> BookingResult:
        return BookingResult(
            booking_reference=f"MOCK-PNR-{inventory_id}",
            status="CONFIRMED",
            final_price=500.00,
            currency="USD"
        )
