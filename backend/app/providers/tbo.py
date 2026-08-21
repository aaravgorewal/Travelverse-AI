import logging
import httpx
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field

from app.core.config import settings

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Configuration-driven endpoint definitions
# ---------------------------------------------------------------------------

class TBOEndpoint(BaseModel):
    """Defines a single TBO API endpoint. All endpoints are config-driven, not hardcoded."""
    path: str
    method: str = "POST"
    description: str = ""

# Default endpoint map — update these when TBO documentation is provided.
# Paths are relative to TBO_BASE_URL.
TBO_ENDPOINTS: Dict[str, TBOEndpoint] = {
    "flight_search": TBOEndpoint(
        path="/Search",
        method="POST",
        description="Search for available flights.",
    ),
    "hotel_search": TBOEndpoint(
        path="/HotelSearch",
        method="POST",
        description="Search for available hotels.",
    ),
    "hotel_details": TBOEndpoint(
        path="/HotelDetails",
        method="POST",
        description="Get detailed information for a specific hotel.",
    ),
    "booking_create": TBOEndpoint(
        path="/Book",
        method="POST",
        description="Create a booking.",
    ),
    "booking_status": TBOEndpoint(
        path="/BookingDetail",
        method="POST",
        description="Get the status of an existing booking.",
    ),
    "booking_cancel": TBOEndpoint(
        path="/CancelBooking",
        method="POST",
        description="Cancel an existing booking.",
    ),
}

# ---------------------------------------------------------------------------
# Unavailable / fallback response
# ---------------------------------------------------------------------------

UNAVAILABLE_RESPONSE = {
    "source": "tbo",
    "live": False,
    "available": False,
}

# ---------------------------------------------------------------------------
# TBO Provider Adapter
# ---------------------------------------------------------------------------

class TBOProvider:
    """
    Configuration-driven adapter for the TBO (TravelBoutique Online) API.

    Rules:
    - Never fabricate prices or availability data.
    - If credentials are missing or the API is unreachable, return UNAVAILABLE_RESPONSE.
    - All endpoints are defined in TBO_ENDPOINTS and can be overridden via config.
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        api_secret: Optional[str] = None,
        timeout: float = 30.0,
    ):
        self.api_key = api_key or settings.TBO_API_KEY
        self.api_secret = api_secret or settings.TBO_API_SECRET
        self.base_url = base_url or "https://api.tektravels.com/SharedServices"  # placeholder — update when docs available
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

    # --- Core request dispatcher ---

    async def _request(self, endpoint_key: str, payload: Dict[str, Any]) -> Dict[str, Any]:
        """
        Dispatches a request to TBO using the configuration-driven endpoint map.
        Returns UNAVAILABLE_RESPONSE if credentials are missing or TBO is unreachable.
        """
        import os
        is_mock_mode = os.getenv("MOCK_MODE", "true").lower() == "true"
        
        def handle_failure(reason: str):
            if is_mock_mode:
                logger.info(f"TBO failed ({reason}), but MOCK_MODE is enabled. Returning mock payload.")
                return {
                    "source": "tbo_mock",
                    "live": False,
                    "available": True,
                    "mock": True,
                    "data": {"mock_results": []} # Simulated mock payload
                }
            logger.warning(f"TBO failed ({reason}) and MOCK_MODE is false. Returning unavailable.")
            return {**UNAVAILABLE_RESPONSE, "reason": reason}

        if not self.is_configured:
            return handle_failure("credentials_not_configured")

        endpoint = TBO_ENDPOINTS.get(endpoint_key)
        if not endpoint:
            logger.error(f"Unknown TBO endpoint key: '{endpoint_key}'.")
            return {**UNAVAILABLE_RESPONSE, "reason": f"unknown_endpoint_{endpoint_key}"}

        # Inject auth credentials into the payload
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

            response.raise_for_status()

            data = response.json()
            return {
                "source": "tbo",
                "live": True,
                "available": True,
                "mock": False,
                "data": data,
            }

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
            return handle_failure("unexpected_error")

    # --- Public API ---

    async def search_flights(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("flight_search", params)

    async def search_hotels(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("hotel_search", params)

    async def get_hotel_details(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("hotel_details", params)

    async def create_booking(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("booking_create", params)

    async def get_booking_status(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("booking_status", params)

    async def cancel_booking(self, params: Dict[str, Any]) -> Dict[str, Any]:
        return await self._request("booking_cancel", params)
