# AI Orchestration (Gemini)

The AI layer in TRAVELVERSE acts as a sophisticated routing and synthesis engine.

## Core Services

### 1. Model Router (`model_router.py`)
Centralized wrapper around `google-genai`. Routes tasks to specific models:
- **Fast Tasks** (e.g., classification, intent detection): Uses `gemini-1.5-flash`.
- **Complex Tasks** (e.g., itinerary generation): Uses `gemini-1.5-pro`.

### 2. Intent Engine (`intent_engine.py`)
Classifies raw user queries into predefined Travel Intents (e.g., `PLAN_TRIP`, `SUPPORT`, `PACKING_LIST`), allowing the orchestrator to fire specific backend tools.

### 3. Grounding Guard (`grounding_guard.py`)
A secondary LLM validation pass that inspects generated output for hallucinations. If prices, weather, or flights are mentioned that do not explicitly exist in the `trusted_context`, the response is sanitized before reaching the frontend.

### 4. Action Gateway (`action_gateway.py`)
Ensures AI cannot execute financial transactions automatically. When the AI proposes a booking, the Action Gateway locks the trusted price and state into a signed JWT, returning a `CONFIRMATION` action payload to the frontend for human approval.
