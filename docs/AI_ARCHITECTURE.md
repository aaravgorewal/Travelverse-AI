# AI Architecture

TRAVELVERSE AI employs a multi-tiered orchestration architecture to ensure strict quality, safety, and routing of AI models.

## Orchestration Flow
1. **TravelAIOrchestrator**: The primary entry point. It receives a `ChatRequest` containing the user's location, language, and role.
2. **ModelRouter**: Instead of hardcoding `gemini-1.5-flash` or `gemini-1.5-pro` everywhere, the orchestrator delegates tasks by category (e.g., `TaskCategory.COMPLEX_REASONING`, `TaskCategory.SIMPLE_CHAT`). The router selects the configured model and applies the prompt injection guardrail.
3. **Provider Fallback**: If Gemini times out or is unreachable, the `ModelRouter` seamlessly degrades to a fallback provider or returns a structured error, preventing a 500 server crash.

## GroundingGuard
All AI output must pass through the `GroundingGuard`. This secondary validation step intercepts the AI's response and checks it against the Trusted Data Context (database records, TBO API responses). 
If the AI hallucinated a price, route, or availability, the guard strips it and returns `is_hallucination: true`.

## RAG Pipeline
Policy documents, support articles, and guides are chunked, embedded via `pgvector`, and stored in PostgreSQL. The `RAGPipeline` performs similarity searches to ground answers rather than relying on Gemini's base weights.
