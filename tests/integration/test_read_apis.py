from __future__ import annotations

import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    decode_access_token,
)
from app.core.exceptions import ResourceNotFoundException


@pytest.mark.asyncio
async def test_health_check_and_headers():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert "app" in data
        assert "version" in data
        assert "x-request-id" in response.headers
        assert "x-process-time" in response.headers


@pytest.mark.asyncio
async def test_custom_correlation_id_header():
    custom_id = "req-custom-12345"
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/health", headers={"X-Request-ID": custom_id})
        assert response.status_code == 200
        assert response.headers["x-request-id"] == custom_id


@pytest.mark.asyncio
async def test_standards_list_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/standards")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "pagination" in data
        assert data["pagination"]["page"] == 1
        assert len(data["items"]) >= 1
        assert "is_number" in data["items"][0]
        assert "title" in data["items"][0]


@pytest.mark.asyncio
async def test_qco_list_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/qco")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "pagination" in data
        assert len(data["items"]) >= 1
        assert "qco_number" in data["items"][0]


@pytest.mark.asyncio
async def test_laboratories_filter_state():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/laboratories?state=Delhi")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "pagination" in data
        assert len(data["items"]) >= 1
        assert data["items"][0]["state"] == "Delhi"


@pytest.mark.asyncio
async def test_certification_schemes_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/certification/schemes")
        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2
        assert "scheme_code" in data[0]


@pytest.mark.asyncio
async def test_certification_map_product_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.post(
            "/api/v1/certification/map-product",
            json={"description": "Stainless steel flask for domestic use"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "candidate_standard" in data
        assert "is_mandatory" in data
        assert "confidence" in data


@pytest.mark.asyncio
async def test_hallmarking_centres_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/hallmarking/centres?state=Delhi")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "pagination" in data
        assert len(data["items"]) >= 1
        assert data["items"][0]["state"] == "Delhi"


@pytest.mark.asyncio
async def test_jewellers_list_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/jewellers?state=Maharashtra")
        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "pagination" in data
        assert len(data["items"]) >= 1
        assert data["items"][0]["state"] == "Maharashtra"


@pytest.mark.asyncio
async def test_custom_exception_envelope():
    # Trigger an AppException on a test endpoint or route
    @app.get("/test-error-endpoint")
    async def trigger_error():
        raise ResourceNotFoundException("Standard", "IS 99999")

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        response = await ac.get("/test-error-endpoint", headers={"X-Request-ID": "err-123"})
        assert response.status_code == 404
        data = response.json()
        assert "error" in data
        assert data["error"]["code"] == "RESOURCE_NOT_FOUND"
        assert "IS 99999" in data["error"]["message"]
        assert data["error"]["request_id"] == "err-123"


def test_security_password_hashing():
    raw_password = "SecureSuperPassword123!"
    hashed = get_password_hash(raw_password)
    assert hashed != raw_password
    assert verify_password(raw_password, hashed) is True
    assert verify_password("WrongPassword!", hashed) is False


def test_security_jwt_token():
    payload = {"sub": "user_123", "role": "admin"}
    token = create_access_token(payload)
    decoded = decode_access_token(token)
    assert decoded["sub"] == "user_123"
    assert decoded["role"] == "admin"
    assert "exp" in decoded
