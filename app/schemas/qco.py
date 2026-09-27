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

    model_config = {"from_attributes": True}
