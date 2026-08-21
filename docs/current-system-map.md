# Current System Map - TRAVELVERSE AI

## 1. Frontend Architecture
**Framework:** React 18, Vite, TypeScript
**Routing:** Assumed React Router (via `src/features/` and `src/components/shared/`)
**State Management:** Zustand (`src/stores/useAuthStore.ts`), React Context for basic states.
**API Layer:** `src/lib/api/ai.ts` acts as the unified bridge substituting legacy direct LLM calls.
**Styling:** Tailwind CSS (configured in `vite.config.ts` and `index.css`).
**Notable Components:**
- `src/features/` contains domain-driven views (e.g., `ai/TripGenieView.tsx`, `destinations/LocalSenseView.tsx`).
- `src/hooks/useTravelAI.ts` - Primary hook wrapping API logic, confirmation states, and UI actions.

## 2. Backend Architecture
**Framework:** FastAPI (Python 3.9+)
**Core App:** `backend/app/main.py`
**Domain:**
- `/api/v1/ai/orchestrate`: Primary entry for all conversational AI.
- `/api/v1/copilot/chat`: Agent-only tool orchestrator.
**Structure:**
- `app/api/`: Endpoint routers (`ai_actions.py`, `copilot_actions.py`).
- `app/services/`: 21 domain-specific AI logic handlers (`trip_genie.py`, `smart_route.py`, `smart_budget.py`).
- `app/core/`: Security (`security.py`), Configuration (`config.py`).
- `app/providers/`: External integrations (`google_routes.py`, `tbo.py`, `ai_base.py`).

## 3. Database Architecture
**Driver:** SQLAlchemy (PostgreSQL expected, configured via `.env` `DATABASE_URL`)
**ORM Models:** Located in `backend/app/models/` (`bookings.py`, `identity.py`, `trips.py`).
**Vector Store:** Uses `pgvector` for RAG implementation.
*(Note: DB connection currently mocked via `VITE_MOCK_MODE` or basic SQLite in tests unless explicitly spun up).*

## 4. Existing AI Architecture
**Orchestration Engine:** `TravelAIOrchestrator` (Entry point handling context injection).
**Routing Logic:** `ModelRouter` delegates requests to specific tuned models (e.g., `gemini-1.5-flash` for simple chat, `gemini-1.5-pro` for complex reasoning) based on `TaskCategory`.
**Guardrails:** `GroundingGuard` intercepts output to strip hallucinations (prices, dates).
**Prompt Defense:** `ModelRouter._sanitize_prompt` intercepts and neutralizes "ignore instructions" injection attempts.
**RAG Pipeline:** `rag_pipeline.py` embeds query text and searches Postgres for internal policies/guidelines.

## 5. Existing API Endpoints
- **Traveler AI:**
  - `POST /api/v1/ai/trip-genie`
  - `POST /api/v1/ai/local-sense`
  - `POST /api/v1/ai/orchestrate`
- **Agent AI (Requires JWT `role: agent`):**
  - `POST /api/v1/copilot/chat`
  - `GET /api/v1/copilot/alerts`

## 6. Existing Frontend API Calls
- The frontend strictly calls the backend via Axios/fetch inside `src/lib/api/ai.ts`.
- `useTravelAI.ts` exposes unified functions `chat()`, `planTrip()`, `recommend()`, etc., binding UI loading/error states.

## 7. Broken Integrations
- Frontend TypeScript mismatch: There is currently a structural mismatch between legacy frontend types (e.g., `PlanTripResponse`) and the new backend `AIResponse`. For the recent build to pass, I casted several exported types in `src/lib/api/ai.ts` to `any`.
- Missing frontend component wiring for some deeply nested properties inside `AIResponse.data`.

## 8. Missing Integrations
- True real-time Database WebSockets / WebHooks for `AlertIQ` triggers (currently polled).
- Missing actual TBO live provider credentials in the backend `.env`.

## 9. Duplicate Functionality
- Some overlapping logic between `trip_genie.py` (Traveler planning) and `smart_bundle.py` (Agent planning). Could be refactored into a core `BaseTripPlanner` class.
- The frontend has multiple drawer components (`DealScopeDrawer`, `AIConciergeDrawer`) that effectively render the same Chat UI structures.

## 10. Files That Must Not Be Modified
- `src/lib/api/ai.ts` (API strict contract).
- `backend/app/core/security.py` (RBAC rules).
- `backend/app/ai/model_router.py` (Core prompt injection defenses).
