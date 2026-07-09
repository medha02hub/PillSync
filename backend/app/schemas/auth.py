"""Pydantic schemas for authentication responses."""

from pydantic import BaseModel, ConfigDict, EmailStr

from app.schemas.user import UserRole


class AuthUserResponse(BaseModel):
    """Sanitized user payload returned from auth endpoints."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: UserRole
    is_active: bool


class AuthResponse(BaseModel):
    """Response returned after successful authentication."""

    user: AuthUserResponse


class CurrentUserResponse(BaseModel):
    """Basic user payload returned by the current-user endpoint."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    email: EmailStr
    role: UserRole