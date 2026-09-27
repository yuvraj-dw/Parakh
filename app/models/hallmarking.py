from __future__ import annotations

import enum
import uuid
from datetime import date
from typing import Optional
from sqlalchemy import Date, Enum, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, ProvenanceMixin, TimestampMixin


class CentreStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    SUSPENDED = "SUSPENDED"
    SURRENDERED = "SURRENDERED"


class JewellerStatus(str, enum.Enum):
    VALID = "VALID"
    CANCELLED = "CANCELLED"
    EXPIRED = "EXPIRED"


class AHCCentre(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "ahc_centres"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    recognition_number: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    district: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    status: Mapped[CentreStatus] = mapped_column(
        Enum(CentreStatus), default=CentreStatus.ACTIVE, nullable=False
    )
    valid_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
    metal_capabilities: Mapped[list | None] = mapped_column(JSON, default=list)


class Jeweller(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "jewellers"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    registration_number: Mapped[str] = mapped_column(
        String(100), unique=True, index=True, nullable=False
    )
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str | None] = mapped_column(Text, nullable=True)
    city: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    district: Mapped[str | None] = mapped_column(String(100), index=True, nullable=True)
    state: Mapped[str] = mapped_column(String(100), index=True, nullable=False)
    pincode: Mapped[str | None] = mapped_column(String(20), nullable=True)
    metal_category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    status: Mapped[JewellerStatus] = mapped_column(
        Enum(JewellerStatus), default=JewellerStatus.VALID, nullable=False
    )
    valid_from: Mapped[date | None] = mapped_column(Date, nullable=True)
    valid_until: Mapped[date | None] = mapped_column(Date, nullable=True)
