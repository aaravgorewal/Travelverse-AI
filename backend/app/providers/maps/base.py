class GoogleMapsProviderException(Exception):
    """Base exception for Google Maps API failures."""
    pass

class GoogleMapsAuthException(GoogleMapsProviderException):
    """Raised when the API key is missing or invalid."""
    pass

class GoogleMapsRateLimitException(GoogleMapsProviderException):
    """Raised when hitting quota limits (429)."""
    pass

class GoogleMapsNotFoundException(GoogleMapsProviderException):
    """Raised when a place or route cannot be found."""
    pass
