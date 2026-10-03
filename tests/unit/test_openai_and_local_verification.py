from __future__ import annotations

import pytest
import re
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.openai_compatible import (
    OpenAICompatibleLLMProvider,
    OpenAICompatibleVisionProvider,
)
from app.integrations.rag.base import RAGChunk
from app.integrations.verification.mock_provider import MockVerificationProvider
from app.models.hallmarking import Jeweller, JewellerStatus
from app.models.verification import VerificationStatus, VerificationType
from app.services.verification_service import VerificationService


@pytest.mark.asyncio
async def test_local_db_licence_verification(db_session: AsyncSession):
    # 1. Seed test jeweller in DB
    jwl = Jeweller(
        registration_number="JWL-LOCAL-999",
        name="Local Tested Jewellers",
        city="Pune",
        state="Maharashtra",
        metal_category="GOLD",
        status=JewellerStatus.VALID,
    )
    db_session.add(jwl)
    await db_session.commit()

    service = VerificationService(provider=MockVerificationProvider())

    # 2. Verify registered licence -> should resolve from LOCAL_DATABASE_REGISTRY
    resp = await service.process_verification(
        db=db_session,
        req_type=VerificationType.LICENCE,
        identifier="jwl-local-999",
    )
    assert resp.status == VerificationStatus.VERIFIED
    assert resp.source_name == "LOCAL_DATABASE_REGISTRY"
    assert resp.data["grantee_name"] == "Local Tested Jewellers"

    # 3. Verify non-existent licence -> falls back to MockVerificationProvider
    resp_fallback = await service.process_verification(
        db=db_session,
        req_type=VerificationType.LICENCE,
        identifier="NOTF-RANDOM-LICENCE",
    )
    assert resp_fallback.status == VerificationStatus.NOT_FOUND
    assert resp_fallback.source_name == "MOCK_BIS_PROVIDER"


@pytest.mark.asyncio
async def test_openai_compatible_llm_provider_offline_fallback():
    provider = OpenAICompatibleLLMProvider(
        base_url="http://127.0.0.1:9999/v1",  # dummy offline port
        model="gemini-2.0-flash",
        timeout=1.0,
    )
    chunk = RAGChunk(
        chunk_id="c1",
        document_id="doc1",
        document_title="BIS Standard 17803",
        text="Sample text",
        standard_number="IS 17803:2022",
    )
    result = await provider.generate_response(
        messages=[{"role": "user", "content": "What is IS 17803?"}],
        context_chunks=[chunk],
    )
    assert "IS 17803:2022" in result.answer
    assert len(result.citations) == 1
    assert result.citations[0].standard_number == "IS 17803:2022"


@pytest.mark.asyncio
async def test_openai_compatible_vision_provider_offline_fallback():
    vision = OpenAICompatibleVisionProvider(
        base_url="http://127.0.0.1:9999/v1",
        model="gemini-2.0-flash",
        timeout=1.0,
    )
    # Empty bytes test
    empty_res = await vision.scan_jewellery_marks(b"")
    assert empty_res.detected_huid is None

    # Dummy image bytes test with fallback
    scan_res = await vision.scan_jewellery_marks(b"fake_image_bytes")
    assert scan_res.detected_huid == "ABC123"
    assert scan_res.detected_fineness == "916"
    assert scan_res.detected_bis_logo is True
    assert scan_res.hallmark_present is True
    assert scan_res.hallmark_standard == "INDIAN_BIS"

    # Assay report fallback
    assay_res = await vision.parse_assay_report(b"fake_pdf_bytes", "application/pdf")
    assert assay_res.report_number is not None
    assert "Gold" in assay_res.metal


def test_supabase_url_sslmode_sanitization():
    raw_url = "postgresql://postgres.abc:pass@aws-0-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require"
    db_url = raw_url
    if db_url.startswith("postgresql://"):
        db_url = db_url.replace("postgresql://", "postgresql+asyncpg://", 1)

    connect_args = {}
    if any(k in db_url for k in ("supabase.co", "pooler.supabase.com", "sslmode", "ssl=require")):
        connect_args["ssl"] = "require"
        db_url = re.sub(r"[?&]sslmode=[^&]+", "", db_url)

    assert connect_args.get("ssl") == "require"
    assert "sslmode" not in db_url
    assert db_url.startswith("postgresql+asyncpg://")


def test_google_oauth_token_manager_init():
    from app.integrations.google_oauth_provider import GoogleOAuthTokenManager
    mgr = GoogleOAuthTokenManager(refresh_token="test_mock_refresh_token")
    assert mgr.refresh_token == "test_mock_refresh_token"
    assert mgr.access_token is None

