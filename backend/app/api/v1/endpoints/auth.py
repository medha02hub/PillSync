"""Authentication endpoints for registration, login, and current-user lookup."""

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.authentication import create_access_token, hash_password, verify_access_token, verify_password
from app.core.config import settings
from app.database.deps import get_db
from app.models import Profile, User
from app.schemas.auth import AuthResponse, AuthUserResponse, CurrentUserResponse
from app.schemas.user import UserCreate, UserLogin, UserResponse


router = APIRouter(prefix="/auth")


def get_current_user_from_cookie(access_token: str | None, db: Session) -> User:
    """Resolve the current user from the access-token cookie."""
    if not access_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    try:
        payload = verify_access_token(access_token)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    subject = payload.get("sub")
    if subject is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    user = db.get(User, int(subject))
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> UserResponse:
    """Register a new user with a default patient role and empty profile."""
    existing_user = db.scalar(select(User).where(User.email == payload.email))
    if existing_user is not None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email is already registered")
    print("=" * 50)
    print("Password:", repr(payload.password))
    print("Length:", len(payload.password))
    print("=" * 50)
    user = User(
        full_name=payload.full_name,
        email=payload.email,
        password_hash=hash_password(payload.password),
    )
    db.add(user)
    db.flush()

    profile = Profile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(user)

    return user


@router.post("/login", response_model=AuthResponse)
def login_user(response: Response, payload: UserLogin, db: Session = Depends(get_db)) -> AuthResponse:
    """Validate credentials, issue a JWT, and store it in an HTTP-only cookie."""
    user = db.scalar(select(User).where(User.email == payload.email))
    if user is None or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")

    access_token = create_access_token(subject=str(user.id), role=user.role.value)
    response.set_cookie(
    key="access_token",
    value=access_token,
    httponly=True,
    secure=False,   # <-- only this line changed
    samesite="lax",
    max_age=settings.access_token_expire_minutes * 60,
    path="/",
)

    return AuthResponse(user=AuthUserResponse.model_validate(user))


@router.get("/me", response_model=CurrentUserResponse)
def read_current_user(access_token: str | None = Cookie(default=None), db: Session = Depends(get_db)) -> CurrentUserResponse:
    """Return the currently authenticated user from the cookie JWT."""
    user = get_current_user_from_cookie(access_token, db)
    return CurrentUserResponse.model_validate(user)