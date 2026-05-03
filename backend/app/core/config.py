"""
Application configuration via Pydantic Settings.
All values are read from environment variables / .env file.
"""
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    # ── App ───────────────────────────────────────────────────
    APP_NAME: str = "EasyBook"
    APP_ENV: str = "development"
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str
    DATABASE_URL_SYNC: str

    # ── Security ──────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── Admin seed ────────────────────────────────────────────
    FIRST_ADMIN_EMAIL: str = "admin@easybook.io"
    FIRST_ADMIN_PASSWORD: str = "Admin@1234"

    # ── External APIs ─────────────────────────────────────────
    OPEN_LIBRARY_API_URL: str = "https://openlibrary.org"
    GOOGLE_BOOKS_API_URL: str = "https://www.googleapis.com/books/v1"
    GOOGLE_BOOKS_API_KEY: str = ""

    # ── CORS ──────────────────────────────────────────────────
    ALLOWED_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache
def get_settings() -> Settings:
    return Settings()
