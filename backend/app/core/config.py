from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore" 
    )

    APP_ENV: str = "development"
    
    # Required core system (Backend will not boot without DB)
    DATABASE_URL: str
    
    # Auth & Security
    JWT_SECRET: Optional[str] = None
    CORS_ORIGINS: str = "*"

    # AI Config
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: Optional[str] = "gemini-1.5-flash"
    
    # Optional Providers
    GOOGLE_MAPS_API_KEY: Optional[str] = None
    TBO_API_KEY: Optional[str] = None
    TBO_API_SECRET: Optional[str] = None
    WEATHER_API_KEY: Optional[str] = None
    
    # Feature Flags
    MOCK_MODE: bool = True

settings = Settings()
