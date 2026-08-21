import logging
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional

from app.schemas.pricing import TrustedPrice

logger = logging.getLogger(__name__)

class PriceTrustError(ValueError):
    pass

class PriceTrustService:
    """
    Ensures all prices shown to users or committed to bookings meet strict trust criteria.
    """
    
    @staticmethod
    def validate_price_payload(payload: Dict[str, Any]) -> TrustedPrice:
        """
        Parses a raw dictionary into a TrustedPrice object, raising validation errors if invalid.
        """
        try:
            return TrustedPrice(**payload)
        except Exception as e:
            logger.error(f"Price validation failed for payload: {payload}. Error: {e}")
            raise PriceTrustError(f"Invalid price data: {e}")

    @staticmethod
    def is_price_stale(price: TrustedPrice, max_age_minutes: int = 15) -> bool:
        """
        Checks if a price is older than the allowed threshold.
        Default is 15 minutes for live travel API quotes.
        """
        if not price.timestamp:
            return True
            
        # Ensure price timestamp has timezone info
        ts = price.timestamp
        if ts.tzinfo is None:
            ts = ts.replace(tzinfo=timezone.utc)
            
        age = datetime.now(timezone.utc) - ts
        return age > timedelta(minutes=max_age_minutes)
        
    @staticmethod
    def assert_bookable(price: TrustedPrice, max_age_minutes: int = 15):
        """
        Strict check before allowing a booking action.
        The price must be live and not stale.
        """
        if not price.live:
            raise PriceTrustError(f"Cannot book using cached or estimated price from {price.source}.")
            
        if PriceTrustService.is_price_stale(price, max_age_minutes):
            raise PriceTrustError(f"Price quote from {price.source} has expired. Please refresh the live quote.")
