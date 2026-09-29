from __future__ import annotations

import re
from typing import AsyncGenerator, Optional
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import decode_access_token
from app.integrations.google_oauth_provider import (
    GoogleOAuthLLMProvider,
    GoogleOAuthTokenManager,
    GoogleOAuthVisionProvider,
)
from app.integrations.llm.base import BaseLLMProvider
from app.integrations.llm.mock_provider import MockLLMProvider
from app.integrations.openai_compatible import (
    OpenAICompatibleLLMProvider,
    OpenAICompatibleVisionProvider,
)
from app.integrations.rag.mock_provider import MockRAGProvider
from app.integrations.verification.base import BaseVerificationProvider
from app.integrations.verification.mock_provider import MockVerificationProvider
from app.integrations.verification.official_provider import (
    BISOfficialApiProvider,
    OfficialRedirectProvider,
)
from app.integrations.vision.base import BaseVisionProvider
from app.integrations.vision.mock_provider import MockVisionProvider
from app.models.user import User, UserRole
from app.services.chat_service import ChatService
from app.services.sync_service import SyncService
from app.services.verification_service import VerificationService

settings = get_settings()

# ponytail: auto-sanitize Supabase / Cloud URLs and SSL options for asyncpg
db_url = settings.DATABASE_URL
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql+asyncpg://", 1)
elif db_url.startswith("postgresql://") and "+asyncpg" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

connect_args = {}
if any(k in db_url for k in ("supabase.co", "pooler.supabase.com", "sslmode", "ssl=require")):
    connect_args["ssl"] = "require"
    db_url = re.sub(r"[?&]sslmode=[^&]+", "", db_url)
    if "?" not in db_url and "&" in db_url:
        db_url = db_url.replace("&", "?", 1)

engine = create_async_engine(
    db_url,
    echo=False,
    future=True,
    connect_args=connect_args,
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


require_admin = get_current_admin


def get_verification_service() -> VerificationService:
    provider_type = (settings.VERIFICATION_PROVIDER or "mock").lower()
    if provider_type == "redirect":
        provider: BaseVerificationProvider = OfficialRedirectProvider()
    elif provider_type == "official":
        provider = BISOfficialApiProvider()
    else:
        provider = MockVerificationProvider()
    return VerificationService(provider=provider)


_google_token_manager: Optional[GoogleOAuthTokenManager] = None


def get_google_token_manager() -> Optional[GoogleOAuthTokenManager]:
    global _google_token_manager
    if _google_token_manager is None and settings.GOOGLE_REFRESH_TOKEN:
        _google_token_manager = GoogleOAuthTokenManager(
            refresh_token=settings.GOOGLE_REFRESH_TOKEN,
            client_id=settings.GOOGLE_CLIENT_ID,
            client_secret=settings.GOOGLE_CLIENT_SECRET,
        )
    return _google_token_manager


def get_vision_provider() -> BaseVisionProvider:
    provider_type = (settings.VISION_PROVIDER or "mock").lower()
    if provider_type in ("google_oauth", "antigravity_oauth") or settings.GOOGLE_REFRESH_TOKEN:
        mgr = get_google_token_manager()
        if mgr:
            return GoogleOAuthVisionProvider(
                token_manager=mgr,
                model=settings.VISION_MODEL or "gemini-3.8-flash-high",
                project=settings.GOOGLE_PROJECT_ID,
            )

    if provider_type in ("openai_compatible", "antigravity", "openai", "gemini"):
        return OpenAICompatibleVisionProvider(
            base_url=settings.VISION_BASE_URL or "http://127.0.0.1:8045/v1",
            api_key=settings.LLM_API_KEY,
            model=settings.VISION_MODEL or "gemini-3.8-flash-high",
        )
    return MockVisionProvider()


def get_chat_service() -> ChatService:
    provider_type = (settings.LLM_PROVIDER or "mock").lower()
    if provider_type in ("google_oauth", "antigravity_oauth") or settings.GOOGLE_REFRESH_TOKEN:
        mgr = get_google_token_manager()
        if mgr:
            llm: BaseLLMProvider = GoogleOAuthLLMProvider(
                token_manager=mgr,
                model=settings.LLM_MODEL or "gemini-3.8-flash-high",
                project=settings.GOOGLE_PROJECT_ID,
            )
            return ChatService(rag_provider=MockRAGProvider(), llm_provider=llm)

    if provider_type in ("openai_compatible", "antigravity", "openai", "gemini"):
        llm = OpenAICompatibleLLMProvider(
            base_url=settings.LLM_BASE_URL or "http://127.0.0.1:8045/v1",
            api_key=settings.LLM_API_KEY,
            model=settings.LLM_MODEL or "gemini-3.8-flash-high",
        )
    else:
        llm = MockLLMProvider()
    return ChatService(rag_provider=MockRAGProvider(), llm_provider=llm)


def get_sync_service() -> SyncService:
    return SyncService()
