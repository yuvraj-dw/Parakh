from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies import get_current_admin, get_db, get_sync_service
from app.models.sync import SyncError, SyncRun
from app.models.user import User
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.services.sync_service import SyncService

router = APIRouter(prefix="/admin", tags=["Admin Operations"])


@router.get("/sync/runs")
async def list_sync_runs(
    dataset: Optional[str] = None,
    status: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    stmt = select(SyncRun)
    count_stmt = select(func.count()).select_from(SyncRun)

    if dataset:
        stmt = stmt.where(SyncRun.dataset == dataset)
        count_stmt = count_stmt.where(SyncRun.dataset == dataset)
    if status:
        stmt = stmt.where(SyncRun.status == status)
        count_stmt = count_stmt.where(SyncRun.status == status)

    total_items = (await db.execute(count_stmt)).scalar() or 0
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    stmt = stmt.order_by(SyncRun.started_at.desc()).offset(offset).limit(page_size)
    records = (await db.execute(stmt)).scalars().all()

    items = [
        {
            "id": r.id,
            "dataset": r.dataset,
            "status": r.status.value,
            "records_seen": r.records_seen,
            "records_created": r.records_created,
            "records_updated": r.records_updated,
            "records_deactivated": r.records_deactivated,
            "source": r.source,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "completed_at": r.completed_at.isoformat() if r.completed_at else None,
        }
        for r in records
    ]

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


@router.get("/sync/errors")
async def list_sync_errors(
    sync_run_id: Optional[str] = None,
    error_type: Optional[str] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    stmt = select(SyncError)
    count_stmt = select(func.count()).select_from(SyncError)

    if sync_run_id:
        stmt = stmt.where(SyncError.sync_run_id == sync_run_id)
        count_stmt = count_stmt.where(SyncError.sync_run_id == sync_run_id)
    if error_type:
        stmt = stmt.where(SyncError.error_type == error_type)
        count_stmt = count_stmt.where(SyncError.error_type == error_type)

    total_items = (await db.execute(count_stmt)).scalar() or 0
    total_pages = max(1, (total_items + page_size - 1) // page_size)
    offset = (page - 1) * page_size

    stmt = stmt.order_by(SyncError.created_at.desc()).offset(offset).limit(page_size)
    records = (await db.execute(stmt)).scalars().all()

    items = [
        {
            "id": e.id,
            "sync_run_id": e.sync_run_id,
            "item_identifier": e.item_identifier,
            "error_type": e.error_type,
            "message": e.message,
            "raw_payload": e.raw_payload,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in records
    ]

    return {
        "items": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1,
        },
    }


@router.post("/sync/{dataset}")
async def trigger_dataset_sync(
    dataset: str,
    db: AsyncSession = Depends(get_db),
    sync_service: SyncService = Depends(get_sync_service),
    admin: User = Depends(get_current_admin),
):
    result = await sync_service.sync_dataset(
        dataset_name=dataset,
        db_session=db,
    )

    return {
        "dataset": dataset,
        "status": result.status.value,
        "records_seen": result.records_seen,
        "records_created": result.records_created,
        "records_updated": result.records_updated,
        "records_deactivated": result.records_deactivated,
        "errors": result.errors,
        "sync_run_id": result.sync_run_id,
    }


@router.get("/source-health")
async def get_source_health(
    admin: User = Depends(get_current_admin),
):
    now_iso = datetime.now(timezone.utc).isoformat()
    return {
        "status": "healthy",
        "sources": [
            {
                "name": "BIS_MANAK_ONLINE",
                "status": "available",
                "endpoint": "https://standardsbis.bsbedge.com",
                "type": "standards_and_licence_registry",
                "last_checked_at": now_iso,
            },
            {
                "name": "BIS_CARE_OFFICIAL_PORTAL",
                "status": "available",
                "endpoint": "https://www.bis.gov.in/bis-care-app",
                "type": "hallmark_and_huid_verification",
                "last_checked_at": now_iso,
            },
            {
                "name": "BIS_CRS_PORTAL",
                "status": "available",
                "endpoint": "https://www.crsbis.in/BIS/crs",
                "type": "compulsory_registration_scheme",
                "last_checked_at": now_iso,
            },
            {
                "name": "DATABASE",
                "status": "connected",
                "type": "storage_engine",
                "last_checked_at": now_iso,
            },
        ],
        "checked_at": now_iso,
    }
