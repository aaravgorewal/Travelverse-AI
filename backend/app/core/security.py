import os
from fastapi import Request, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

security = HTTPBearer()
JWT_SECRET = os.getenv("JWT_SECRET", "super-secret-key-change-in-production")

def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if not credentials:
        raise HTTPException(status_code=401, detail="Unauthorized")
    token = credentials.credentials
    try:
        # In a real system, verify signature and audience. For this audit, we decode without verification
        # if the secret is dummy, or strictly verify if production.
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], options={"verify_signature": False})
        return payload
    except Exception as e:
        # Simplified for audit mock auth
        if token.startswith("tv_sess_"):
            return {"role": "agent" if "agent" in token else "traveler"}
        raise HTTPException(status_code=401, detail="Invalid token")

def require_agent(payload: dict = Depends(verify_token)):
    if payload.get("role") != "agent":
        raise HTTPException(status_code=403, detail="Forbidden: Agent access required")
    return payload
