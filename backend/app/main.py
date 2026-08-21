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

@app.get("/api/health")
def health_check():
    return {
        "status": "ok",
        "service": "TravelVerse AI Operating System (FastAPI)",
        "aiConfigured": True # We will check the actual env variable later
    }

# We will mount routers here in Phase 2
