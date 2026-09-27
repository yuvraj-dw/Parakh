from __future__ import annotations

import enum
import uuid
from datetime import date
from sqlalchemy import Boolean, Date, Enum, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, ProvenanceMixin, TimestampMixin


class QCOStatus(str, enum.Enum):
    UPCOMING = "UPCOMING"
    ACTIVE = "ACTIVE"
    EXPIRED = "EXPIRED"
    SUPERSEDED = "SUPERSEDED"
    UNKNOWN = "UNKNOWN"


class QCO(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "qcos"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    qco_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    product_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    is_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    ministry: Mapped[str] = mapped_column(String(255), nullable=False)
    notification_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    notification_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    effective_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[QCOStatus] = mapped_column(
        Enum(QCOStatus), default=QCOStatus.UNKNOWN, nullable=False
    )
    is_superseded: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    is_withdrawn: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
