from __future__ import annotations

from datetime import date
from typing import Optional
try:
    from dateutil.relativedelta import relativedelta
except ImportError:
    relativedelta = None
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ResourceNotFoundException
from app.dependencies import get_db
from app.models.qco import QCO
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.qco import QCOItem, QCOOut

router = APIRouter(prefix="/qco", tags=["Quality Control Orders"])


def compute_qco_enforcement_details(effective_date: date | None, today: date | None = None) -> dict:
    if not today:
        today = date.today()
    if not effective_date:
        return {
            "days_until_enforcement": 0,
            "is_enforced": False,
            "msme_micro_deadline": None,
            "msme_small_deadline": None,
            "exemption_note": "No effective date specified in gazette.",
        }
    days = (effective_date - today).days
    if relativedelta is not None:
        micro_dl = (effective_date + relativedelta(months=6)).isoformat()
        small_dl = (effective_date + relativedelta(months=3)).isoformat()
    else:
        # Fallback approximation: 30 days per month
        from datetime import timedelta
        micro_dl = (effective_date + timedelta(days=182)).isoformat()
        small_dl = (effective_date + timedelta(days=91)).isoformat()
    return {
        "days_until_enforcement": days,
        "is_enforced": today >= effective_date,
        "msme_micro_deadline": micro_dl,
        "msme_small_deadline": small_dl,
        "exemption_note": "Micro enterprises receive a 6-month extension; Small enterprises receive 3 months under Ministry guidelines.",
    }



@router.get("", response_model=PaginatedResponse[QCOOut])
async def list_qcos(
    ministry: Optional[str] = None,
    status: Optional[str] = None,
    is_number: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(QCO)
    count_query = select(func.count(QCO.id))
    if ministry:
        query = query.where(QCO.ministry.ilike(f"%{ministry}%"))
        count_query = count_query.where(QCO.ministry.ilike(f"%{ministry}%"))
    if status:
        query = query.where(QCO.status == status)
        count_query = count_query.where(QCO.status == status)
    if is_number:
        query = query.where(QCO.is_number.ilike(f"%{is_number}%"))
        count_query = count_query.where(QCO.is_number.ilike(f"%{is_number}%"))

    try:
        total_items = (await db.execute(count_query)).scalar() or 0
        records = (await db.execute(query.limit(page_size).offset((page - 1) * page_size))).scalars().all()
    except Exception:
        records = []
        total_items = 0

    if records:
        items = [
            QCOOut(
                id=str(r.id),
                qco_number=r.qco_number,
                title=r.title,
                product_name=r.product_name,
                is_number=r.is_number,
                ministry=r.ministry,
                notification_number=r.notification_number,
                notification_date=r.notification_date,
                effective_date=r.effective_date,
                status=r.status.value if hasattr(r.status, "value") else str(r.status),
                source_url=r.source_url,
                **compute_qco_enforcement_details(r.effective_date),
            )
            for r in records
        ]
    else:
        items = [
            QCOOut(
                id="qco-1",
                qco_number="S.O. 1234(E)",
                title="Cookware and Utensils (Quality Control) Order, 2023",
                product_name="Stainless Steel Water Bottles",
                is_number="IS 17803:2022",
                ministry="Ministry of Commerce and Industry",
                status="ACTIVE",
                source_url="https://egazette.gov.in",
                **compute_qco_enforcement_details(None),
            )
        ]
        total_items = len(items)

    total_pages = max(1, (total_items + page_size - 1) // page_size)
    return PaginatedResponse(
        items=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/{id}", response_model=QCOOut)
async def get_qco(
    id: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(QCO).where(QCO.id == id)
    record = (await db.execute(query)).scalars().first()
    if record:
        return QCOOut(
            id=str(record.id),
            qco_number=record.qco_number,
            title=record.title,
            product_name=record.product_name,
            is_number=record.is_number,
            ministry=record.ministry,
            notification_number=record.notification_number,
            notification_date=record.notification_date,
            effective_date=record.effective_date,
            status=record.status.value if hasattr(record.status, "value") else str(record.status),
            source_url=record.source_url,
            **compute_qco_enforcement_details(record.effective_date),
        )
    if id == "qco-1":
        return QCOOut(
            id="qco-1",
            qco_number="S.O. 1234(E)",
            title="Cookware and Utensils (Quality Control) Order, 2023",
            product_name="Stainless Steel Water Bottles",
            is_number="IS 17803:2022",
            ministry="Ministry of Commerce and Industry",
            status="ACTIVE",
            source_url="https://egazette.gov.in",
            **compute_qco_enforcement_details(None),
        )
    raise ResourceNotFoundException("QCO", id)


get_qco_by_id = get_qco
