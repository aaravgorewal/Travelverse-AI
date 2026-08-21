# API Contracts

The FastAPI backend exposes all functionality through strict JSON schemas.

## Global Error Handling
All errors (4xx, 5xx) strictly follow the global error schema:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid payload",
    "request_id": "uuid-v4",
    "retryable": false
  }
}
```

## Global AI Response Schema (`AIResponse`)
Every AI interaction endpoint (`/api/v1/ai/*` and `/api/v1/copilot/*`) returns the canonical `AIResponse` format:
```json
{
  "request_id": "string",
  "conversation_id": "string",
  "feature": "TripGenie",
  "message": "Markdown formatted AI response.",
  "data": { ... },
  "actions": [ ... ],
  "sources": ["Dubai Tourism Guidelines"],
  "warnings": ["Price hallucination detected and sanitized"],
  "confidence": "high",
  "mock": false
}
```

## MOCK_MODE Flag
When `MOCK_MODE=True` in the backend environment, all endpoints simulate API calls (TBO, Google Maps, OpenWeather) using deterministic demo data, and `AIResponse.mock` is set to `True`.
