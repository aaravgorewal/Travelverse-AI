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

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "travelverse-backend"
    }

# Include routers
app.include_router(ai_actions.router, prefix="/api/v1/ai", tags=["ai"])
app.include_router(trips.router, prefix="/api/v1/trips", tags=["trips"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
