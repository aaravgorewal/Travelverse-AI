from fastapi import APIRouter, Depends, HTTPException
from typing import Dict, Any

from app.ai.action_gateway import ActionGateway, ActionConfirmationRequest
from app.tools.registry import create_default_registry

router = APIRouter(prefix="/api/v1/ai", tags=["ai"])

# In a real app, ToolRegistry should be injected as a dependency or exist as a singleton.
# For demonstration, we'll instantiate it here with default tools.
_registry = create_default_registry()
_gateway = ActionGateway(tool_registry=_registry)

def get_action_gateway() -> ActionGateway:
    return _gateway

@router.post("/confirm-action")
async def confirm_action(
    request: ActionConfirmationRequest,
    gateway: ActionGateway = Depends(get_action_gateway)
) -> Dict[str, Any]:
    """
    Confirms and executes a sensitive AI-proposed action.
    Validates user, permissions, and explicit confirmation flag before execution.
    """
    try:
        result = await gateway.execute_confirmed_action(request)
        return result
    except PermissionError as e:
        raise HTTPException(status_code=403, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
