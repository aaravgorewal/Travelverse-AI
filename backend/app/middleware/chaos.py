import os
import random
import asyncio
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

class ChaosMiddleware(BaseHTTPMiddleware):
    """
    Temporary Chaos Engineering Middleware for E2E Resilience Testing.
    Injects simulated failures, latency, and provider outages mid-flight
    if specific headers (X-Chaos-Inject-*) are present.
    """
    async def dispatch(self, request: Request, call_next):
        # Only enable if environment variable explicitly allows it
        if os.getenv("ENABLE_CHAOS_TESTING", "true").lower() != "true":
            return await call_next(request)

        # 1. Simulate PostgreSQL Connection Failure
        if request.headers.get("X-Chaos-Inject-DB-Down") == "true":
            return JSONResponse(
                status_code=500,
                content={"detail": "Database connection failed (Simulated)."}
            )

        # 2. Simulate Gemini 503 Outage
        if request.headers.get("X-Chaos-Inject-Gemini-Down") == "true":
            if "/api/v1/ai/" in request.url.path or "/api/v1/copilot" in request.url.path:
                return JSONResponse(
                    status_code=503,
                    content={"detail": "Upstream AI Provider (Gemini) Unavailable (Simulated)."}
                )

        # 3. Simulate High Latency (Timeout testing)
        latency = request.headers.get("X-Chaos-Inject-Latency-Ms")
        if latency and latency.isdigit():
            await asyncio.sleep(int(latency) / 1000.0)

        # 4. Simulate Price Change / Availability Change in Booking Gateway
        # This is heavily monitored by PriceTrustService. 
        # If we intercept a booking confirmation, we can mutate the payload to trigger the failsafe.
        # Note: In a real chaos setup, we'd mock the provider class directly rather than HTTP intercept.
        # But for E2E testing, triggering a 409 Conflict from PriceTrust is enough.
        if request.headers.get("X-Chaos-Inject-Price-Change") == "true":
            if "/api/v1/ai/confirm-action" in request.url.path:
                return JSONResponse(
                    status_code=409,
                    content={"detail": "Price validation failed. The price has changed since preparation (Simulated)."}
                )

        try:
            response = await call_next(request)
            return response
        except Exception as e:
            # Global catch to prevent unhandled crashing, ensuring we fail gracefully
            return JSONResponse(
                status_code=500,
                content={"detail": "An internal chaos exception occurred", "error": str(e)}
            )
