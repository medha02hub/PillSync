"""Pydantic schemas for user payloads."""

from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class UserRole(str, Enum):
    """Supported user roles in request and response payloads."""

    PATIENT = "Patient"
    CAREGIVER = "Caregiver"
    ADMIN = "Admin"


class UserBase(BaseModel):
    """Shared user fields."""

    email: EmailStr
    full_name: str = Field(min_length=1, max_length=255)
    role: UserRole = UserRole.PATIENT


class UserCreate(UserBase):
    """Payload used to register a new user."""

    password: str = Field(min_length=8, max_length=128)


class UserUpdate(BaseModel):
    """Payload used to update an existing user."""

    email: EmailStr | None = None
    full_name: str | None = Field(default=None, min_length=1, max_length=255)
    role: UserRole | None = None
    is_active: bool | None = None


class UserLogin(BaseModel):
    """Payload used to authenticate a user."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class UserResponse(UserBase):
    """Response payload returned for user records."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    is_active: bool
    created_at: datetime
    updated_at: datetime
    profile: "ProfileResponse | None" = None


from app.schemas.profile import ProfileResponse  # noqa: E402
