# Environment & Configuration

Ensure you create a `.env` file in the `backend/` directory by copying `.env.example`.

## Required Variables
```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/travelverse"

# Security
SECRET_KEY="your-super-secret-jwt-key"
CORS_ORIGINS="http://localhost:3000,https://travelverse.ai"

# Providers
GEMINI_API_KEY="your_google_ai_key"
TBO_API_KEY="your_tbo_key"
GOOGLE_MAPS_API_KEY="your_google_maps_key"
WEATHER_API_KEY="your_openweather_key"

# MOCK MODE (Set to True for offline demos without API costs)
MOCK_MODE=False
```

> [!WARNING]
> Never commit `.env` files to version control. The frontend should never have access to these API keys.
