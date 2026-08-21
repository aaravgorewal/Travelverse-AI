from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import ai_actions, trips, users

app = FastAPI(title="Travelverse AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.core.errors import setup_exception_handlers
setup_exception_handlers(app)

from sqlalchemy import text
from app.database.session import SessionLocal

@app.get("/health")
def health_check():
    db_status = "unavailable"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db_status = "connected"
    except Exception:
        db_status = "unavailable"
    finally:
        try:
            db.close()
        except Exception:
            pass

    return {
        "status": "ok",
        "service": "travelverse-backend",
        "database": db_status
    }

# Include routers
app.include_router(ai_actions.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(trips.router, prefix="/api/v1/trips", tags=["trips"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
