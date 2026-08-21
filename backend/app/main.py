from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="TravelVerse AI OS API",
    description="Backend for the TravelVerse AI OS platform",
    version="1.0.0"
)

# Configure CORS so the Vite frontend (React) can connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Update for production
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

# Mount AI routers
from app.api.ai_actions import router as ai_actions_router
app.include_router(ai_actions_router)

from app.api.copilot_actions import router as copilot_actions_router
app.include_router(copilot_actions_router)
