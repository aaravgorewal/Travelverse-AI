from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.models.identity import User
from app.api.routes.dependencies import get_db, get_current_user
from app.core.security import verify_password, create_access_token, create_refresh_token
from pydantic import BaseModel

router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class UserResponse(BaseModel):
    id: str
    name: str
    email: str
    role: str

@router.post("/login", response_model=Token)
def login_for_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    access_token_expires = timedelta(minutes=15)
    access_token = create_access_token(
        subject=str(user.id), expires_delta=access_token_expires, role=user.role
    )
    refresh_token = create_refresh_token(
        subject=str(user.id), role=user.role
    )
    
    return {"access_token": access_token, "refresh_token": refresh_token, "token_type": "bearer"}

@router.post("/logout")
def logout():
    # In a stateless JWT approach, the frontend deletes the token.
    # To enforce true server-side logout, we would implement a token blocklist in Redis/Postgres here.
    return {"message": "Logged out successfully"}

@router.post("/refresh", response_model=Token)
def refresh_token(refresh_token: str, db: Session = Depends(get_db)):
    # Verify the refresh token, and issue a new access token
    from app.core.security import ALGORITHM
    import jwt
    from app.core.config import settings
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
            
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
            
        access_token = create_access_token(subject=str(user.id), role=user.role)
        new_refresh = create_refresh_token(subject=str(user.id), role=user.role)
        return {"access_token": access_token, "refresh_token": new_refresh, "token_type": "bearer"}
        
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return {
        "id": str(current_user.id),
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }
