from __future__ import annotations

import os
from pathlib import Path
import pytest
from httpx import AsyncClient, ASGITransport
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.main import app
from app.models.base import Base
from app.models.standard import Standard, StandardStatus
from app.models.qco import QCO, QCOStatus
from app.models.laboratory import Laboratory, LabStatus
from app.models.hallmarking import AHCCentre, Jeweller, CentreStatus, JewellerStatus

# Import seed function from scripts (will fail initially in RED phase)
from scripts.seed_data import seed


@pytest.mark.asyncio
async def test_health_check_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "app" in data
        assert "version" in data


@pytest.mark.asyncio
async def test_seed_data_execution_in_sqlite():
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    test_session_maker = async_sessionmaker(
        test_engine, class_=AsyncSession, expire_on_commit=False
    )

    # 1. First seed execution
    await seed(session_factory=test_session_maker)

    async with test_session_maker() as session:
        # Verify Standard
        stmt_std = select(Standard).where(Standard.is_number == "IS 17803:2022")
        std = (await session.execute(stmt_std)).scalar_one_or_none()
        assert std is not None
        assert std.status == StandardStatus.ACTIVE
        assert "Vacuum Insulated" in std.title

        # Verify QCO
        stmt_qco = select(QCO).where(QCO.qco_number == "S.O. 1234(E)")
        qco = (await session.execute(stmt_qco)).scalar_one_or_none()
        assert qco is not None
        assert qco.status == QCOStatus.ACTIVE
        assert qco.is_number == "IS 17803:2022"

        # Verify Laboratory
        stmt_lab = select(Laboratory).where(Laboratory.recognition_code == "BIS-LAB-DEL-01")
        lab = (await session.execute(stmt_lab)).scalar_one_or_none()
        assert lab is not None
        assert lab.status == LabStatus.RECOGNIZED
        assert lab.state == "Delhi"

        # Verify AHC Centre
        stmt_ahc = select(AHCCentre).where(AHCCentre.recognition_number == "AHC-DL-001")
        ahc = (await session.execute(stmt_ahc)).scalar_one_or_none()
        assert ahc is not None
        assert ahc.status == CentreStatus.ACTIVE

        # Verify Jeweller
        stmt_jwl = select(Jeweller).where(Jeweller.registration_number == "JWL-MH-1002")
        jwl = (await session.execute(stmt_jwl)).scalar_one_or_none()
        assert jwl is not None
        assert jwl.status == JewellerStatus.VALID

    # 2. Idempotency check: re-running seed should succeed without duplicate key errors
    await seed(session_factory=test_session_maker)

    await test_engine.dispose()


def test_schema_sanity():
    expected_tables = {
        "users",
        "standards",
        "standard_versions",
        "standard_relationships",
        "qcos",
        "certification_schemes",
        "products",
        "product_standard_mappings",
        "laboratories",
        "laboratory_scopes",
        "ahc_centres",
        "jewellers",
        "verification_requests",
        "verification_results",
        "sync_runs",
        "sync_errors",
        "conversations",
        "messages",
    }
    actual_tables = set(Base.metadata.tables.keys())
    missing_tables = expected_tables - actual_tables
    assert not missing_tables, f"Missing expected tables in metadata: {missing_tables}"


def test_infra_files_exist_and_valid():
    repo_root = Path(__file__).resolve().parent.parent.parent

    # Alembic files
    alembic_ini = repo_root / "alembic.ini"
    assert alembic_ini.exists(), "alembic.ini must exist"
    ini_content = alembic_ini.read_text(encoding="utf-8")
    assert "[alembic]" in ini_content
    assert "script_location = migrations" in ini_content

    env_py = repo_root / "migrations" / "env.py"
    assert env_py.exists(), "migrations/env.py must exist"

    script_mako = repo_root / "migrations" / "script.py.mako"
    assert script_mako.exists(), "migrations/script.py.mako must exist"

    migration_001 = repo_root / "migrations" / "versions" / "001_initial_schema.py"
    assert migration_001.exists(), "001_initial_schema.py must exist"
    migration_content = migration_001.read_text(encoding="utf-8")
    assert "def upgrade()" in migration_content
    assert "def downgrade()" in migration_content

    # Docker files
    dockerfile = repo_root / "Dockerfile"
    assert dockerfile.exists(), "Dockerfile must exist"
    df_content = dockerfile.read_text(encoding="utf-8")
    assert "FROM " in df_content
    assert "CMD " in df_content

    compose = repo_root / "docker-compose.yml"
    assert compose.exists(), "docker-compose.yml must exist"
    compose_content = compose.read_text(encoding="utf-8")
    assert "postgres:" in compose_content
    assert "backend:" in compose_content

    # README
    readme = repo_root / "README.md"
    assert readme.exists(), "README.md must exist"
    readme_content = readme.read_text(encoding="utf-8")
    assert "Quickstart" in readme_content or "docker compose" in readme_content.lower()
