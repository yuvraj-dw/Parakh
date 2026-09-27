from __future__ import annotations

import inspect
import uuid
from datetime import datetime, timezone
import pytest
from sqlalchemy import String, select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, ProvenanceMixin, TimestampMixin
from app.models.user import User, UserRole
from app.dependencies import engine, async_session_maker, get_db


def test_provenance_mixin_defaults():
    class TestRecord(Base, ProvenanceMixin, TimestampMixin):
        __tablename__ = "test_records"
        id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    record = TestRecord(
        source_name="BIS_TEST_PORTAL",
        source_type="PUBLIC_PORTAL",
        source_url="https://bis.gov.in/test",
    )
    assert record.source_name == "BIS_TEST_PORTAL"
    assert record.source_type == "PUBLIC_PORTAL"
    assert record.source_url == "https://bis.gov.in/test"
    assert record.last_verified_at is not None
    assert record.retrieved_at is not None
    assert record.source_identifier is None
    assert record.published_at is None
    assert record.created_at is not None
    assert record.updated_at is not None


def test_provenance_mixin_default_values():
    class DefaultRecord(Base, ProvenanceMixin, TimestampMixin):
        __tablename__ = "default_records"
        id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))

    record = DefaultRecord()
    assert record.source_name == "MANUAL"
    assert record.source_type == "PUBLIC_RECORD"
    assert record.source_url is None
    assert record.last_verified_at is not None
    assert record.retrieved_at is not None
    assert record.id is not None


def test_user_model_instantiation():
    user = User(
        email="citizen@example.com",
        hashed_password="fakehashedpassword",
        role=UserRole.USER,
        is_active=True,
    )
    assert user.email == "citizen@example.com"
    assert user.role == UserRole.USER
    assert user.is_active is True
    assert user.hashed_password == "fakehashedpassword"
    assert user.id is not None
    assert user.created_at is not None


def test_user_model_defaults():
    user = User(
        email="admin@example.com",
        hashed_password="securehashedpassword",
    )
    assert user.role == UserRole.USER
    assert user.is_active is True
    assert user.id is not None


def test_user_role_enum_values():
    assert UserRole.USER.value == "user"
    assert UserRole.ADMIN.value == "admin"
    assert UserRole("user") == UserRole.USER
    assert UserRole("admin") == UserRole.ADMIN


@pytest.mark.asyncio
async def test_user_persistence_in_memory_db():
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        user = User(
            email="persisted@bis.gov.in",
            hashed_password="hashed_pwd_123",
            role=UserRole.ADMIN,
        )
        session.add(user)
        await session.commit()

        result = await session.execute(select(User).where(User.email == "persisted@bis.gov.in"))
        fetched_user = result.scalar_one()

        assert fetched_user.id == user.id
        assert fetched_user.email == "persisted@bis.gov.in"
        assert fetched_user.role == UserRole.ADMIN
        assert fetched_user.is_active is True
        assert fetched_user.created_at is not None

    await test_engine.dispose()


def test_dependencies_exports():
    assert engine is not None
    assert async_session_maker is not None
    assert inspect.isasyncgenfunction(get_db)


@pytest.mark.asyncio
async def test_get_db_generator_yields_session(monkeypatch):
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    test_session_maker = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    from app import dependencies

    monkeypatch.setattr(dependencies, "async_session_maker", test_session_maker)

    gen = dependencies.get_db()
    session = await gen.__anext__()
    try:
        assert isinstance(session, AsyncSession)
    finally:
        try:
            await gen.__anext__()
        except StopAsyncIteration:
            pass

    await test_engine.dispose()
