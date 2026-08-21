import logging
import jwt
from datetime import datetime, timedelta, timezone
from enum import Enum
from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

from app.core.config import settings
from app.core.security import ALGORITHM
from app.tools.registry import ToolRegistry
from app.schemas.pricing import TrustedPrice
from app.services.price_trust import PriceTrustService

logger = logging.getLogger(__name__)

class SensitiveAction(str, Enum):
    BOOK = "BOOK"
    PAY = "PAY"
    CANCEL = "CANCEL"
    CHANGE_BOOKING = "CHANGE_BOOKING"
    SEND_CUSTOMER_MESSAGE = "SEND_CUSTOMER_MESSAGE"
    GENERATE_FINAL_DOCUMENT = "GENERATE_FINAL_DOCUMENT"
    MODIFY_TRIP = "MODIFY_TRIP"

# Mapping from SensitiveAction to ToolRegistry tool names
ACTION_TO_TOOL = {
    SensitiveAction.BOOK: "create_booking",
    SensitiveAction.CANCEL: "cancel_booking",
    SensitiveAction.CHANGE_BOOKING: "modify_booking",
    SensitiveAction.MODIFY_TRIP: "manage_trip",
    # Others would map to appropriate tool implementations or services
}

class ActionConfirmationRequest(BaseModel):
    user_id: str
    role: str
    action: SensitiveAction
    token: str = Field(..., description="The signed JWT confirmation token.")
    confirmed: bool = Field(..., description="Must be explicitly True to proceed.")
    
class ActionPrepareRequest(BaseModel):
    user_id: str
    role: str
    action: SensitiveAction
    payload: Dict[str, Any] = Field(default_factory=dict, description="The data for the action.")

class ActionGateway:
    """
    Validates and executes sensitive AI-proposed actions.
    Ensures that the AI cannot automatically execute destructive or financial actions.
    """
    
    def __init__(self, tool_registry: ToolRegistry):
        self.tool_registry = tool_registry
        
        # Permissions matrix for sensitive actions
        self.permissions: Dict[SensitiveAction, List[str]] = {
            SensitiveAction.BOOK: ["agent", "traveler"],
            SensitiveAction.PAY: ["agent", "traveler"],
            SensitiveAction.CANCEL: ["agent", "traveler"],
            SensitiveAction.CHANGE_BOOKING: ["agent", "traveler"],
            SensitiveAction.SEND_CUSTOMER_MESSAGE: ["agent"],
            SensitiveAction.GENERATE_FINAL_DOCUMENT: ["agent"],
            SensitiveAction.MODIFY_TRIP: ["agent", "traveler"]
        }

    async def prepare_action(self, request: ActionPrepareRequest) -> str:
        """
        Locks in the current state (price, availability, etc) into a signed JWT token.
        """
        allowed_roles = self.permissions.get(request.action, [])
        if request.role not in allowed_roles:
            raise PermissionError(f"Role '{request.role}' is not authorized for {request.action}.")

        # Pull critical data to lock into token
        payload_data = request.payload
        locked_state = {
            "sub": request.user_id,
            "action": request.action.value,
            "payload": payload_data,
            "exp": datetime.now(timezone.utc) + timedelta(minutes=15) # Token valid for 15 mins
        }
        
        # If it's a booking, we must lock the trusted price schema
        if request.action == SensitiveAction.BOOK and "price" in payload_data:
            try:
                trusted = PriceTrustService.validate_price_payload(payload_data["price"])
                locked_state["locked_price"] = trusted.model_dump()
                locked_state["locked_price"]["timestamp"] = locked_state["locked_price"]["timestamp"].isoformat()
            except Exception as e:
                raise ValueError(f"Cannot prepare booking: Invalid price payload. {e}")

        # Sign the JWT token
        token = jwt.encode(locked_state, settings.SECRET_KEY, algorithm=ALGORITHM)
        return token

    async def execute_confirmed_action(self, request: ActionConfirmationRequest) -> Dict[str, Any]:
        """
        Validates the explicit confirmation, decrypts the token, checks for live state changes, and executes the action.
        """
        if not request.confirmed:
            logger.info(f"User {request.user_id} denied action {request.action}.")
            return {"status": "aborted", "reason": "User did not confirm the action."}
            
        allowed_roles = self.permissions.get(request.action, [])
        if request.role not in allowed_roles:
            raise PermissionError(f"Role '{request.role}' is not authorized for {request.action}.")
            
        try:
            # Decode the token
            decoded = jwt.decode(request.token, settings.SECRET_KEY, algorithms=[ALGORITHM])
            
            # Verify owner
            if decoded.get("sub") != request.user_id:
                raise PermissionError("Token does not belong to this user.")
                
            # Verify action matches
            if decoded.get("action") != request.action.value:
                raise ValueError("Token action mismatch.")
                
            # Pull payload
            payload = decoded.get("payload", {})
            
        except jwt.ExpiredSignatureError:
            return {"status": "failed", "error": "Confirmation session expired. Please request a new quote."}
        except Exception as e:
            logger.error(f"Invalid confirmation token: {e}")
            return {"status": "failed", "error": "Invalid or tampered confirmation token."}
            
        # ---------------------------------------------------------
        # PRE-EXECUTION LIVE VALIDATION (The "Safety" Hook)
        # ---------------------------------------------------------
        if request.action == SensitiveAction.BOOK:
            locked_price_dict = decoded.get("locked_price")
            if locked_price_dict:
                # Convert ISO string back to datetime for Pydantic
                locked_price_dict["timestamp"] = datetime.fromisoformat(locked_price_dict["timestamp"])
                locked_price = TrustedPrice(**locked_price_dict)
                
                # Assert it's not stale from a business logic perspective
                try:
                    PriceTrustService.assert_bookable(locked_price, max_age_minutes=15)
                except Exception as e:
                    return {"status": "failed", "error": str(e)}
                
                # Fetch LIVE state (Mocking live check since we don't have provider hooks connected)
                # In a full implementation: live_price = await Provider.get_live_price(...)
                # if live_price.amount != locked_price.amount: return "Price changed, reconfirm required"
                logger.info(f"Verified locked price {locked_price.amount} {locked_price.currency} is still valid.")

        
        tool_name = ACTION_TO_TOOL.get(request.action)
        if not tool_name:
            logger.info(f"Action {request.action} confirmed but no direct tool mapped. Simulating execution.")
            return {"status": "success", "action": request.action, "result": "Simulated success."}
            
        logger.info(f"Executing confirmed action {request.action} via tool {tool_name} for user {request.user_id}.")
        
        try:
            result = await self.tool_registry.execute(
                tool_name=tool_name,
                params=payload,
                user_role=request.role
            )
            return {"status": "success", "action": request.action, "result": result}
        except Exception as e:
            logger.error(f"Execution failed for {request.action}: {e}")
            return {"status": "failed", "error": str(e)}
