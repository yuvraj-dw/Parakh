from __future__ import annotations

from datetime import date
from typing import Optional

from app.models.qco import QCOStatus


def compute_qco_status(
    effective_date: Optional[date],
    notification_date: Optional[date] = None,
    is_superseded: bool = False,
    is_withdrawn: bool = False,
    today: Optional[date] = None,
) -> QCOStatus:
    """
    Deterministically computes the status of a Quality Control Order (QCO).
    
    Status is strictly determined by dates and flags, NEVER by an LLM:
    - SUPERSEDED: When marked as superseded by an amendment or subsequent order.
    - EXPIRED: When withdrawn or cancelled.
    - UNKNOWN: When effective date is absent or unavailable.
    - UPCOMING: When effective date is strictly in the future compared to reference date.
    - ACTIVE: When effective date has been reached (effective_date <= reference date).
    """
    if is_superseded:
        return QCOStatus.SUPERSEDED
    if is_withdrawn:
        return QCOStatus.EXPIRED
    if not effective_date:
        return QCOStatus.UNKNOWN

    current_date = today or date.today()
    if effective_date > current_date:
        return QCOStatus.UPCOMING
    return QCOStatus.ACTIVE
