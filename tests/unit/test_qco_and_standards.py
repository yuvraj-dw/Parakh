from __future__ import annotations

from datetime import date, timedelta
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from app.models.base import Base
from app.models.standard import (
    Standard,
    StandardVersion,
    StandardRelationship,
    StandardStatus,
    StandardRelationshipType,
)
from app.models.qco import QCO, QCOStatus
from app.models.certification import CertificationScheme
from app.models.product import Product, ProductStandardMapping
from app.services.qco_service import compute_qco_status


# ==============================================================================
# 1. Deterministic QCO Status Business Logic Tests
# ==============================================================================

def test_qco_status_active():
    past = date.today() - timedelta(days=30)
    status = compute_qco_status(effective_date=past)
    assert status == QCOStatus.ACTIVE


def test_qco_status_active_today():
    today = date.today()
    status = compute_qco_status(effective_date=today)
    assert status == QCOStatus.ACTIVE


def test_qco_status_upcoming():
    future = date.today() + timedelta(days=30)
    status = compute_qco_status(effective_date=future)
    assert status == QCOStatus.UPCOMING


def test_qco_status_superseded():
    past = date.today() - timedelta(days=30)
    status = compute_qco_status(effective_date=past, is_superseded=True)
    assert status == QCOStatus.SUPERSEDED


def test_qco_status_superseded_overrides_withdrawn():
    past = date.today() - timedelta(days=30)
    status = compute_qco_status(effective_date=past, is_superseded=True, is_withdrawn=True)
    assert status == QCOStatus.SUPERSEDED


def test_qco_status_expired_when_withdrawn():
    past = date.today() - timedelta(days=30)
    status = compute_qco_status(effective_date=past, is_withdrawn=True)
    assert status == QCOStatus.EXPIRED


def test_qco_status_unknown_when_no_effective_date():
    status = compute_qco_status(effective_date=None)
    assert status == QCOStatus.UNKNOWN


def test_qco_status_with_injected_today():
    reference_today = date(2026, 9, 27)
    effective_future = date(2026, 12, 1)
    effective_past = date(2025, 1, 1)

    assert (
        compute_qco_status(effective_date=effective_future, today=reference_today)
        == QCOStatus.UPCOMING
    )
    assert (
        compute_qco_status(effective_date=effective_past, today=reference_today)
        == QCOStatus.ACTIVE
    )


# ==============================================================================
# 2. Standard and Standard Versions Model Tests
# ==============================================================================

def test_standard_model_instantiation():
    standard = Standard(
        is_number="IS 17803",
        title="Automotive safety glazing materials",
        year=2022,
        status=StandardStatus.ACTIVE,
        scope="Safety glazing specification for road vehicles",
    )
    assert standard.is_number == "IS 17803"
    assert standard.title == "Automotive safety glazing materials"
    assert standard.year == 2022
    assert standard.status == StandardStatus.ACTIVE
    assert standard.scope == "Safety glazing specification for road vehicles"
    assert standard.id is not None
    assert standard.source_name == "MANUAL"
    assert standard.source_type == "PUBLIC_RECORD"


def test_standard_version_and_relationships_enums():
    version = StandardVersion(
        standard_id="test-std-id",
        version_number="Rev. 3",
        revision_year=2022,
        amendment_number="Amd 1",
        status="ACTIVE",
        publication_date="2022-05-10",
    )
    assert version.standard_id == "test-std-id"
    assert version.version_number == "Rev. 3"
    assert version.id is not None

    rel = StandardRelationship(
        source_standard_id="source-id",
        target_standard_id="target-id",
        relationship_type=StandardRelationshipType.SUPERSEDES,
    )
    assert rel.relationship_type == StandardRelationshipType.SUPERSEDES
    assert rel.source_standard_id == "source-id"
    assert rel.target_standard_id == "target-id"


# ==============================================================================
# 3. QCO Model Tests
# ==============================================================================

def test_qco_model_instantiation():
    qco = QCO(
        qco_number="S.O. 1234(E)",
        title="Automotive Glazing Quality Control Order 2023",
        product_name="Safety Glass",
        is_number="IS 17803",
        ministry="Ministry of Heavy Industries",
        notification_number="1234",
        notification_date=date(2023, 3, 1),
        effective_date=date(2023, 9, 1),
        status=QCOStatus.ACTIVE,
    )
    assert qco.qco_number == "S.O. 1234(E)"
    assert qco.product_name == "Safety Glass"
    assert qco.is_number == "IS 17803"
    assert qco.ministry == "Ministry of Heavy Industries"
    assert qco.status == QCOStatus.ACTIVE
    assert qco.is_superseded is False
    assert qco.is_withdrawn is False
    assert qco.id is not None


# ==============================================================================
# 4. Certification Scheme Tests
# ==============================================================================

def test_certification_scheme_model():
    scheme = CertificationScheme(
        scheme_code="Scheme-I",
        name="Standard Mark / ISI Scheme",
        description="Product certification scheme for conformity to Indian Standards",
        application_procedure="Submit Form-I with factory audit and sample testing",
    )
    assert scheme.scheme_code == "Scheme-I"
    assert scheme.name == "Standard Mark / ISI Scheme"
    assert scheme.description is not None
    assert scheme.id is not None


# ==============================================================================
# 5. Product & ProductStandardMapping Tests
# ==============================================================================

def test_product_and_mapping_model():
    product = Product(
        name="Laminated Safety Glass",
        description="Windshields and side glasses",
        category="Automotive Components",
        industry="Automotive",
        hs_code="7007.21",
    )
    assert product.name == "Laminated Safety Glass"
    assert product.hs_code == "7007.21"
    assert product.id is not None

    mapping = ProductStandardMapping(
        product_id=product.id,
        standard_id="std-123",
        qco_id="qco-456",
        is_mandatory=True,
        notes="Mandatory under MHI QCO 2023",
    )
    assert mapping.product_id == product.id
    assert mapping.standard_id == "std-123"
    assert mapping.qco_id == "qco-456"
    assert mapping.is_mandatory is True
    assert mapping.id is not None


# ==============================================================================
# 6. Database Schema and Persistence Integration Test
# ==============================================================================

@pytest.mark.asyncio
async def test_standards_qco_persistence_in_sqlite():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    session_maker = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with session_maker() as session:
        standard = Standard(
            is_number="IS 15820",
            title="General Requirements for Competence of AHC",
            year=2009,
            status=StandardStatus.ACTIVE,
        )
        session.add(standard)
        await session.flush()

        version = StandardVersion(
            standard_id=standard.id,
            version_number="1.0",
            revision_year=2009,
            status="ACTIVE",
        )
        session.add(version)

        qco = QCO(
            title="Hallmarking Order 2020",
            product_name="Gold Jewellery",
            is_number="IS 1417",
            ministry="Ministry of Consumer Affairs",
            effective_date=date(2021, 6, 16),
            status=QCOStatus.ACTIVE,
        )
        session.add(qco)

        product = Product(
            name="22 Karat Gold Jewellery",
            category="Jewellery",
        )
        session.add(product)
        await session.flush()

        mapping = ProductStandardMapping(
            product_id=product.id,
            standard_id=standard.id,
            qco_id=qco.id,
            is_mandatory=True,
        )
        session.add(mapping)
        await session.commit()

        # Query back
        res_std = await session.execute(select(Standard).where(Standard.is_number == "IS 15820"))
        fetched_std = res_std.scalar_one_or_none()
        assert fetched_std is not None
        assert fetched_std.title == "General Requirements for Competence of AHC"

        res_mapping = await session.execute(
            select(ProductStandardMapping).where(ProductStandardMapping.product_id == product.id)
        )
        fetched_mapping = res_mapping.scalar_one_or_none()
        assert fetched_mapping is not None
        assert fetched_mapping.is_mandatory is True
        assert fetched_mapping.qco_id == qco.id

    await engine.dispose()


# ==============================================================================
# 7. Model Re-export Check
# ==============================================================================

def test_models_init_exports():
    import app.models as models

    assert hasattr(models, "Standard")
    assert hasattr(models, "StandardVersion")
    assert hasattr(models, "StandardRelationship")
    assert hasattr(models, "StandardStatus")
    assert hasattr(models, "StandardRelationshipType")
    assert hasattr(models, "QCO")
    assert hasattr(models, "QCOStatus")
    assert hasattr(models, "CertificationScheme")
    assert hasattr(models, "Product")
    assert hasattr(models, "ProductStandardMapping")
