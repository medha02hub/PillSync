"""Profile endpoints for the authenticated user."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.v1.endpoints.auth import get_current_user_from_cookie
from app.database.deps import get_db
from app.models import Profile, User
from app.schemas.profile import ProfileResponse, ProfileUpdate


router = APIRouter(prefix="/profile")


def get_current_profile(access_token: str | None, db: Session) -> Profile:
    """Load the authenticated user's profile."""
    user = get_current_user_from_cookie(access_token, db)
    profile = db.scalar(select(Profile).where(Profile.user_id == user.id))
    if profile is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Profile not found")

    return profile


@router.get("", response_model=ProfileResponse)
def read_profile(access_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> ProfileResponse:
    """Return the authenticated user's profile."""
    profile = get_current_profile(access_token, db)
    return ProfileResponse.model_validate(profile)


@router.put("", response_model=ProfileResponse)
def update_profile(
    payload: ProfileUpdate,
    access_token: str | None = Cookie(default=None),
    db: Session = Depends(get_db),
) -> ProfileResponse:
    """Update only the authenticated user's own profile fields."""
    profile = get_current_profile(access_token, db)
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No profile fields provided")

    for field, value in updates.items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ProfileResponse.model_validate(profile)