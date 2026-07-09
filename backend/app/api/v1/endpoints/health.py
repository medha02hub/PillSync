"""Health check endpoint for uptime and deployment probes."""

from fastapi import APIRouter

router = APIRouter(prefix="/health")


@router.get("/")
def health_check() -> dict[str, str]:
    """Return a simple status payload for liveness checks."""
    return {"status": "ok", "service": "PillSync API"}
