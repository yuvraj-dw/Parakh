from __future__ import annotations

import re
import secrets
from datetime import datetime
from typing import Any, Optional

from fastapi import APIRouter, Depends
from pydantic import BaseModel, ConfigDict
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ResourceNotFoundException
from app.dependencies import get_db
from app.models.grievance import Grievance, GrievanceStatus, IncidentType

router = APIRouter(prefix="/grievances", tags=["Grievances & Whistleblower"])


def sanitize_whistleblower_text(text: str) -> str:
    if not text:
        return ""
    text = re.sub(r"[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+", "[REDACTED_EMAIL]", text)
    text = re.sub(r"(\+?91[\-\s]?)?[6-9]\d{9}", "[REDACTED_PHONE]", text)
    text = re.sub(r"\b(my name is|i am)\s+([A-Za-z]+)", r"\1 [REDACTED_NAME]", text, flags=re.I)
    return text


class WhistleblowerReportRequest(BaseModel):
    incident_type: IncidentType
    suspect_entity: str
    location: str
    description: str
    image_url: Optional[str] = None


class WhistleblowerReportResponse(BaseModel):
    tracking_code: str
    status: str
    incident_type: IncidentType
    message: str


class WhistleblowerDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    tracking_code: str
    incident_type: IncidentType
    suspect_entity: str
    location: str
    evidence_text: str
    image_url: Optional[str] = None
    status: GrievanceStatus
    created_at: Optional[Any] = None


@router.post("/whistleblower", response_model=WhistleblowerReportResponse)
async def submit_whistleblower_report(
    payload: WhistleblowerReportRequest,
    db: AsyncSession = Depends(get_db),
):
    sanitized_text = sanitize_whistleblower_text(payload.description)
    tracking_code = f"BIS-WH-{datetime.now().year}-{secrets.token_hex(3).upper()}"

    grievance = Grievance(
        tracking_code=tracking_code,
        incident_type=payload.incident_type,
        suspect_entity=payload.suspect_entity,
        location=payload.location,
        evidence_text=sanitized_text,
        image_url=payload.image_url,
        status=GrievanceStatus.LOGGED,
    )
    db.add(grievance)
    await db.commit()
    await db.refresh(grievance)

    return {
        "tracking_code": tracking_code,
        "status": "LOGGED",
        "incident_type": payload.incident_type,
        "message": (
            "Grievance securely recorded under Section 29 of the BIS Act, 2016. "
            "Personal identifiers have been scrubbed in compliance with the DPDP Act, 2023."
        ),
    }


@router.get("/whistleblower/{tracking_code}", response_model=WhistleblowerDetailResponse)
async def get_whistleblower_report(
    tracking_code: str,
    db: AsyncSession = Depends(get_db),
):
    stmt = select(Grievance).where(Grievance.tracking_code == tracking_code)
    result = await db.execute(stmt)
    grievance = result.scalar_one_or_none()
    if not grievance:
        raise ResourceNotFoundException("Grievance", tracking_code)

    return grievance
