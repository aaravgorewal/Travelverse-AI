# Database Schema & Structure

TRAVELVERSE relies exclusively on Supabase PostgreSQL for its production database. All interactions are governed by SQLAlchemy models (`backend/app/models/`) acting via `AsyncSession`.

## Key Domains

### 1. Identity & Auth (`users`)
- Manages Agent and Traveler profiles.
- Handles role-based access control (RBAC).

### 2. Travel State (`trips`, `bookings`)
- `trips`: Represents planned itineraries, linked to users and destinations.
- `bookings`: Represents locked-in inventory (flights, hotels) linked to TBO provider IDs.

### 3. AI State (`conversations`, `ai_memory`)
- `conversations`: Threads of chat history linking the user to the agent copilot or traveler AI.
- `ai_memory`: Sliding window summaries of the chat context to prevent LLM context window bloat while maintaining personalization.

### 4. RAG Knowledge Base (`knowledge_documents`, `knowledge_chunks`)
- `knowledge_documents`: Metadata for ingested travel policies, brochures, and destination guides.
- `knowledge_chunks`: Text segments vectorized using Gemini embeddings and stored natively via the `pgvector` extension.

## Migrations
All schema changes are managed via Alembic.
Run migrations using:
```bash
alembic upgrade head
```
