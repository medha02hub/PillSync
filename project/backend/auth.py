"""
PillSync — JWT helpers.

Simple sign / verify functions using PyJWT.
"""
import jwt
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

SECRET = os.getenv("JWT_SECRET", "secret")


def create_token(user_id: int) -> str:
    """Create a JWT that expires in 24 hours."""
    payload = {
        "user_id": user_id,
        "exp": datetime.now(timezone.utc) + timedelta(hours=24),
    }
    return jwt.encode(payload, SECRET, algorithm="HS256")


def verify_token(token: str) -> int:
    """Verify a JWT and return the user_id. Raises if invalid."""
    payload = jwt.decode(token, SECRET, algorithms=["HS256"])
    return payload["user_id"]
