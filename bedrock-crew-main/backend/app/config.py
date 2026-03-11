import os
from typing import List

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application configuration"""

    environment: str = "development"
    api_host: str = "0.0.0.0"
    api_port: int = 8000
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    rate_limit_per_minute: int = 20
    default_groq_model: str = "llama-3.3-70b-versatile"
    log_level: str = "INFO"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]

    model_config = {
        "case_sensitive": False,
    }


# Initialize settings - will use environment variables in Vercel
settings = Settings()
