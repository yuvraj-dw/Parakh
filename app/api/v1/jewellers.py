from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.hallmarking import JewellerOut

router = APIRouter(prefix="/jewellers", tags=["Licensed Jewellers"])


@router.get("", response_model=PaginatedResponse[JewellerOut])
async def list_jewellers(
    state: Optional[str] = None,
    city: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items = [
        JewellerOut(
            id="jwl-1",
            registration_number="JWL-MH-1002",
            name="Zaveri Jewellers Ltd",
            city=city or "Mumbai",
            state=state or "Maharashtra",
            metal_category="GOLD",
            status="VALID",
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
