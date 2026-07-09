"""JWT utilities for creating and verifying access tokens."""

from datetime import datetime, timedelta, timezone
from typing import Any

from jose import JWTError, jwt

from app.core.config import settings


ALGORITHM = "HS256"


def create_access_token(subject: str, expires_delta: timedelta | None = None, **claims: Any) -> str:
	"""Create a signed JWT access token."""
	expires_delta = expires_delta or timedelta(minutes=settings.access_token_expire_minutes)
	expire = datetime.now(timezone.utc) + expires_delta
	payload = {"sub": subject, "exp": expire, **claims}
	return jwt.encode(payload, settings.secret_key, algorithm=ALGORITHM)


def verify_access_token(token: str) -> dict[str, Any]:
	"""Validate and decode an access token."""
	try:
		payload = jwt.decode(token, settings.secret_key, algorithms=[ALGORITHM])
	except JWTError as exc:
		raise ValueError("Invalid or expired access token") from exc

	subject = payload.get("sub")
	if not subject:
		raise ValueError("Access token is missing subject data")

	return payload
