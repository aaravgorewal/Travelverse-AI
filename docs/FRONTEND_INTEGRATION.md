# Frontend Integration

The React TypeScript frontend relies entirely on the FastAPI backend for all data and AI operations.

## Client Configuration (`src/lib/api/ai.ts`)
All components use the central `AIResponse` type definitions to guarantee type safety across the wire. 

## UI Components & Hooks
The frontend relies heavily on two primary hooks:
1. `useTravelAI()`: Used for standard query-response loops (e.g., chat interfaces, single-shot trip generations).
2. `useAIAction()`: A state machine hook explicitly designed to manage the 7 UI states of AI interactions:
   - `loading`
   - `success`
   - `error`
   - `retry`
   - `empty`
   - `unavailable`
   - `confirmation` (Used when ActionGateway blocks an execution)

## "DEMO DATA" Banner
If any API response contains `mock: true`, the frontend global state captures this and renders a persistent red "DEMO DATA" banner across the UI.
