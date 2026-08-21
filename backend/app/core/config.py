from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field
from typing import Optional

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" # Ignore extra env vars
    )

    APP_ENV: str = "development"
    
    # Required Core Data Systems
    DATABASE_URL: str
    REDIS_URL: str
    JWT_SECRET: str
    
    # AI Config (Required for AI actions, but allow app startup if missing)
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL_DEFAULT: str = "gemini-1.5-flash"
    
    # Task-Specific Model Routing
    MODEL_CLASSIFICATION: str = "gemini-1.5-flash"
    MODEL_SIMPLE_CHAT: str = "gemini-1.5-flash"
    MODEL_RECOMMENDATION: str = "gemini-1.5-flash"
    MODEL_TRIP_PLANNING: str = "gemini-1.5-pro"
    MODEL_COMPLEX_REASONING: str = "gemini-1.5-pro"
    MODEL_SUMMARIZATION: str = "gemini-1.5-flash"
    MODEL_TRANSLATION: str = "gemini-1.5-flash"
    
    # Optional Integrations (Defaults to None so they don't block startup)
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    GOOGLE_PLACES_API_KEY: Optional[str] = None
    GOOGLE_ROUTES_API_KEY: Optional[str] = None
    GOOGLE_GEOCODING_API_KEY: Optional[str] = None
    
    TBO_API_KEY: Optional[str] = None
    TBO_API_SECRET: Optional[str] = None
    
    WEATHER_API_KEY: Optional[str] = None

settings = Settings()
