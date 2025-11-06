from pydantic_settings import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "CoopCounter API"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() == "true"

    # Database connection settings
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_USER: str = os.getenv("DB_USER", "your_username")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "your_password")
    DB_NAME: str = os.getenv("DB_NAME", "coopcounter")

    # CORS origins
    CORS_ORIGINS: List[str] = ["*"]

    # Upload directories for images
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "runs/detect/predict"
    AVATAR_DIR: str = "avatars"

    # Base URL for serving images
    BASE_URL: str = os.getenv("BASE_URL", "http://localhost:8000")

    class Config:
        env_file = ".env"
        case_sensitive = True

# Create settings instance
settings = Settings()