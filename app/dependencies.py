from __future__ import annotations

from typing import AsyncGenerator, Optional
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from app.integrations.llm.mock_provider import MockLLMProvider
from app.integrations.rag.mock_provider import MockRAGProvider
from app.integrations.verification.mock_provider import MockVerificationProvider
from app.integrations.vision.base import BaseVisionProvider
from app.integrations.vision.mock_provider import MockVisionProvider
from app.models.user import User, UserRole
from app.services.chat_service import ChatService
from app.services.sync_service import SyncService
from app.services.verification_service import VerificationService

settings = get_settings()

engine = create_async_engine(
    settings.DATABASE_URL,
    echo=False,
    future=True,
)

async_session_maker = async_sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        try:
            yield session
        finally:
            await session.close()


security_scheme = HTTPBearer(auto_error=False)


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if not credentials or not credentials.credentials:
        raise UnauthorizedException("Authentication token is missing")
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except Exception:
        raise UnauthorizedException("Invalid or expired authentication token")

    user_id = payload.get("sub")
    if not user_id:
        raise UnauthorizedException("Malformed token payload")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if not user:
        stmt2 = select(User).where(User.email == user_id)
        result2 = await db.execute(stmt2)
        user = result2.scalar_one_or_none()

    if not user or not user.is_active:
        raise UnauthorizedException("User not found or inactive")
    return user


async def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> Optional[User]:
    if not credentials or not credentials.credentials:
        return None
    try:
        payload = decode_access_token(credentials.credentials)
        user_id = payload.get("sub")
        if not user_id:
            return None
        stmt = select(User).where(User.id == user_id)
        user = (await db.execute(stmt)).scalar_one_or_none()
        if not user:
            stmt2 = select(User).where(User.email == user_id)
            user = (await db.execute(stmt2)).scalar_one_or_none()
        return user if user and user.is_active else None
    except Exception:
        return None


async def get_current_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise ForbiddenException("Admin privileges required to access this resource")
    return current_user


def get_verification_service() -> VerificationService:
    return VerificationService(provider=MockVerificationProvider())


def get_vision_provider() -> BaseVisionProvider:
    return MockVisionProvider()


def get_chat_service() -> ChatService:
    return ChatService(rag_provider=MockRAGProvider(), llm_provider=MockLLMProvider())


def get_sync_service() -> SyncService:
    return SyncService()
