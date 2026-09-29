from __future__ import annotations

import uuid
from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class KnowledgeGap(Base, TimestampMixin):
    __tablename__ = "knowledge_gaps"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    query_text: Mapped[str] = mapped_column(String(500), nullable=False, index=True)
    retrieval_score: Mapped[float] = mapped_column(Float, default=0.0)
    category: Mapped[str] = mapped_column(String(100), default="UNMATCHED_QUERY")
    frequency: Mapped[int] = mapped_column(Integer, default=1)
