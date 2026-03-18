"""
CivicFix - Auth Router
Signup, Login, and user profile endpoints
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import UserCreate, UserLogin, TokenResponse, UserResponse
from app.middleware.auth import (
    hash_password, verify_password, create_access_token, require_user
)

logger = logging.getLogger("civicfix.auth")
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


@router.post("/signup", response_model=TokenResponse, status_code=201)
async def signup(data: UserCreate, db: AsyncSession = Depends(get_db)):
    """Register a new user account."""
    # Check if email already exists
    result = await db.execute(select(User).where(User.email == data.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        email=data.email,
        password_hash=hash_password(data.password),
        display_name=data.display_name,
        provider="local",
        role="user",
    )
    db.add(user)
    await db.flush()

    token = create_access_token(user.id, user.role)
    logger.info(f"New user registered: {user.email}")

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        display_name=user.display_name,
        role=user.role,
    )


@router.post("/login", response_model=TokenResponse)
async def login(data: UserLogin, db: AsyncSession = Depends(get_db)):
    """Login with email and password."""
    result = await db.execute(select(User).where(User.email == data.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token(user.id, user.role)
    logger.info(f"User logged in: {user.email}")

    return TokenResponse(
        access_token=token,
        user_id=user.id,
        display_name=user.display_name,
        role=user.role,
    )


@router.get("/me", response_model=UserResponse)
async def get_me(user: User = Depends(require_user)):
    """Get current user profile."""
    return user
