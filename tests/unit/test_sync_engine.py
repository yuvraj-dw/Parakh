from __future__ import annotations

import pytest
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy import select

from app.models.base import Base
from app.models.sync import SyncStatus, SyncRun, SyncError
from app.models.standard import Standard, StandardStatus
from app.models.laboratory import Laboratory, LabStatus
from app.services.sync_service import SyncService, SyncResult
from app.workers.sync_runner import run_in_background_sync
import app.models as models


@asynccontextmanager
async def create_test_session():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


@pytest.mark.asyncio
async def test_sync_dataset_standards_dry_run():
    sample_records = [
        {
            "is_number": "is 17803:2022",
            "title": "Stainless Steel Flasks",
            "year": 2022,
            "source_url": "https://bis.gov.in",
        }
    ]
    sync_service = SyncService()
    result = await sync_service.sync_dataset(
        dataset_name="standards",
        raw_records=sample_records,
        db_session=None,
    )
    assert result.status == SyncStatus.SUCCESS
    assert result.records_seen == 1
    assert result.records_created == 1
    assert result.records_updated == 0
    assert result.errors == 0


@pytest.mark.asyncio
async def test_sync_dataset_standards_db_upsert():
    async with create_test_session() as db_session:
        sync_service = SyncService()

        # Initial sync: 2 standards
        records_batch_1 = [
            {
                "is_number": "is 17803:2022",
                "title": "Stainless Steel Flasks",
                "year": 2022,
                "source_url": "https://bis.gov.in/std/17803",
            },
            {
                "is_number": "is 15820:2009",
                "title": "General Requirements for Assaying and Hallmarking Centres",
                "year": 2009,
                "source_url": "https://bis.gov.in/std/15820",
            },
        ]

        res1 = await sync_service.sync_dataset(
            dataset_name="standards",
            raw_records=records_batch_1,
            db_session=db_session,
        )
        assert res1.status == SyncStatus.SUCCESS
        assert res1.records_seen == 2
        assert res1.records_created == 2
        assert res1.records_updated == 0
        assert res1.errors == 0

        # Verify records stored and normalized
        std1 = (
            await db_session.execute(select(Standard).where(Standard.is_number == "IS 17803:2022"))
        ).scalar_one_or_none()
        assert std1 is not None
        assert std1.title == "Stainless Steel Flasks"
        assert std1.last_verified_at is not None

        # Second sync: update std1 with a new title, and add std3
        records_batch_2 = [
            {
                "is_number": "IS 17803:2022",
                "title": "Stainless Steel Flasks - Revised Specification",
                "year": 2022,
                "source_url": "https://bis.gov.in/std/17803",
            },
            {
                "is_number": "IS 1293:2019",
                "title": "Plugs and Socket-Outlets",
                "year": 2019,
                "source_url": "https://bis.gov.in/std/1293",
            },
        ]

        res2 = await sync_service.sync_dataset(
            dataset_name="standards",
            raw_records=records_batch_2,
            db_session=db_session,
        )
        assert res2.status == SyncStatus.SUCCESS
        assert res2.records_seen == 2
        assert res2.records_created == 1
        assert res2.records_updated == 1
        assert res2.errors == 0

        # Verify update persisted
        await db_session.refresh(std1)
        assert std1.title == "Stainless Steel Flasks - Revised Specification"

        # Verify audit sync_runs created
        runs = (await db_session.execute(select(SyncRun))).scalars().all()
        assert len(runs) == 2
        assert runs[0].status == SyncStatus.SUCCESS
        assert runs[1].status == SyncStatus.SUCCESS


@pytest.mark.asyncio
async def test_sync_dataset_partial_failure():
    async with create_test_session() as db_session:
        sync_service = SyncService()
        records = [
            {
                "is_number": "IS 10001",
                "title": "Valid Standard Record",
                "year": 2020,
            },
            {
                # Missing mandatory 'is_number' field
                "title": "Invalid Record With No IS Number",
            },
        ]

        result = await sync_service.sync_dataset(
            dataset_name="standards",
            raw_records=records,
            db_session=db_session,
        )

        assert result.status == SyncStatus.PARTIAL
        assert result.records_seen == 2
        assert result.records_created == 1
        assert result.errors == 1

        # Verify SyncError logged
        errors = (await db_session.execute(select(SyncError))).scalars().all()
        assert len(errors) == 1
        assert errors[0].error_type == "VALIDATION_ERROR"
        assert "is_number" in errors[0].message


@pytest.mark.asyncio
async def test_sync_dataset_all_failed():
    async with create_test_session() as db_session:
        sync_service = SyncService()
        records = [
            {"title": "Missing IS Number 1"},
            {"title": "Missing IS Number 2"},
        ]

        result = await sync_service.sync_dataset(
            dataset_name="standards",
            raw_records=records,
            db_session=db_session,
        )

        assert result.status == SyncStatus.FAILED
        assert result.records_seen == 2
        assert result.records_created == 0
        assert result.errors == 2

        # Verify SyncRun status
        runs = (await db_session.execute(select(SyncRun))).scalars().all()
        assert len(runs) == 1
        assert runs[0].status == SyncStatus.FAILED


@pytest.mark.asyncio
async def test_sync_laboratories_normalization():
    async with create_test_session() as db_session:
        sync_service = SyncService()
        records = [
            {
                "recognition_code": "LAB-MP-001",
                "name": "Central Testing Lab",
                "city": "Bhopal",
                "state": "m.p.",  # Should normalize to Madhya Pradesh
            }
        ]

        res = await sync_service.sync_dataset(
            dataset_name="laboratories",
            raw_records=records,
            db_session=db_session,
        )
        assert res.status == SyncStatus.SUCCESS
        assert res.records_created == 1

        lab = (
            await db_session.execute(select(Laboratory).where(Laboratory.recognition_code == "LAB-MP-001"))
        ).scalar_one_or_none()
        assert lab is not None
        assert lab.state == "Madhya Pradesh"
        assert lab.name == "Central Testing Lab"


@pytest.mark.asyncio
async def test_run_in_background_sync():
    async with create_test_session() as db_session:
        # Verify in-process runner works with session
        res = await run_in_background_sync("standards", db_session=db_session)
        assert res.status == SyncStatus.SUCCESS
        assert res.records_seen > 0

        # Also test default runner without db_session parameter (dry-run mode)
        res2 = await run_in_background_sync("standards")
        assert res2.status == SyncStatus.SUCCESS


def test_models_reexport_sync():
    assert hasattr(models, "SyncStatus")
    assert hasattr(models, "SyncRun")
    assert hasattr(models, "SyncError")
    assert "SyncStatus" in models.__all__
    assert "SyncRun" in models.__all__
    assert "SyncError" in models.__all__
