from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.hallmarking import AHCCentreOut

router = APIRouter(prefix="/hallmarking", tags=["Assaying & Hallmarking"])


@router.get("/centres", response_model=PaginatedResponse[AHCCentreOut])
async def list_ahc_centres(
    state: Optional[str] = None,
    city: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items = [
        AHCCentreOut(
            id="ahc-1",
            recognition_number="AHC-DL-001",
            name="Delhi Assaying & Hallmarking Centre",
            city=city or "New Delhi",
            state=state or "Delhi",
            status="ACTIVE",
            metal_capabilities=["GOLD", "SILVER"],
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
