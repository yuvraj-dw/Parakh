from __future__ import annotations

import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.models.base import Base
from app.models.user import User, UserRole
from app.models.verification import (
    VerificationRequest,
    VerificationResult,
    VerificationStatus,
    VerificationType,
)
from app.integrations.verification.base import BaseVerificationProvider, VerificationResponse
from app.integrations.verification.mock_provider import MockVerificationProvider
from app.integrations.verification.official_provider import (
    BISOfficialApiProvider,
    OfficialRedirectProvider,
)
from app.services.verification_service import VerificationService


@pytest.mark.asyncio
async def test_mock_huid_verification_verified():
    provider = MockVerificationProvider()
    response = await provider.verify_huid("ABC123")
    assert response.status == VerificationStatus.VERIFIED
    assert response.normalized_identifier == "ABC123"
    assert response.source_name == "MOCK_BIS_PROVIDER"
    assert response.source_url is not None
    assert response.data is not None
    assert response.data["huid"] == "ABC123"
    assert "fineness" in response.data


@pytest.mark.asyncio
async def test_mock_huid_verification_expired():
    provider = MockVerificationProvider()
    response = await provider.verify_huid("EXP999")
    assert response.status == VerificationStatus.EXPIRED
    assert response.notes is not None


@pytest.mark.asyncio
async def test_mock_huid_verification_not_found():
    provider = MockVerificationProvider()
    response = await provider.verify_huid("NOTF00")
    assert response.status == VerificationStatus.NOT_FOUND
    assert response.notes is not None


@pytest.mark.asyncio
async def test_mock_huid_verification_error():
    provider = MockVerificationProvider()
    response = await provider.verify_huid("ERR500")
    assert response.status == VerificationStatus.ERROR
    assert response.notes is not None


@pytest.mark.asyncio
async def test_mock_licence_verification():
    provider = MockVerificationProvider()
    response = await provider.verify_licence("CM/L-1234567")
    assert response.status == VerificationStatus.VERIFIED
    assert "CM/L" in response.normalized_identifier
    assert response.data is not None
    assert "grantee_name" in response.data


@pytest.mark.asyncio
async def test_mock_licence_verification_expired():
    provider = MockVerificationProvider()
    response = await provider.verify_licence("CM/L-EXPIRED")
    assert response.status == VerificationStatus.EXPIRED


@pytest.mark.asyncio
async def test_mock_r_number_verification():
    provider = MockVerificationProvider()
    response = await provider.verify_r_number("R-12345678")
    assert response.status == VerificationStatus.VERIFIED
    assert response.normalized_identifier == "R-12345678"
    assert response.data is not None
    assert response.data["brand"] == "TechCorp"


@pytest.mark.asyncio
async def test_mock_normalization_case_and_whitespace():
    provider = MockVerificationProvider()
    response = await provider.verify_huid("  abc123  ")
    assert response.normalized_identifier == "ABC123"
    assert response.status == VerificationStatus.VERIFIED


@pytest.mark.asyncio
async def test_official_redirect_provider():
    provider = OfficialRedirectProvider()

    huid_res = await provider.verify_huid("ABC123")
    assert huid_res.status == VerificationStatus.NOT_VERIFIED
    assert huid_res.source_name == "BIS_CARE_OFFICIAL_PORTAL"
    assert "bis-care-app" in (huid_res.source_url or "")

    licence_res = await provider.verify_licence("CM/L-1234567")
    assert licence_res.status == VerificationStatus.NOT_VERIFIED
    assert licence_res.source_name == "BIS_MANAK_ONLINE"
    assert "manakonline" in (licence_res.source_url or "")

    r_num_res = await provider.verify_r_number("R-12345678")
    assert r_num_res.status == VerificationStatus.NOT_VERIFIED
    assert r_num_res.source_name == "BIS_CRS_PORTAL"
    assert "crsbis" in (r_num_res.source_url or "")


@pytest.mark.asyncio
async def test_bis_official_api_provider_raises_not_implemented():
    provider = BISOfficialApiProvider(api_base_url="https://api.bis.gov.in", api_key="secret")
    with pytest.raises(NotImplementedError):
        await provider.verify_huid("ABC123")
    with pytest.raises(NotImplementedError):
        await provider.verify_licence("CM/L-123")
    with pytest.raises(NotImplementedError):
        await provider.verify_r_number("R-123")


def test_verification_status_explicit_seven_states():
    # Never binary real/fake: exactly 7 explicit states
    expected_states = {
        "UNKNOWN",
        "PENDING",
        "VERIFIED",
        "NOT_VERIFIED",
        "NOT_FOUND",
        "EXPIRED",
        "ERROR",
    }
    actual_states = {status.value for status in VerificationStatus}
    assert actual_states == expected_states
    assert len(VerificationStatus) == 7


def test_verification_type_enum():
    assert VerificationType.HUID.value == "HUID"
    assert VerificationType.LICENCE.value == "LICENCE"
    assert VerificationType.CRS_R_NUMBER.value == "CRS_R_NUMBER"


@pytest.mark.asyncio
async def test_verification_models_and_service_persistence():
    test_engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

    async with session_factory() as session:
        # Create a test user for audit association
        user = User(
            email="auditor@bis.gov.in",
            hashed_password="fakehashedpwd",
            role=UserRole.ADMIN,
        )
        session.add(user)
        await session.commit()
        user_id = user.id

        # 1. Test VerificationService with MockVerificationProvider
        service = VerificationService(provider=MockVerificationProvider())

        # Test HUID verification
        resp_huid = await service.process_verification(
            db=session,
            req_type=VerificationType.HUID,
            identifier="abc123",
            user_id=user_id,
        )
        assert resp_huid.status == VerificationStatus.VERIFIED
        assert resp_huid.normalized_identifier == "ABC123"

        # Verify DB records
        stmt = select(VerificationRequest).where(VerificationRequest.identifier == "ABC123")
        req_res = await session.execute(stmt)
        saved_req = req_res.scalar_one()

        assert saved_req.request_type == VerificationType.HUID
        assert saved_req.user_id == user_id
        assert saved_req.status == VerificationStatus.VERIFIED
        assert saved_req.provider_name == "MOCK_BIS_PROVIDER"
        assert saved_req.created_at is not None

        # Verify linked VerificationResult
        stmt_result = select(VerificationResult).where(VerificationResult.request_id == saved_req.id)
        res_res = await session.execute(stmt_result)
        saved_result = res_res.scalar_one()

        assert saved_result.verified_at == resp_huid.retrieved_at
        assert saved_result.source_url == resp_huid.source_url
        assert saved_result.normalized_data is not None
        assert saved_result.normalized_data["fineness"] == "916 (22K)"

        # 2. Test VerificationService with OfficialRedirectProvider
        redirect_service = VerificationService(provider=OfficialRedirectProvider())
        resp_licence = await redirect_service.process_verification(
            db=session,
            req_type=VerificationType.LICENCE,
            identifier="cm/l-9999999",
            user_id=None,
        )
        assert resp_licence.status == VerificationStatus.NOT_VERIFIED
        assert resp_licence.source_name == "BIS_MANAK_ONLINE"

        stmt_lic = select(VerificationRequest).where(VerificationRequest.identifier == "CM/L-9999999")
        lic_res = await session.execute(stmt_lic)
        saved_lic_req = lic_res.scalar_one()
        assert saved_lic_req.status == VerificationStatus.NOT_VERIFIED
        assert saved_lic_req.user_id is None

        # 3. Test CRS_R_NUMBER verification
        resp_r = await service.process_verification(
            db=session,
            req_type=VerificationType.CRS_R_NUMBER,
            identifier="R-12345678",
        )
        assert resp_r.status == VerificationStatus.VERIFIED
        assert resp_r.data["product"] == "Power Adaptors"

    await test_engine.dispose()


def test_models_init_exports_verification():
    import app.models as models

    assert hasattr(models, "VerificationRequest")
    assert hasattr(models, "VerificationResult")
    assert hasattr(models, "VerificationType")
    assert hasattr(models, "VerificationStatus")

    assert "VerificationRequest" in models.__all__
    assert "VerificationResult" in models.__all__
    assert "VerificationType" in models.__all__
    assert "VerificationStatus" in models.__all__
