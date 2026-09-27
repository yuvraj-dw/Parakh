from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone
from sqlalchemy import DateTime, Enum, ForeignKey, Integer, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class SyncStatus(str, enum.Enum):
    RUNNING = "RUNNING"
    SUCCESS = "SUCCESS"
    PARTIAL = "PARTIAL"
    FAILED = "FAILED"


class SyncRun(Base, TimestampMixin):
    __tablename__ = "sync_runs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    dataset: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    status: Mapped[SyncStatus] = mapped_column(
        Enum(SyncStatus), default=SyncStatus.RUNNING, nullable=False
    )
    records_seen: Mapped[int] = mapped_column(Integer, default=0)
    records_created: Mapped[int] = mapped_column(Integer, default=0)
    records_updated: Mapped[int] = mapped_column(Integer, default=0)
    records_deactivated: Mapped[int] = mapped_column(Integer, default=0)
    source: Mapped[str] = mapped_column(String(100), default="MOCK_FEED")
    started_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    completed_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True), nullable=True, default=None
    )

    errors: Mapped[list[SyncError]] = relationship(
        "SyncError", back_populates="sync_run", cascade="all, delete-orphan"
    )


class SyncError(Base, TimestampMixin):
    __tablename__ = "sync_errors"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    sync_run_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sync_runs.id", ondelete="CASCADE"), nullable=False
    )
    item_identifier: Mapped[str | None] = mapped_column(
        String(100), nullable=True, default=None
    )
    error_type: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(String(500), nullable=False)
    raw_payload: Mapped[dict | None] = mapped_column(JSON, nullable=True, default=None)

    sync_run: Mapped[SyncRun] = relationship("SyncRun", back_populates="errors")
