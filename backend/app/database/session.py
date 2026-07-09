"""SQLAlchemy engine and session factory configuration."""

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings


engine = create_engine(
    settings.database_url,
    echo=settings.sqlalchemy_echo,
    future=True,
    pool_pre_ping=settings.sqlalchemy_pool_pre_ping,
    pool_size=settings.sqlalchemy_pool_size,
    max_overflow=settings.sqlalchemy_max_overflow,
)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, class_=Session, future=True)


def get_db():
    """Yield a database session for request-scoped dependencies."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
