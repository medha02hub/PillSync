"""Reusable dependency helpers for route handlers."""

from app.database.deps import get_db

__all__ = ["get_db"]
