class TBOProviderException(Exception):
    """Base exception for TBO API failures."""
    pass

class TBOAuthException(TBOProviderException):
    """Raised when the API key or secret is missing or invalid."""
    pass

class TBORateLimitException(TBOProviderException):
    """Raised when hitting quota limits."""
    pass

class TBOUnavailableException(TBOProviderException):
    """Raised when TBO services are down or timeout."""
    pass

class TBOEmptyResponseException(TBOProviderException):
    """Raised when TBO returns an empty inventory response."""
    pass
