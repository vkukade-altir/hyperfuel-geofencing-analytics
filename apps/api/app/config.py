from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment / .env file."""

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    use_memory_store: bool = False
    default_station_radius_meters: int = 70
    app_version: str = "1.0.0"
    api_host: str = "0.0.0.0"
    api_port: int = 8000

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def uses_memory_store(self) -> bool:
        """Memory store when explicitly enabled or Supabase is not configured."""
        if self.use_memory_store:
            return True
        if not (self.supabase_url and self.supabase_service_role_key):
            return True
        # Placeholder .env from cp .env.example — treat as unconfigured.
        if "xxxxx" in self.supabase_url or "YOUR_PROJECT" in self.supabase_url:
            return True
        return False

    @property
    def supabase_configured(self) -> bool:
        return bool(
            self.supabase_url
            and self.supabase_service_role_key
            and not self.uses_memory_store
        )


@lru_cache
def get_settings() -> Settings:
    return Settings()
