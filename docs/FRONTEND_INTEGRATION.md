# Frontend Integration Guide

The React frontend interfaces with the backend exclusively through `src/lib/api/ai.ts`. Legacy direct calls to Gemini or mocked JSON generators inside `src/services/` have been removed.

## The `useAIAction` Hook
This is the unified state manager for all AI interactions.
- Provides `loading`, `error`, `success`, and `data` states.
- Automatically handles the `requires_confirmation` orchestrator flag, freezing execution and rendering a confirmation modal before proceeding with sensitive actions (e.g., booking a hotel).

## Rendering Dynamic UIs
When the backend returns `ui_actions` in the `AIResponse`, the frontend component should map these strings to local React components.
For example, if `widget_name: "price_chart"` is returned, the frontend mounts the `<PriceChart data={props.data} />` component. 

## No Secrets
API Keys must never be stored in `.env.local` for Vite. All LLM orchestration happens on the FastAPI backend.
