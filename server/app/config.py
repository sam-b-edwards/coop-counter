from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # Application settings
    APP_NAME: str = "CoopCounter API"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    
    # Database connection settings
    DB_HOST: str = "localhost"
    DB_USER: str = "admin"
    DB_PASSWORD: str = "S5XF3koM93"
    DB_NAME: str = "coopcounter"
    
    # CORS origins
    CORS_ORIGINS: List[str] = ["*"]
    
    # Upload directories for images
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "runs/detect/predict"
    
    # Base URL for serving images
    BASE_URL: str = "http://coopcounter.comdevelopment.com"

# Create settings instance
settings = Settings()