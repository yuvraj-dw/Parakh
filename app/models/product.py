from __future__ import annotations

import uuid
from sqlalchemy import Boolean, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, ProvenanceMixin, TimestampMixin


class Product(Base, ProvenanceMixin, TimestampMixin):
    __tablename__ = "products"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(
        String(255), unique=True, index=True, nullable=False
    )
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    category: Mapped[str | None] = mapped_column(String(100), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    hs_code: Mapped[str | None] = mapped_column(String(50), nullable=True)


class ProductStandardMapping(Base, TimestampMixin):
    __tablename__ = "product_standard_mappings"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    product_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("products.id", ondelete="CASCADE"), nullable=False
    )
    standard_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("standards.id", ondelete="CASCADE"), nullable=False
    )
    qco_id: Mapped[str | None] = mapped_column(
        String(36), ForeignKey("qcos.id", ondelete="SET NULL"), nullable=True
    )
    is_mandatory: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
