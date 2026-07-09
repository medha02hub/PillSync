"""Pydantic schemas for medicine payloads."""

from pydantic import BaseModel, ConfigDict


class MedicineBase(BaseModel):
    """Shared medicine fields."""

    name: str
    description: str | None = None
    dosage_instructions: str | None = None


class MedicineCreate(MedicineBase):
    """Payload used to create a medicine record."""


class MedicineRead(MedicineBase):
    """Response payload returned for medicine records."""

    model_config = ConfigDict(from_attributes=True)

    id: int
