"""Pydantic schemas for profile payloads."""

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field


class ProfileBase(BaseModel):
    """Shared profile fields."""

    phone: str | None = Field(default=None, max_length=32)
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=50)
    blood_group: str | None = Field(default=None, max_length=10)
    address: str | None = None
    emergency_contact_name: str | None = Field(default=None, max_length=255)
    emergency_contact_phone: str | None = Field(default=None, max_length=32)
    profile_image_url: str | None = Field(default=None, max_length=512)


class ProfileCreate(ProfileBase):
    """Payload used to create a profile record."""

    user_id: int


class ProfileUpdate(BaseModel):
    """Payload used to update an existing profile."""

    phone: str | None = Field(default=None, max_length=32)
    date_of_birth: date | None = None
    gender: str | None = Field(default=None, max_length=50)
    blood_group: str | None = Field(default=None, max_length=10)
    address: str | None = None
    emergency_contact_name: str | None = Field(default=None, max_length=255)
    emergency_contact_phone: str | None = Field(default=None, max_length=32)
    profile_image_url: str | None = Field(default=None, max_length=512)


class ProfileResponse(ProfileBase):
    """Response payload returned for profile records."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime