"""User model for PillSync accounts."""

from datetime import datetime
from enum import Enum

from sqlalchemy import Boolean, CheckConstraint, DateTime, Enum as SQLEnum, Index, Integer, String, UniqueConstraint, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class UserRole(str, Enum):
    PATIENT = "PATIENT"
    CAREGIVER = "CAREGIVER"
    ADMIN = "ADMIN"

class User(Base):
    """Represents a registered PillSync user."""

    __tablename__ = "users"
    __table_args__ = (
        UniqueConstraint("email", name="uq_users_email"),
        CheckConstraint("length(trim(full_name)) > 0", name="ck_users_full_name_not_blank"),
        CheckConstraint("length(trim(password_hash)) > 0", name="ck_users_password_hash_not_blank"),
        Index("ix_users_role_is_active", "role", "is_active"),
        Index("ix_users_created_at", "created_at"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[UserRole] = mapped_column(
        SQLEnum(UserRole, name="user_role", native_enum=True, validate_strings=True),
        nullable=False,
        default=UserRole.PATIENT,
        server_default=UserRole.PATIENT.value,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )

    reminders = relationship("Reminder", back_populates="user", cascade="all, delete-orphan")
    profile = relationship("Profile", back_populates="user", cascade="all, delete-orphan", uselist=False)
