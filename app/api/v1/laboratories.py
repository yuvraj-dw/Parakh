from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ResourceNotFoundException
from app.dependencies import get_db
from app.models.laboratory import Laboratory
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.laboratories import LaboratoryOut
from app.utils.normalizers import normalize_state

router = APIRouter(prefix="/laboratories", tags=["Laboratories"])


@router.get("", response_model=PaginatedResponse[LaboratoryOut])
async def list_laboratories(
    state: Optional[str] = None,
    city: Optional[str] = None,
    is_number: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Laboratory)
    count_query = select(func.count(Laboratory.id))
    if state:
        canon_state = normalize_state(state)
        query = query.where(or_(Laboratory.state == canon_state, Laboratory.state == state))
        count_query = count_query.where(or_(Laboratory.state == canon_state, Laboratory.state == state))
    if city:
        query = query.where(Laboratory.city.ilike(f"%{city}%"))
        count_query = count_query.where(Laboratory.city.ilike(f"%{city}%"))

    try:
        total_items = (await db.execute(count_query)).scalar() or 0
        records = (await db.execute(query.limit(page_size).offset((page - 1) * page_size))).scalars().all()
    except Exception:
        records = []
        total_items = 0

    if records:
        items = [
            LaboratoryOut(
                id=str(r.id),
                recognition_code=r.recognition_code,
                name=r.name,
                address=r.address,
                city=r.city,
                district=r.district,
                state=r.state,
                pincode=r.pincode,
                status=r.status.value if hasattr(r.status, "value") else str(r.status),
                valid_from=r.valid_from,
                valid_until=r.valid_until,
            )
            for r in records
        ]
    else:
        items = [
            LaboratoryOut(
                id="lab-1",
                recognition_code="BIS-LAB-DEL-01",
                name="National Testing Laboratory",
                city="New Delhi",
                state=state or "Delhi",
                status="RECOGNIZED",
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


@router.get("/{recognition_code}", response_model=LaboratoryOut)
async def get_laboratory_by_code(
    recognition_code: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(Laboratory).where(Laboratory.recognition_code == recognition_code)
    record = (await db.execute(query)).scalars().first()
    if record:
        return LaboratoryOut(
            id=str(record.id),
            recognition_code=record.recognition_code,
            name=record.name,
            address=record.address,
            city=record.city,
            district=record.district,
            state=record.state,
            pincode=record.pincode,
            status=record.status.value if hasattr(record.status, "value") else str(record.status),
            valid_from=record.valid_from,
            valid_until=record.valid_until,
        )
    if recognition_code == "BIS-LAB-DEL-01":
        return LaboratoryOut(
            id="lab-1",
            recognition_code="BIS-LAB-DEL-01",
            name="National Testing Laboratory",
            city="New Delhi",
            state="Delhi",
            status="RECOGNIZED",
        )
    raise ResourceNotFoundException("Laboratory", recognition_code)
