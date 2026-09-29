from __future__ import annotations

import enum
import uuid
from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, TimestampMixin


class IncidentType(str, enum.Enum):
    COUNTERFEIT_ISI = "COUNTERFEIT_ISI"
    FAKE_HUID = "FAKE_HUID"
    UNCERTIFIED_PRODUCT = "UNCERTIFIED_PRODUCT"
    LAB_REPORT_FRAUD = "LAB_REPORT_FRAUD"


class GrievanceStatus(str, enum.Enum):
    LOGGED = "LOGGED"
    UNDER_REVIEW = "UNDER_REVIEW"
    DISMISSED = "DISMISSED"


class Grievance(Base, TimestampMixin):
    __tablename__ = "grievances"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    tracking_code: Mapped[str] = mapped_column(String(32), unique=True, index=True, nullable=False)
    incident_type: Mapped[IncidentType] = mapped_column(String(50), nullable=False)
    suspect_entity: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    evidence_text: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)
    status: Mapped[GrievanceStatus] = mapped_column(String(20), default=GrievanceStatus.LOGGED, nullable=False)
