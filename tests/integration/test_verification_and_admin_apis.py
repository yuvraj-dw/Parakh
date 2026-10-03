from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.security import get_password_hash
from app.dependencies import get_db
from app.main import app
from app.models.base import Base
from app.models.user import User, UserRole


@pytest.fixture(autouse=True)
async def setup_test_db():
    engine = create_async_engine("sqlite+aiosqlite:///:memory:", echo=False)
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            try:
                yield session
            finally:
                await session.close()

    app.dependency_overrides[get_db] = override_get_db
    yield session_factory
    app.dependency_overrides.clear()
    await engine.dispose()


# =====================================================================
# Authentication Endpoint Tests
# =====================================================================

@pytest.mark.asyncio
async def test_auth_register_and_login_flow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Register a new user
        reg_resp = await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "consumer@example.com",
                "password": "StrongPassword123!",
                "role": "user",
            },
        )
        assert reg_resp.status_code in (200, 201)
        reg_data = reg_resp.json()
        assert reg_data["email"] == "consumer@example.com"
        assert reg_data["role"] == "user"
        assert "id" in reg_data

        # 2. Login to receive JWT token
        login_resp = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "consumer@example.com",
                "password": "StrongPassword123!",
            },
        )
        assert login_resp.status_code == 200
        token_data = login_resp.json()
        assert "access_token" in token_data
        assert token_data["token_type"].lower() == "bearer"
        access_token = token_data["access_token"]

        # 3. Access current user profile
        me_resp = await ac.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert me_resp.status_code == 200
        me_data = me_resp.json()
        assert me_data["email"] == "consumer@example.com"
        assert me_data["role"] == "user"


@pytest.mark.asyncio
async def test_auth_invalid_credentials():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        await ac.post(
            "/api/v1/auth/register",
            json={
                "email": "user2@example.com",
                "password": "CorrectPassword123!",
            },
        )
        # Login with wrong password
        login_resp = await ac.post(
            "/api/v1/auth/login",
            json={
                "email": "user2@example.com",
                "password": "WrongPassword!",
            },
        )
        assert login_resp.status_code == 401
        err = login_resp.json()
        assert "error" in err
        assert err["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_auth_me_unauthorized():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.get("/api/v1/auth/me")
        assert resp.status_code == 401
        err = resp.json()
        assert err["error"]["code"] == "UNAUTHORIZED"


# =====================================================================
# Verification Endpoint Tests
# =====================================================================

@pytest.mark.asyncio
async def test_verification_huid_verified_and_expired():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # Verified case
        resp_verified = await ac.post(
            "/api/v1/verification/huid",
            json={"huid": "ABC123"},
        )
        assert resp_verified.status_code == 200
        data = resp_verified.json()
        assert data["status"] == "VERIFIED"
        assert data["normalized_identifier"] == "ABC123"
        assert data["data"]["fineness"] == "916 (22K)"

        # Expired case
        resp_expired = await ac.post(
            "/api/v1/verification/huid",
            json={"huid": "EXP999"},
        )
        assert resp_expired.status_code == 200
        data_exp = resp_expired.json()
        assert data_exp["status"] == "EXPIRED"


@pytest.mark.asyncio
async def test_verification_licence():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/verification/licence",
            json={"licence_number": "CM/L-1234567"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "VERIFIED"
        assert "CM/L" in data["normalized_identifier"]
        assert data["data"]["grantee_name"] == "Standard Manufacturer India Pvt Ltd"


@pytest.mark.asyncio
async def test_verification_r_number():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/verification/r-number",
            json={"r_number": "R-12345678"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert data["status"] == "VERIFIED"
        assert data["normalized_identifier"] == "R-12345678"
        assert data["data"]["brand"] == "TechCorp"


# =====================================================================
# Jewellery Vision & Assay Report Tests
# =====================================================================

@pytest.mark.asyncio
async def test_jewellery_scan_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("hallmark_sample.jpg", b"fake_jewellery_bytes", "image/jpeg")}
        resp = await ac.post("/api/v1/jewellery/scan", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert data["detected_huid"] == "ABC123"
        assert data["detected_fineness"] == "916"
        assert data["detected_bis_logo"] is True
        assert data["confidence_score"] >= 0.9
        assert data["hallmark_present"] is True
        assert data["hallmark_standard"] == "INDIAN_BIS"
        assert len(data["detected_marks"]) > 0


@pytest.mark.asyncio
async def test_jewellery_assay_report_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("assay_report.pdf", b"%PDF-1.4 fake assay report", "application/pdf")}
        resp = await ac.post("/api/v1/jewellery/assay-report", files=files)
        assert resp.status_code == 200
        data = resp.json()
        assert data["report_number"] == "AR-2026-9081"
        assert data["metal"] == "Gold"
        assert "91.67%" in data["reported_purity"]


# =====================================================================
# AI Chat Assistant Tests
# =====================================================================

@pytest.mark.asyncio
async def test_chat_endpoint_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # First query
        resp1 = await ac.post(
            "/api/v1/chat",
            json={"message": "What standard applies to stainless steel water bottles?"},
        )
        assert resp1.status_code == 200
        data1 = resp1.json()
        assert "conversation_id" in data1
        assert "IS 17803:2022" in data1["answer"]
        assert len(data1["citations"]) > 0
        conv_id = data1["conversation_id"]

        # Conversation continuation with same conversation_id
        resp2 = await ac.post(
            "/api/v1/chat",
            json={
                "conversation_id": conv_id,
                "message": "What are the test requirements?",
            },
        )
        assert resp2.status_code == 200
        data2 = resp2.json()
        assert data2["conversation_id"] == conv_id
        assert len(data2["answer"]) > 0


# =====================================================================
# Admin RBAC, Sync & Health Tests
# =====================================================================

@pytest.mark.asyncio
async def test_admin_endpoints_require_admin_role(setup_test_db):
    session_factory = setup_test_db
    async with session_factory() as session:
        # Create normal user and admin user
        regular_user = User(
            email="regular@example.com",
            hashed_password=get_password_hash("password123"),
            role=UserRole.USER,
        )
        admin_user = User(
            email="admin@bis.gov.in",
            hashed_password=get_password_hash("adminpassword123"),
            role=UserRole.ADMIN,
        )
        session.add_all([regular_user, admin_user])
        await session.commit()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Unauthenticated request -> 401
        unauth_resp = await ac.get("/api/v1/admin/sync/runs")
        assert unauth_resp.status_code == 401

        # 2. Login as regular user
        reg_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": "regular@example.com", "password": "password123"},
        )
        reg_token = reg_login.json()["access_token"]

        # Regular user accessing admin endpoints -> 403 Forbidden
        forbidden_resp = await ac.get(
            "/api/v1/admin/sync/runs",
            headers={"Authorization": f"Bearer {reg_token}"},
        )
        assert forbidden_resp.status_code == 403
        assert forbidden_resp.json()["error"]["code"] == "FORBIDDEN"

        # 3. Login as admin user
        admin_login = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@bis.gov.in", "password": "adminpassword123"},
        )
        admin_token = admin_login.json()["access_token"]

        # Admin accessing source health
        health_resp = await ac.get(
            "/api/v1/admin/source-health",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert health_resp.status_code == 200
        health_data = health_resp.json()
        assert health_data["status"] in ("healthy", "ok")
        assert "sources" in health_data
        assert len(health_data["sources"]) >= 3

        # Admin triggers dataset sync
        sync_resp = await ac.post(
            "/api/v1/admin/sync/standards",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert sync_resp.status_code == 200
        sync_data = sync_resp.json()
        assert sync_data["dataset"] == "standards"
        assert sync_data["status"] == "SUCCESS"
        assert sync_data["records_seen"] > 0

        # Admin lists sync runs
        runs_resp = await ac.get(
            "/api/v1/admin/sync/runs",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert runs_resp.status_code == 200
        runs_data = runs_resp.json()
        assert "items" in runs_data
        assert len(runs_data["items"]) >= 1
        assert runs_data["items"][0]["dataset"] == "standards"

        # Admin lists sync errors
        errors_resp = await ac.get(
            "/api/v1/admin/sync/errors",
            headers={"Authorization": f"Bearer {admin_token}"},
        )
        assert errors_resp.status_code == 200
        errors_data = errors_resp.json()
        assert "items" in errors_data
