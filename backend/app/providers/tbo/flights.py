import httpx
import logging
import base64
from typing import List, Dict, Any
from datetime import datetime
from tenacity import retry, wait_exponential, stop_after_attempt, retry_if_exception_type

from app.core.config import settings
from app.schemas.tbo import FlightResult
from .base import (
    TBOAuthException, 
    TBOProviderException, 
    TBORateLimitException, 
    TBOUnavailableException,
    TBOEmptyResponseException
)

logger = logging.getLogger(__name__)

class TBOFlightProvider:
    # Placeholder base URL - needs official configuration
    BASE_URL = "https://api.travelboutiqueonline.com/SharedAPI/SharedData.svc/rest"

    def __init__(self):
        self.api_key = settings.TBO_API_KEY
        self.api_secret = settings.TBO_API_SECRET
        
        if not self.api_key and not settings.MOCK_MODE:
            raise TBOAuthException("Missing TBO_API_KEY in environment.")

    def _get_auth_headers(self) -> dict:
        # Standard Basic Auth encoding typical for TBO
        if not self.api_key or not self.api_secret:
            return {}
        credentials = f"{self.api_key}:{self.api_secret}"
        encoded_credentials = base64.b64encode(credentials.encode()).decode()
        return {
            "Authorization": f"Basic {encoded_credentials}",
            "Content-Type": "application/json"
        }

    def _get_client(self):
        # Strict 15-second timeout to prevent hanging the AI orchestrator
        return httpx.AsyncClient(timeout=15.0, headers=self._get_auth_headers())

    @retry(
        wait=wait_exponential(multiplier=1, min=2, max=10),
        stop=stop_after_attempt(3),
        retry=retry_if_exception_type((httpx.HTTPError, httpx.TimeoutException))
    )
    async def search_flights(self, origin: str, destination: str, date: str) -> List[FlightResult]:
        """Search for flights. Throws TBO exceptions on failure; never hallucinates data."""
        if not self.api_key:
            return self._mock_flights(origin, destination)

        payload = {
            "Origin": origin,
            "Destination": destination,
            "DepartureDate": date,
            "AdultCount": 1
        }

        async with self._get_client() as client:
            try:
                # Endpoint path is placeholder based on typical REST layouts
                response = await client.post(f"{self.BASE_URL}/SearchFlights", json=payload)
                
                if response.status_code == 401 or response.status_code == 403:
                    raise TBOAuthException("TBO Authentication Failed (401/403).")
                if response.status_code == 429:
                    raise TBORateLimitException("TBO Rate Limit Exceeded (429).")
                    
                response.raise_for_status()
                data = response.json()
                
                if not data or "Results" not in data or not data["Results"]:
                    raise TBOEmptyResponseException(f"No flights found between {origin} and {destination}.")
                    
                # Normalize raw TBO response into clean FlightResult schemas
                normalized_results = []
                for result in data["Results"][0]:
                    flight = result["Segments"][0][0]
                    normalized_results.append(
                        FlightResult(
                            id=result["ResultIndex"],
                            airline=flight["Airline"]["AirlineName"],
                            flight_number=flight["Airline"]["FlightNumber"],
                            departure_airport=flight["Origin"]["Airport"]["AirportCode"],
                            arrival_airport=flight["Destination"]["Airport"]["AirportCode"],
                            departure_time=datetime.fromisoformat(flight["Origin"]["DepTime"]),
                            arrival_time=datetime.fromisoformat(flight["Destination"]["ArrTime"]),
                            duration_minutes=flight["Duration"],
                            price=result["Fare"]["OfferedFare"],
                            currency=result["Fare"]["Currency"],
                            cabin_class="Economy"
                        )
                    )
                return normalized_results
                
            except httpx.TimeoutException as e:
                logger.error("TBO Flight API Timeout")
                raise TBOUnavailableException("TBO API took too long to respond.") from e
            except httpx.HTTPError as e:
                logger.error(f"TBO Flight API HTTP Error: {e}")
                raise TBOProviderException("Failed to communicate with TBO API.") from e

    def _mock_flights(self, origin: str, destination: str) -> List[FlightResult]:
        return [
            FlightResult(
                id="mock_flight_1",
                airline="Mock Airlines",
                flight_number="MK101",
                departure_airport=origin,
                arrival_airport=destination,
                departure_time=datetime.now(),
                arrival_time=datetime.now(),
                duration_minutes=120,
                price=299.99,
                currency="USD",
                cabin_class="Economy"
            )
        ]
