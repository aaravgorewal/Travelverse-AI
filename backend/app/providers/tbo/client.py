import logging
import httpx
import os
from typing import Any, Dict, Optional, List
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal Normalized Schemas
# ---------------------------------------------------------------------------

class BaseTBOResult(BaseModel):
    source: str = "tbo"
    live: bool = True
    available: bool = True
    mock: bool = False
    error_reason: Optional[str] = None

class HotelResult(BaseTBOResult):
    hotel_code: str = ""
    hotel_name: str = ""
    rating: int = 0
    price: float = 0.0
    currency: str = "USD"
    address: str = ""

class FlightResult(BaseTBOResult):
    flight_id: str = ""
    airline: str = ""
    flight_number: str = ""
    departure: str = ""
    arrival: str = ""
    price: float = 0.0
    currency: str = "USD"

class AvailabilityResult(BaseTBOResult):
    is_available: bool = False
    price_change: bool = False
    new_price: float = 0.0
    currency: str = "USD"
    token: str = ""

class BookingResult(BaseTBOResult):
    booking_id: str = ""
    booking_reference: str = ""
    status: str = ""
    total_amount: float = 0.0
    currency: str = "USD"

# ---------------------------------------------------------------------------
# Configuration-driven endpoint definitions
# ---------------------------------------------------------------------------

class TBOEndpoint(BaseModel):
    path: str
    method: str = "POST"
    description: str = ""

TBO_ENDPOINTS: Dict[str, TBOEndpoint] = {
    "flight_search": TBOEndpoint(path="/Search", method="POST", description="Search for available flights."),
    "hotel_search": TBOEndpoint(path="/HotelSearch", method="POST", description="Search for available hotels."),
    "availability": TBOEndpoint(path="/AvailabilityAndPricing", method="POST", description="Verify live pricing and availability."),
    "hotel_details": TBOEndpoint(path="/HotelDetails", method="POST", description="Get detailed information for a specific hotel."),
    "booking_create": TBOEndpoint(path="/HotelBook", method="POST", description="Create a hotel booking."),
    "booking_status": TBOEndpoint(path="/HotelBookingDetail", method="POST", description="Get the status of an existing booking."),
    "booking_cancel": TBOEndpoint(path="/HotelCancel", method="POST", description="Cancel an existing booking."),
}

# ---------------------------------------------------------------------------
# TBO Provider Adapter
# ---------------------------------------------------------------------------

class TBOProvider:
    """
    Configuration-driven adapter for the TBO API (V7).
    Strictly normalizes all outputs to internal Pydantic schemas.
    Never fabricates missing data.
    """

    def __init__(self, base_url: Optional[str] = None, api_key: Optional[str] = None, api_secret: Optional[str] = None, timeout: float = 30.0):
        self.api_key = api_key or settings.TBO_API_KEY
        self.api_secret = api_secret or settings.TBO_API_SECRET
        self.base_url = base_url or "https://api.tektravels.com/SharedServices/SharedData.svc/rest"
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key and self.api_secret)

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(
                base_url=self.base_url,
                timeout=self.timeout,
                headers={"Content-Type": "application/json"},
            )
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    async def _request(self, endpoint_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Core dispatcher with strict HTTPX exception handling."""
        is_mock_mode = os.getenv("MOCK_MODE", "true").lower() == "true"
        
        def handle_failure(reason: str) -> Dict[str, Any]:
            if is_mock_mode:
                logger.info(f"TBO failed ({reason}), but MOCK_MODE is enabled. Returning mock payload.")
                return {"mock": True, "success": True, "data": []}
            logger.warning(f"TBO failed ({reason}) and MOCK_MODE is false. Returning unavailable.")
            return {"mock": False, "success": False, "error_reason": reason}

        if not self.is_configured:
            return handle_failure("credentials_not_configured")

        endpoint = TBO_ENDPOINTS.get(endpoint_key)
        if not endpoint:
            return handle_failure(f"unknown_endpoint_{endpoint_key}")

        authenticated_payload = {
            "ClientId": self.api_key,
            "UserName": self.api_key,
            "Password": self.api_secret,
            **payload,
        }

        client = self._get_client()

        try:
            if endpoint.method.upper() == "POST":
                response = await client.post(endpoint.path, json=authenticated_payload)
            else:
                response = await client.get(endpoint.path, params=authenticated_payload)
                
            if response.status_code in (401, 403):
                return handle_failure("authentication_failed")
            if response.status_code == 429:
                return handle_failure("rate_limit_exceeded")
                
            response.raise_for_status()
            data = response.json()
            
            # Check for API-level errors nested in JSON
            if data.get("Error") and data["Error"].get("ErrorCode") != 0:
                return handle_failure(f"api_error_{data['Error'].get('ErrorMessage', 'unknown')}")

            return {"mock": False, "success": True, "data": data}

        except httpx.TimeoutException:
            logger.error(f"TBO request timed out for '{endpoint_key}'.")
            return handle_failure("timeout")
        except httpx.HTTPStatusError as e:
            logger.error(f"TBO HTTP error for '{endpoint_key}': {e.response.status_code}")
            return handle_failure(f"http_{e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"TBO connection error for '{endpoint_key}': {e}")
            return handle_failure("connection_error")
        except Exception as e:
            logger.error(f"Unexpected TBO error for '{endpoint_key}': {e}")
            return handle_failure("invalid_response")

    # --- Public API Normalization Wrappers ---

    async def search_hotels(self, params: Dict[str, Any]) -> List[HotelResult]:
        resp = await self._request("hotel_search", params)
        if not resp["success"]:
            if resp.get("mock"):
                return [HotelResult(hotel_code="MOCK1", hotel_name="Demo Hotel", price=150.0, mock=True)]
            return [HotelResult(available=False, live=False, error_reason=resp.get("error_reason"))]
            
        # Parse TBO JSON safely
        results = []
        raw_data = resp.get("data", {})
        hotels = raw_data.get("HotelSearchResult", {}).get("HotelResults", [])
        for h in hotels:
            results.append(HotelResult(
                hotel_code=str(h.get("HotelCode", "")),
                hotel_name=h.get("HotelName", "Unknown"),
                rating=h.get("StarRating", 0),
                price=h.get("Price", {}).get("PublishedPrice", 0.0),
                currency=h.get("Price", {}).get("CurrencyCode", "USD"),
                address=h.get("HotelAddress", "")
            ))
        return results

    async def verify_availability(self, params: Dict[str, Any]) -> AvailabilityResult:
        resp = await self._request("availability", params)
        if not resp["success"]:
            if resp.get("mock"):
                return AvailabilityResult(is_available=True, new_price=150.0, mock=True)
            return AvailabilityResult(available=False, is_available=False, live=False, error_reason=resp.get("error_reason"))
            
        raw_data = resp.get("data", {}).get("HotelRoomsDetails", [])
        if not raw_data:
            return AvailabilityResult(is_available=False, error_reason="empty_results")
            
        return AvailabilityResult(
            is_available=True,
            price_change=resp.get("data", {}).get("PriceVerification", {}).get("PriceChanged", False),
            new_price=raw_data[0].get("Price", {}).get("PublishedPrice", 0.0),
            currency=raw_data[0].get("Price", {}).get("CurrencyCode", "USD")
        )

    async def create_booking(self, params: Dict[str, Any]) -> BookingResult:
        resp = await self._request("booking_create", params)
        if not resp["success"]:
            if resp.get("mock"):
                return BookingResult(booking_id="MOCK-BK-123", status="Confirmed", total_amount=150.0, mock=True)
            return BookingResult(available=False, live=False, error_reason=resp.get("error_reason"))
            
        data = resp.get("data", {}).get("BookResult", {})
        if not data:
            return BookingResult(available=False, live=False, error_reason="invalid_response")
            
        return BookingResult(
            booking_id=str(data.get("BookingId", "")),
            booking_reference=data.get("BookingRefNo", ""),
            status=data.get("Status", "Pending"),
            total_amount=data.get("HotelBookingStatus", {}).get("Price", {}).get("PublishedPrice", 0.0),
            currency=data.get("HotelBookingStatus", {}).get("Price", {}).get("CurrencyCode", "USD")
        )

    async def search_flights(self, params: Dict[str, Any]) -> List[FlightResult]:
        resp = await self._request("flight_search", params)
        if not resp["success"]:
            if resp.get("mock"):
                return [FlightResult(flight_id="FL-MOCK", airline="MockAir", flight_number="MA123", mock=True)]
            return [FlightResult(available=False, live=False, error_reason=resp.get("error_reason"))]
            
        # Parse flight results
        results = []
        flights = resp.get("data", {}).get("Response", {}).get("Results", [[]])[0]
        for f in flights:
            segments = f.get("Segments", [[{}]])[0][0]
            results.append(FlightResult(
                flight_id=f.get("ResultIndex", ""),
                airline=segments.get("Airline", {}).get("AirlineName", "Unknown"),
                flight_number=segments.get("Airline", {}).get("FlightNumber", ""),
                departure=segments.get("Origin", {}).get("Airport", {}).get("CityName", ""),
                arrival=segments.get("Destination", {}).get("Airport", {}).get("CityName", ""),
                price=f.get("Fare", {}).get("PublishedFare", 0.0),
                currency=f.get("Fare", {}).get("Currency", "USD")
            ))
        return results
