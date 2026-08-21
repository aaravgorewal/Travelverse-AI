# Dataset & Mock Data Guide

## RAG Requirements
To support accurate `GroundingGuard` evaluation and policy inquiries, documents must be embedded into the PostgreSQL `pgvector` store. 
- Use the `rag_pipeline.py` utility to ingest Markdown or PDF documents.
- The `type` metadata field must be populated (e.g. `policy`, `guide`, `hotel_spec`).

## Database Standards
The backend relies on SQLAlchemy. No frontend component is permitted to access the database or raw connection string.
- All ORM definitions reside in `backend/app/models/`.
- Ensure Alembic is run (`alembic upgrade head`) before starting the server.

## Mock Mode
When `VITE_MOCK_MODE=true` is set, the backend skips all calls to Google Maps, TBO, Gemini, and the live DB. It returns static mocked `AIResponse` envelopes.
Every mock response strictly includes `mock: true` in the metadata, triggering the frontend to render "Demo Data" badges.
