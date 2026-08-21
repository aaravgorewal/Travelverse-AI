import os
import shutil
import re
from pathlib import Path

BASE = Path("backend/app")

def setup_dirs():
    dirs = [
        "api/routes",
        "api/dependencies",
        "core",
        "database",
        "models",
        "schemas",
        "repositories",
        "services",
        "ai/providers",
        "ai/orchestrator",
        "ai/prompts",
        "ai/validators",
        "rag",
        "tools",
        "providers/tbo",
        "providers/google",
        "providers/weather",
    ]
    for d in dirs:
        (BASE / d).mkdir(parents=True, exist_ok=True)

def safe_move(src, dst):
    if src.exists():
        if src.is_file():
            shutil.move(str(src), str(dst))
        else:
            for item in src.iterdir():
                shutil.move(str(item), str(dst / item.name))

def restructure():
    setup_dirs()
    
    # 1. API Routes
    safe_move(BASE / "routers", BASE / "api/routes")
    safe_move(BASE / "api/ai_actions.py", BASE / "api/routes/ai_actions.py")
    safe_move(BASE / "api/trips.py", BASE / "api/routes/trips.py")
    safe_move(BASE / "api/users.py", BASE / "api/routes/users.py")
    
    # 2. AI
    safe_move(BASE / "prompts", BASE / "ai/prompts")
    if (BASE / "services/orchestrator.py").exists():
        safe_move(BASE / "services/orchestrator.py", BASE / "ai/orchestrator/orchestrator.py")
    
    # 3. Providers
    if (BASE / "providers" / "tbo.py").exists():
        safe_move(BASE / "providers" / "tbo.py", BASE / "providers/tbo/client.py")
    if (BASE / "providers" / "google_maps.py").exists():
        safe_move(BASE / "providers" / "google_maps.py", BASE / "providers/google/maps.py")
    
    # 4. RAG
    if (BASE / "services/rag_pipeline.py").exists():
        safe_move(BASE / "services/rag_pipeline.py", BASE / "rag/pipeline.py")
        
    print("Directories restructured.")

def fix_imports():
    # Very basic simulation of import fixing
    for py_file in BASE.rglob("*.py"):
        text = py_file.read_text()
        text = text.replace("app.routers.", "app.api.routes.")
        text = text.replace("app.api.", "app.api.routes.")
        text = text.replace("app.services.orchestrator", "app.ai.orchestrator.orchestrator")
        text = text.replace("app.services.rag_pipeline", "app.rag.pipeline")
        text = text.replace("app.providers.tbo", "app.providers.tbo.client")
        text = text.replace("app.providers.google_maps", "app.providers.google.maps")
        text = text.replace("app.prompts", "app.ai.prompts")
        py_file.write_text(text)
    print("Imports updated.")

if __name__ == "__main__":
    restructure()
    fix_imports()
