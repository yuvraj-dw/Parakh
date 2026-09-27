from __future__ import annotations

import uuid
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, ProvenanceMixin, TimestampMixin


class CertificationScheme(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "certification_schemes"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    scheme_code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    application_procedure: Mapped[str | None] = mapped_column(Text, nullable=True)
