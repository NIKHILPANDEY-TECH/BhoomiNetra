from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator

class Settings(BaseSettings):
    DATABASE_URL: str
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    REDIS_URL: str = "redis://localhost:6379/0"
    ENVIRONMENT: str = "development"
    CORS_ORIGINS: str = "http://localhost:5173,http://127.0.0.1:5173,http://localhost:5174,http://127.0.0.1:5174,http://localhost:3000,http://127.0.0.1:3000"
    DEMO_MODE: bool = True
    ML_SERVICE_URL: str = "http://localhost:8001"
    ML_SERVICE_TIMEOUT: float = 30.0
    LOW_RISK_THRESHOLD: float = 0.40
    HIGH_RISK_THRESHOLD: float = 0.70
    MAX_UPLOAD_MB: int = 20
    model_config=SettingsConfigDict(env_file=".env", extra="ignore")
    @property
    def cors_origins(self): return [x.strip() for x in self.CORS_ORIGINS.split(',') if x.strip()]
    @field_validator("LOW_RISK_THRESHOLD","HIGH_RISK_THRESHOLD")
    @classmethod
    def threshold(cls,v):
        if not 0 <= v <= 1: raise ValueError("threshold must be between 0 and 1")
        return v

@lru_cache
def get_settings(): return Settings()
settings=get_settings()
