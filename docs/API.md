# TRAVELVERSE AI REST API

The backend exposes a unified orchestration API for both standard travelers and agents, built using FastAPI.

## Global Concepts
- **Authentication**: All endpoints verify identity via a `Bearer` token (JWT).
- **Environment Context**: Endpoints consume a `TravelContext` object ensuring cross-lingual and contextual awareness.
- **Fail-safe Modes**: The API returns explicit `422` (Validation Error) or graceful string fallback on provider timeouts. 
- **Mock Mode**: Setting `VITE_MOCK_MODE=true` bypasses all live external providers.

## Endpoints

### 1. `POST /api/v1/ai/orchestrate`
The primary unified gateway for traveler AI tools.
- **Payload**: `ChatRequest` (includes `message`, `context`, `tools_allowed`).
- **Response**: `AIResponse` containing:
  - `reply`: The textual reasoning.
  - `data`: Typed structured JSON (e.g. `BudgetOptimizationResult`).

### 2. `POST /api/v1/copilot/chat`
Dedicated agent-only gateway. Validates JWT for `role: agent`.
- **Payload**: `CopilotChatRequest`
- **Response**: `AIResponse`

### 3. `GET /api/v1/copilot/alerts`
Proactive AI polling endpoint for agents.
- **Query**: `agent_id`
- **Response**: List of parsed `AlertIQ` JSON models.

## Error Handling
Standard HTTP codes are mapped to predictable JSON models containing `detail`.
- `401/403`: Auth or Role failure.
- `422`: Pydantic validation failure.
- `503`: All LLM providers timed out.
