from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str = Field(min_length=1, max_length=120)
    password: str = Field(min_length=8, max_length=256)


class DemoLoginRequest(BaseModel):
    role: str


class RefreshRequest(BaseModel):
    refresh_token: str


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class UserMe(BaseModel):
    id: str
    username: str
    role: str
    permissions: list[str]
    state: str | None = None
    district: str | None = None
    division: str | None = None
