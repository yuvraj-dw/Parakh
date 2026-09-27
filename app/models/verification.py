from __future__ import annotations

import enum
import uuid
from typing import TYPE_CHECKING, Any, Dict, Optional
from sqlalchemy import Enum, ForeignKey, JSON, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User


class VerificationType(str, enum.Enum):
    HUID = "HUID"
    LICENCE = "LICENCE"
    CRS_R_NUMBER = "CRS_R_NUMBER"


class VerificationStatus(str, enum.Enum):
    UNKNOWN = "UNKNOWN"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    NOT_VERIFIED = "NOT_VERIFIED"
    NOT_FOUND = "NOT_FOUND"
    EXPIRED = "EXPIRED"
    ERROR = "ERROR"


class VerificationRequest(Base, TimestampMixin):
    __tablename__ = "verification_requests"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    request_type: Mapped[VerificationType] = mapped_column(
        Enum(VerificationType), nullable=False
    )
    identifier: Mapped[str] = mapped_column(
        String(100), index=True, nullable=False
    )
    user_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    status: Mapped[VerificationStatus] = mapped_column(
        Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False
    )
    provider_name: Mapped[str] = mapped_column(
        String(100), default="MOCK", nullable=False
    )

    result: Mapped[Optional[VerificationResult]] = relationship(
        "VerificationResult",
        back_populates="request",
        uselist=False,
        cascade="all, delete-orphan",
    )


class VerificationResult(Base, TimestampMixin):
    __tablename__ = "verification_results"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    request_id: Mapped[str] = mapped_column(
        String(36),
        ForeignKey("verification_requests.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    raw_response: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    normalized_data: Mapped[Dict[str, Any] | None] = mapped_column(JSON, nullable=True)
    verified_at: Mapped[str | None] = mapped_column(String(50), nullable=True)
    source_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    notes: Mapped[str | None] = mapped_column(String(500), nullable=True)

    request: Mapped[VerificationRequest] = relationship(
        "VerificationRequest", back_populates="result"
    )
