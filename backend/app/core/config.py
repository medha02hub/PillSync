"""Centralized application settings loaded from environment variables."""

from functools import lru_cache

from dotenv import load_dotenv
from pydantic import Field, computed_field
from pydantic_settings import BaseSettings, SettingsConfigDict


load_dotenv()


class Settings(BaseSettings):
    """Typed settings object for the PillSync backend."""

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="PillSync")
    project_name: str = Field(default="PillSync")
    app_env: str = Field(default="development")
    app_debug: bool = Field(default=False)
    api_v1_prefix: str = Field(default="/api/v1")
    secret_key: str = Field(default="change-me")
    access_token_expire_minutes: int = Field(default=60)

    postgres_user: str = Field(default="pillsync")
    postgres_password: str = Field(default="pillsync_password")
    postgres_host: str = Field(default="localhost")
    postgres_port: int = Field(default=5432)
    postgres_db: str = Field(default="pillsync")
    postgres_driver: str = Field(default="postgresql+psycopg2")

    sqlalchemy_echo: bool = Field(default=False)
    sqlalchemy_pool_pre_ping: bool = Field(default=True)
    sqlalchemy_pool_size: int = Field(default=5)
    sqlalchemy_max_overflow: int = Field(default=10)

    @computed_field
    @property
    def database_url(self) -> str:
        """Build a PostgreSQL SQLAlchemy URL from environment variables."""
        return (
            f"{self.postgres_driver}://"
            f"{self.postgres_user}:{self.postgres_password}@"
            f"{self.postgres_host}:{self.postgres_port}/"
            f"{self.postgres_db}"
        )


@lru_cache
def get_settings() -> Settings:
    """Return cached settings so modules share one configuration source."""
    return Settings()


settings = get_settings()
