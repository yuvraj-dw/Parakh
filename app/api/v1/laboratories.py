from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.laboratories import LaboratoryOut

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
    return PaginatedResponse(
        items=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=len(items),
            total_pages=1,
            has_next=False,
            has_prev=False,
        ),
    )
