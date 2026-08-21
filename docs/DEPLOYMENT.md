# Deployment Guide

## Environment Variables
The following must be set in the production environment:
- `JWT_SECRET`: Secure cryptographic key for signing agent tokens.
- `DATABASE_URL`: Connection string to the `pgvector` enabled Postgres instance.
- `FRONTEND_URL`: Used to strict-bind CORS in FastAPI (e.g. `https://app.travelverse.ai`).
- `GEMINI_API_KEY`: Primary AI engine.

## Start Commands
**Backend**:
```bash
cd backend
alembic upgrade head
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**Frontend**:
```bash
npm run build
npm run preview
```
*(In a real production environment, use a CDN for static assets or a proper Node/Next.js runner)*
