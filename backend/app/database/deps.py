"""Database dependencies for FastAPI route handlers."""

from collections.abc import Generator

from sqlalchemy.orm import Session

from app.database.session import SessionLocal


def get_db() -> Generator[Session, None, None]:
    """Yield a SQLAlchemy session per request and close it afterwards."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
