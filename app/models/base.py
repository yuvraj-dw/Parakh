from __future__ import annotations

import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, String
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column


class Base(DeclarativeBase):
    def __init__(self, **kwargs):
        cls = self.__class__
        if hasattr(cls, "__table__"):
            for col in cls.__table__.columns:
                if col.name not in kwargs and col.default is not None:
                    if col.default.is_callable:
                        try:
                            kwargs[col.name] = col.default.arg()
                        except TypeError:
                            kwargs[col.name] = col.default.arg(None)
                    elif col.default.is_scalar:
                        kwargs[col.name] = col.default.arg
        for key, value in kwargs.items():
            if not hasattr(cls, key):
                raise TypeError(f"'{key}' is an invalid keyword argument for {cls.__name__}")
            setattr(self, key, value)


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class ProvenanceMixin:
    source_name: Mapped[str] = mapped_column(String(100), default="MANUAL")
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True, default=None)
    source_type: Mapped[str] = mapped_column(String(50), default="PUBLIC_RECORD")
    source_identifier: Mapped[str | None] = mapped_column(String(100), nullable=True, default=None)
    retrieved_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    published_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True, default=None)
    last_verified_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
