from __future__ import annotations

from functools import lru_cache
from typing import Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    APP_NAME: str = "Parakh"
    APP_ENV: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"

    DATABASE_URL: str = "postgresql+asyncpg://bis_user:bis_password@localhost:5432/bis_db"
    TEST_DATABASE_URL: str = "sqlite+aiosqlite:///:memory:"

    JWT_SECRET: str = "change-this-in-production-at-least-32-chars-long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ADMIN_API_KEY: str = "bis-dev-admin-secret-key-32charsmin"

    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100

    LLM_PROVIDER: str = "mock"
    LLM_API_KEY: Optional[str] = None
    LLM_BASE_URL: Optional[str] = "http://127.0.0.1:8045/v1"
    LLM_MODEL: str = "gemini-3.8-flash-high"
    GOOGLE_REFRESH_TOKEN: Optional[str] = None
    GOOGLE_PROJECT_ID: str = "aicode-consumers"
    GOOGLE_CLIENT_ID: Optional[str] = None
    GOOGLE_CLIENT_SECRET: Optional[str] = None
    RAG_PROVIDER: str = "mock"
    RAG_BASE_URL: Optional[str] = None
    VERIFICATION_PROVIDER: str = "mock"
    VISION_PROVIDER: str = "mock"
    VISION_BASE_URL: Optional[str] = "http://127.0.0.1:8045/v1"
    VISION_MODEL: str = "gemini-3.8-flash-high"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
