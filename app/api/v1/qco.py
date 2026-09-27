from __future__ import annotations

from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.dependencies import get_db
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.qco import QCOOut

router = APIRouter(prefix="/qco", tags=["Quality Control Orders"])


@router.get("", response_model=PaginatedResponse[QCOOut])
async def list_qcos(
    ministry: Optional[str] = None,
    status: Optional[str] = None,
    is_number: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
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
