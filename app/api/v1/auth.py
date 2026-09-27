from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException, UnauthorizedException
from app.core.security import create_access_token, get_password_hash, verify_password
from app.dependencies import get_current_user, get_db
from app.models.user import User, UserRole

router = APIRouter(prefix="/auth", tags=["Authentication"])


class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: str
    email: str
    role: str
    is_active: bool


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    user_id: str


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(
    payload: RegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    normalized_email = payload.email.strip().lower()
    stmt = select(User).where(User.email == normalized_email)
    existing = (await db.execute(stmt)).scalar_one_or_none()
    if existing:
        raise AppException(
            code="USER_ALREADY_EXISTS",
            message=f"User with email '{normalized_email}' already exists",
            status_code=400,
        )

    assigned_role = UserRole.ADMIN if payload.role and payload.role.lower() == "admin" else UserRole.USER
    user = User(
        email=normalized_email,
        hashed_password=get_password_hash(payload.password),
        role=assigned_role,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return UserResponse(
        id=user.id,
        email=user.email,
        role=user.role.value,
        is_active=user.is_active,
    )


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    db: AsyncSession = Depends(get_db),
):
    normalized_email = payload.email.strip().lower()
    stmt = select(User).where(User.email == normalized_email)
    user = (await db.execute(stmt)).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        raise UnauthorizedException("Invalid email or password")

    if not user.is_active:
        raise UnauthorizedException("User account is inactive")

    token = create_access_token(
        data={"sub": user.id, "email": user.email, "role": user.role.value}
    )

    return TokenResponse(
        access_token=token,
        token_type="bearer",
        role=user.role.value,
        user_id=user.id,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user),
):
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        role=current_user.role.value,
        is_active=current_user.is_active,
    )
