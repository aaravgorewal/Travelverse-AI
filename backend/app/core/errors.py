from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from sqlalchemy.exc import SQLAlchemyError, DBAPIError
from typing import Dict, Any
import uuid
import logging
import asyncio

logger = logging.getLogger(__name__)

# Custom Domain Exceptions
class DomainException(Exception):
    def __init__(self, code: str, message: str, status_code: int = 400, retryable: bool = False):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable

class AuthenticationError(DomainException):
    def __init__(self, message: str = "Authentication failed"):
        super().__init__("AUTH_ERROR", message, status.HTTP_401_UNAUTHORIZED, retryable=False)

class AuthorizationError(DomainException):
    def __init__(self, message: str = "Permission denied"):
        super().__init__("AUTHZ_ERROR", message, status.HTTP_403_FORBIDDEN, retryable=False)

class ProviderError(DomainException):
    def __init__(self, provider: str, message: str, retryable: bool = True):
        super().__init__(f"{provider.upper()}_ERROR", message, status.HTTP_502_BAD_GATEWAY, retryable=retryable)

class RateLimitError(DomainException):
    def __init__(self, message: str = "Rate limit exceeded"):
        super().__init__("RATE_LIMIT", message, status.HTTP_429_TOO_MANY_REQUESTS, retryable=True)

class TimeoutError(DomainException):
    def __init__(self, message: str = "Request timed out"):
        super().__init__("TIMEOUT", message, status.HTTP_504_GATEWAY_TIMEOUT, retryable=True)

def generate_error_response(code: str, message: str, status_code: int, retryable: bool, request: Request) -> JSONResponse:
    request_id = getattr(request.state, "request_id", str(uuid.uuid4()))
    return JSONResponse(
        status_code=status_code,
        content={
            "error": {
                "code": code,
                "message": message,
                "request_id": request_id,
                "retryable": retryable
            }
        }
    )

def setup_exception_handlers(app: FastAPI):
    
    @app.middleware("http")
    async def request_id_middleware(request: Request, call_next):
        request.state.request_id = str(uuid.uuid4())
        try:
            return await asyncio.wait_for(call_next(request), timeout=30.0) # 30s global timeout
        except asyncio.TimeoutError:
            return generate_error_response("TIMEOUT", "Request timed out", 504, True, request)

    @app.exception_handler(DomainException)
    async def domain_exception_handler(request: Request, exc: DomainException):
        logger.warning(f"Domain error {exc.code}: {exc.message}")
        return generate_error_response(exc.code, exc.message, exc.status_code, exc.retryable, request)

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        logger.warning(f"Validation error on {request.url}: {exc.errors()}")
        return generate_error_response("VALIDATION_ERROR", "Invalid request payload", 422, False, request)

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException):
        code = "NOT_FOUND" if exc.status_code == 404 else "HTTP_ERROR"
        return generate_error_response(code, str(exc.detail), exc.status_code, exc.status_code >= 500, request)

    @app.exception_handler(SQLAlchemyError)
    @app.exception_handler(DBAPIError)
    async def db_exception_handler(request: Request, exc: Exception):
        logger.error(f"Database error on {request.url}: {str(exc)}")
        # Mask DB error details
        return generate_error_response("DATABASE_ERROR", "An internal database error occurred", 500, True, request)

    @app.exception_handler(Exception)
    async def global_exception_handler(request: Request, exc: Exception):
        logger.error(f"Unhandled exception on {request.url}: {str(exc)}", exc_info=True)
        # Parse specific provider errors generically if they leak as standard Exceptions
        error_msg = str(exc).lower()
        if "gemini" in error_msg or "google generative ai" in error_msg:
            return generate_error_response("GEMINI_ERROR", "AI provider is temporarily unavailable", 502, True, request)
        if "tbo" in error_msg:
            return generate_error_response("TBO_ERROR", "Inventory provider is temporarily unavailable", 502, True, request)
        if "google" in error_msg and "maps" in error_msg:
            return generate_error_response("GOOGLE_ERROR", "Location provider is temporarily unavailable", 502, True, request)
        if "weather" in error_msg:
            return generate_error_response("WEATHER_ERROR", "Weather provider is temporarily unavailable", 502, True, request)
            
        # Mask unknown errors
        return generate_error_response("INTERNAL_ERROR", "An unexpected error occurred", 500, True, request)
