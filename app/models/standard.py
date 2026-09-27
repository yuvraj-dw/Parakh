from __future__ import annotations

import enum
import uuid
from typing import List, Optional
from sqlalchemy import Enum, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, ProvenanceMixin, TimestampMixin


class StandardStatus(str, enum.Enum):
    ACTIVE = "ACTIVE"
    WITHDRAWN = "WITHDRAWN"
    SUPERSEDED = "SUPERSEDED"
    UNDER_REVIEW = "UNDER_REVIEW"


class StandardRelationshipType(str, enum.Enum):
    SUPERSEDES = "SUPERSEDES"
    AMENDS = "AMENDS"
    REFERENCES = "REFERENCES"
    EQUIVALENT_TO = "EQUIVALENT_TO"


class Standard(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "standards"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    is_number: Mapped[str] = mapped_column(
        String(50), unique=True, index=True, nullable=False
    )
    title: Mapped[str] = mapped_column(String(500), nullable=False)
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    status: Mapped[StandardStatus] = mapped_column(
        Enum(StandardStatus), default=StandardStatus.ACTIVE, nullable=False
    )
    scope: Mapped[str | None] = mapped_column(Text, nullable=True)

    versions: Mapped[List[StandardVersion]] = relationship(
        "StandardVersion", back_populates="standard", cascade="all, delete-orphan"
    )


class StandardVersion(Base, TimestampMixin):
    __tablename__ = "standard_versions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    standard_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False
    )
    version_number: Mapped[str] = mapped_column(String(50), nullable=False)
    revision_year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    amendment_number: Mapped[str | None] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="ACTIVE")
    publication_date: Mapped[str | None] = mapped_column(String(20), nullable=True)

    standard: Mapped[Standard] = relationship("Standard", back_populates="versions")


class StandardRelationship(Base, TimestampMixin):
    __tablename__ = "standard_relationships"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    source_standard_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False
    )
    target_standard_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False
    )
    relationship_type: Mapped[StandardRelationshipType] = mapped_column(
        Enum(StandardRelationshipType), nullable=False
    )
