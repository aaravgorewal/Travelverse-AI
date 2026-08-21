"""Shared base class and error types for all Google provider adapters."""
import logging
import hashlib
import json
from typing import Any, Dict, Optional, List
from datetime import datetime, timedelta
from pydantic import BaseModel

import httpx

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Internal Normalized Schemas
# ---------------------------------------------------------------------------

class BaseGoogleResult(BaseModel):
    source: str = "google"
    live: bool = True
    available: bool = True
    mock: bool = False
    error_reason: Optional[str] = None

class PlaceResult(BaseGoogleResult):
    place_id: str = ""
    name: str = ""
    address: str = ""
    rating: float = 0.0
    types: List[str] = []
    lat: float = 0.0
    lng: float = 0.0

class RouteResult(BaseGoogleResult):
    distance_meters: int = 0
    duration_seconds: int = 0
    polyline: str = ""

class GeocodingResult(BaseGoogleResult):
    lat: float = 0.0
    lng: float = 0.0
    formatted_address: str = ""
    place_id: str = ""


class GoogleProviderError(Exception):
    """Base typed error for all Google provider failures."""
    def __init__(self, provider: str, message: str, status_code: Optional[int] = None):
        self.provider = provider
        self.status_code = status_code
        super().__init__(f"[{provider}] {message}")


class GoogleAuthError(GoogleProviderError):
    pass

class GoogleQuotaError(GoogleProviderError):
    pass

class GoogleUnavailableError(GoogleProviderError):
    pass

class GoogleNotFoundError(GoogleProviderError):
    pass


# ---------------------------------------------------------------------------
# Redis Cache for safe, repeated read-only requests
# ---------------------------------------------------------------------------
from app.core.redis import RedisCacheService
import hashlib
import json

class RequestCache:
    """Redis-based cache. Designed for idempotent GET-like requests only."""

    def __init__(self, ttl_seconds: int = 3600): # 1 hour default
        self.ttl = ttl_seconds
        self._redis = RedisCacheService()

    def _key(self, provider: str, params: Dict[str, Any]) -> str:
        raw = json.dumps({"p": provider, **params}, sort_keys=True, default=str)
        return f"google:{provider}:{hashlib.sha256(raw.encode()).hexdigest()}"

    async def get(self, provider: str, params: Dict[str, Any]) -> Optional[Any]:
        key = self._key(provider, params)
        entry = await self._redis.get(key)
        if entry is not None:
            logger.debug(f"Cache HIT for {provider}")
            return entry
        return None

    async def set(self, provider: str, params: Dict[str, Any], value: Any):
        key = self._key(provider, params)
        await self._redis.set(key, value, self.ttl)


# Singleton cache shared across Google providers
_cache = RequestCache(ttl_seconds=86400) # 24 hours for Places/Routes



# ---------------------------------------------------------------------------
# API usage tracker
# ---------------------------------------------------------------------------
class APIUsageTracker:
    """Tracks per-provider call counts. Can be extended to write to the api_usage DB table."""

    def __init__(self):
        self._counts: Dict[str, int] = {}

    def record(self, provider: str, status_code: int):
        self._counts[provider] = self._counts.get(provider, 0) + 1
        logger.info(f"API usage: {provider} call #{self._counts[provider]} (status={status_code})")

    def get_counts(self) -> Dict[str, int]:
        return dict(self._counts)


_tracker = APIUsageTracker()


# ---------------------------------------------------------------------------
# Base Google Provider
# ---------------------------------------------------------------------------
class BaseGoogleProvider:
    """Shared HTTP + caching + tracking logic for Google APIs."""

    PROVIDER_NAME: str = "google_base"

    def __init__(self, api_key: Optional[str], timeout: float = 15.0):
        self.api_key = api_key
        self.timeout = timeout
        self._client: Optional[httpx.AsyncClient] = None

    @property
    def is_configured(self) -> bool:
        return bool(self.api_key)

    def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=self.timeout)
        return self._client

    async def close(self):
        if self._client:
            await self._client.aclose()
            self._client = None

    def _handle_error(self, status_code: int, body: str):
        if status_code in (401, 403):
            raise GoogleAuthError(self.PROVIDER_NAME, f"Authentication failed: {body}", status_code)
        elif status_code == 429:
            raise GoogleQuotaError(self.PROVIDER_NAME, f"Quota exceeded: {body}", status_code)
        elif status_code == 404:
            raise GoogleNotFoundError(self.PROVIDER_NAME, f"Not found: {body}", status_code)
        elif status_code >= 500:
            raise GoogleUnavailableError(self.PROVIDER_NAME, f"Server error: {body}", status_code)
        else:
            raise GoogleProviderError(self.PROVIDER_NAME, f"HTTP {status_code}: {body}", status_code)

    async def _get(self, url: str, params: Dict[str, Any], use_cache: bool = True) -> Dict[str, Any]:
        if not self.is_configured:
            raise GoogleAuthError(self.PROVIDER_NAME, "API key not configured.")

        params["key"] = self.api_key

        if use_cache:
            cached = await _cache.get(self.PROVIDER_NAME, params)
            if cached is not None:
                return cached

        client = self._get_client()
        try:
            resp = await client.get(url, params=params)
            _tracker.record(self.PROVIDER_NAME, resp.status_code)

            if resp.status_code != 200:
                self._handle_error(resp.status_code, resp.text[:500])

            data = resp.json()
            if use_cache:
                await _cache.set(self.PROVIDER_NAME, params, data)
            return data

        except httpx.TimeoutException:
            raise GoogleUnavailableError(self.PROVIDER_NAME, "Request timed out.")
        except httpx.RequestError as e:
            raise GoogleUnavailableError(self.PROVIDER_NAME, f"Connection error: {e}")

    async def _post(self, url: str, body: Dict[str, Any], params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        if not self.is_configured:
            raise GoogleAuthError(self.PROVIDER_NAME, "API key not configured.")

        if params is None:
            params = {}
        params["key"] = self.api_key

        client = self._get_client()
        try:
            resp = await client.post(url, json=body, params=params)
            _tracker.record(self.PROVIDER_NAME, resp.status_code)

            if resp.status_code != 200:
                self._handle_error(resp.status_code, resp.text[:500])

            return resp.json()

        except httpx.TimeoutException:
            raise GoogleUnavailableError(self.PROVIDER_NAME, "Request timed out.")
        except httpx.RequestError as e:
            raise GoogleUnavailableError(self.PROVIDER_NAME, f"Connection error: {e}")
