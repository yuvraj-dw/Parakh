from __future__ import annotations

from datetime import date
from typing import Optional
from pydantic import BaseModel


class QCOOut(BaseModel):
    id: str
    qco_number: Optional[str] = None
    title: str
    product_name: str
    is_number: str
    ministry: str
    notification_number: Optional[str] = None
    notification_date: Optional[date] = None
    effective_date: Optional[date] = None
    status: str
    source_url: Optional[str] = None
    days_until_enforcement: int = 0
    is_enforced: bool = False
    msme_micro_deadline: Optional[str] = None
    msme_small_deadline: Optional[str] = None
    exemption_note: Optional[str] = None

    model_config = {"from_attributes": True}


QCOItem = QCOOut

