"""Pydantic schemas for reminder payloads."""

from pydantic import BaseModel, ConfigDict


class ReminderBase(BaseModel):
    """Shared reminder fields."""

    user_id: int
    medicine_id: int
    reminder_time: str
    timezone: str = "UTC"
    status: str = "active"


class ReminderCreate(ReminderBase):
    """Payload used to create a reminder."""


class ReminderRead(ReminderBase):
    """Response payload returned for reminder records."""

    model_config = ConfigDict(from_attributes=True)

    id: int
