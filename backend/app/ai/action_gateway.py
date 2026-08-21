import logging
from enum import Enum
from typing import Dict, Any, List
from pydantic import BaseModel, Field

from app.tools.registry import ToolRegistry

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
    confirmed: bool = Field(..., description="Must be explicitly True to proceed.")
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
            SensitiveAction.BOOK: ["agent", "traveler"], # Both can book, depending on system config
            SensitiveAction.PAY: ["agent", "traveler"],
            SensitiveAction.CANCEL: ["agent", "traveler"],
            SensitiveAction.CHANGE_BOOKING: ["agent", "traveler"],
            SensitiveAction.SEND_CUSTOMER_MESSAGE: ["agent"],
            SensitiveAction.GENERATE_FINAL_DOCUMENT: ["agent"],
            SensitiveAction.MODIFY_TRIP: ["agent", "traveler"]
        }

    async def execute_confirmed_action(self, request: ActionConfirmationRequest) -> Dict[str, Any]:
        """
        Validates the explicit confirmation and executes the action if allowed.
        """
        if not request.confirmed:
            logger.info(f"User {request.user_id} denied action {request.action}.")
            return {"status": "aborted", "reason": "User did not confirm the action."}
            
        allowed_roles = self.permissions.get(request.action, [])
        if request.role not in allowed_roles:
            logger.warning(f"Permission denied: {request.role} attempted {request.action}.")
            raise PermissionError(f"Role '{request.role}' is not authorized for {request.action}.")
            
        # In a full implementation, we would validate 'current state' (e.g. check if booking is still active)
        # before delegating to the ToolRegistry.
        
        tool_name = ACTION_TO_TOOL.get(request.action)
        if not tool_name:
            # Fallback for actions that don't map directly to a single tool right now
            logger.info(f"Action {request.action} confirmed but no direct tool mapped. Simulating execution.")
            return {"status": "success", "action": request.action, "result": "Simulated success."}
            
        logger.info(f"Executing confirmed action {request.action} via tool {tool_name} for user {request.user_id}.")
        
        try:
            result = await self.tool_registry.execute(
                tool_name=tool_name,
                params=request.payload,
                user_role=request.role
            )
            return {"status": "success", "action": request.action, "result": result}
        except Exception as e:
            logger.error(f"Execution failed for {request.action}: {e}")
            return {"status": "failed", "error": str(e)}
