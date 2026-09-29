from __future__ import annotations

import enum
import uuid
from datetime import date
from typing import List, Optional
from sqlalchemy import Date, Enum, Float, ForeignKey, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, ProvenanceMixin, TimestampMixin


class LabStatus(str, enum.Enum):
    RECOGNIZED = "RECOGNIZED"
    SUSPENDED = "SUSPENDED"
    EXPIRED = "EXPIRED"


class Laboratory(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "laboratories"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    recognition_code: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    district: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    contact_details: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    status: Mapped[LabStatus] = mapped_column(
        Enum(LabStatus), default=LabStatus.RECOGNIZED, nullable=False
    )
    valid_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)

    scopes: Mapped[List[LaboratoryScope]] = relationship(
        "LaboratoryScope", back_populates="laboratory", cascade="all, delete-orphan"
    )


class LaboratoryScope(Base, TimestampMixin):
    __tablename__ = "laboratory_scopes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    laboratory_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("laboratories.id", ondelete="CASCADE"), nullable=False
    )
    is_number: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    product_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    test_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    parameter: Mapped[str | None] = mapped_column(String(255), nullable=True)
    capability_details: Mapped[str | None] = mapped_column(Text, nullable=True)
    limit_of_detection: Mapped[str | None] = mapped_column(String(100), nullable=True)

    laboratory: Mapped[Laboratory] = relationship("Laboratory", back_populates="scopes")
