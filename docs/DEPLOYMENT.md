# Deployment Guide

TRAVELVERSE is designed for containerized deployment (e.g., Docker) or Platform-as-a-Service (e.g., Vercel + Render).

## Pre-Flight Checklist
Before deploying to production, perform the final audit checks:
- Verify `MOCK_MODE=False`.
- Verify `CORS_ORIGINS` is restricted strictly to the production frontend domain.
- Run `alembic upgrade head` on the production Supabase PostgreSQL instance.

## Backend Deployment (FastAPI)
Deploy the FastAPI app behind a production-grade ASGI server like Uvicorn + Gunicorn:
```bash
gunicorn app.main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## Frontend Deployment (React)
Build the optimized static bundle:
```bash
npm run build
```
Host the `dist/` directory on a static CDN (Vercel, AWS S3, Cloudflare Pages). Ensure all routing falls back to `index.html` for client-side routing to function properly.
