"""Simple service layer example for health/status checks."""


def get_service_status() -> dict[str, str]:
    """Return a service status payload used by health endpoints."""
    return {"status": "ok", "service": "PillSync API"}
