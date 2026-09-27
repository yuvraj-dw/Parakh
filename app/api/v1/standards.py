from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.standards import StandardOut

router = APIRouter(prefix="/standards", tags=["Standards"])


@router.get("", response_model=PaginatedResponse[StandardOut])
async def list_standards(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    items = [
        StandardOut(
            id="std-17803",
            is_number="IS 17803:2022",
            title="Stainless Steel Vacuum Insulated Flasks",
            year=2022,
            status="ACTIVE",
            scope="Applies to domestic and commercial water bottles",
            source_name="BIS_MANAK_ONLINE",
            source_url="https://standardsbis.bsbedge.com",
            last_verified_at="2026-09-27T00:00:00Z",
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
