from __future__ import annotations

import logging
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.services.sync_service import SyncResult, SyncService

logger = logging.getLogger(__name__)


async def run_in_background_sync(
    dataset: str, db_session: Optional[AsyncSession] = None
) -> SyncResult:
    logger.info(f"Starting background synchronization for dataset: {dataset}")
    service = SyncService()
    sample_data = [
        {
            "is_number": "IS 17803:2022",
            "title": "Stainless Steel Cookware and Flasks",
            "year": 2022,
            "source_url": "https://bis.gov.in/standards/17803",
        }
    ]
    res = await service.sync_dataset(
        dataset_name=dataset, raw_records=sample_data, db_session=db_session
    )
    logger.info(f"Background sync complete for {dataset}: status={res.status}")
    return res
