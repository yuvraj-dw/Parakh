from __future__ import annotations

from datetime import date
import pytest
from httpx import ASGITransport, AsyncClient
from app.api.v1.laboratories import calculate_haversine_distance
from app.api.v1.qco import compute_qco_enforcement_details
from app.api.v1.certification import generate_rejected_alternatives
from app.api.v1.chat import ChatRequest
from app.main import app
from app.models.laboratory import Laboratory
from app.schemas.laboratories import LaboratoryOut
from app.services.chat_service import get_persona_system_prompt


def test_haversine_distance_calculation():
    # Delhi to Mumbai distance is ~1148 km (between 1140 and 1160)
    delhi_lat, delhi_lon = 28.6289, 77.2065
    mumbai_lat, mumbai_lon = 19.0760, 72.8777
    distance = calculate_haversine_distance(delhi_lat, delhi_lon, mumbai_lat, mumbai_lon)
    assert 1140.0 <= distance <= 1160.0
    assert isinstance(distance, float)
    assert calculate_haversine_distance(delhi_lat, delhi_lon, delhi_lat, delhi_lon) == 0.0


def test_laboratory_model_coordinates():
    # Verify Laboratory model has latitude and longitude fields
    assert "latitude" in Laboratory.__table__.columns
    assert "longitude" in Laboratory.__table__.columns

    lab = Laboratory(
        recognition_code="TEST-LAB-01",
        name="Test Coordinates Laboratory",
        city="New Delhi",
        state="Delhi",
        latitude=28.6289,
        longitude=77.2065,
    )
    assert lab.latitude == 28.6289
    assert lab.longitude == 77.2065


def test_laboratory_out_schema_and_sorting():
    # Test items sorting by distance_km ascending with None at end
    items = [
        LaboratoryOut(
            id="1",
            recognition_code="LAB-1",
            name="Lab 1",
            city="City 1",
            state="State 1",
            status="RECOGNIZED",
            latitude=None,
            longitude=None,
            distance_km=None,
            maps_url=None,
        ),
        LaboratoryOut(
            id="2",
            recognition_code="LAB-2",
            name="Lab 2",
            city="City 2",
            state="State 2",
            status="RECOGNIZED",
            latitude=28.62,
            longitude=77.20,
            distance_km=150.5,
            maps_url="https://www.google.com/maps/dir/?api=1&destination=28.62,77.2",
        ),
        LaboratoryOut(
            id="3",
            recognition_code="LAB-3",
            name="Lab 3",
            city="City 3",
            state="State 3",
            status="RECOGNIZED",
            latitude=28.63,
            longitude=77.21,
            distance_km=12.3,
            maps_url="https://www.google.com/maps/dir/?api=1&destination=28.63,77.21",
        ),
        LaboratoryOut(
            id="4",
            recognition_code="LAB-4",
            name="Lab 4",
            city="City 4",
            state="State 4",
            status="RECOGNIZED",
            latitude=None,
            longitude=None,
            distance_km=None,
            maps_url=None,
        ),
    ]

    items.sort(key=lambda x: (0, x.distance_km) if x.distance_km is not None else (1, 0))
    assert [x.id for x in items] == ["3", "2", "1", "4"]
    assert items[0].distance_km == 12.3
    assert items[1].distance_km == 150.5
    assert items[2].distance_km is None
    assert items[3].distance_km is None


def test_qco_enforcement_computation():
    # Future date: effective 2027-01-01, today 2026-09-29
    res_future = compute_qco_enforcement_details(
        effective_date=date(2027, 1, 1),
        today=date(2026, 9, 29),
    )
    assert res_future["is_enforced"] is False
    assert res_future["days_until_enforcement"] > 0
    assert res_future["msme_micro_deadline"] == "2027-07-01"
    assert res_future["msme_small_deadline"] == "2027-04-01"
    assert "exemption_note" in res_future

    # Past date: effective 2024-03-01, today 2026-09-29
    res_past = compute_qco_enforcement_details(
        effective_date=date(2024, 3, 1),
        today=date(2026, 9, 29),
    )
    assert res_past["is_enforced"] is True
    assert res_past["days_until_enforcement"] < 0
    assert res_past["msme_micro_deadline"] == "2024-09-01"
    assert res_past["msme_small_deadline"] == "2024-06-01"

    # None effective_date
    res_none = compute_qco_enforcement_details(
        effective_date=None,
        today=date(2026, 9, 29),
    )
    assert res_none["is_enforced"] is False
    assert res_none["days_until_enforcement"] == 0
    assert res_none["msme_micro_deadline"] is None
    assert res_none["msme_small_deadline"] is None
    assert res_none["exemption_note"] == "No effective date specified in gazette."


def test_persona_system_prompt_selection():
    consumer_prompt = get_persona_system_prompt("CONSUMER")
    assert "consumer rights" in consumer_prompt.lower() or "product safety" in consumer_prompt.lower()

    industry_prompt = get_persona_system_prompt("INDUSTRY")
    assert "msme" in industry_prompt.lower() or "clause" in industry_prompt.lower()

    # Test default/unknown defaults to consumer prompt
    default_prompt = get_persona_system_prompt()
    assert default_prompt == consumer_prompt

    unknown_prompt = get_persona_system_prompt("UNKNOWN")
    assert unknown_prompt == consumer_prompt

    none_prompt = get_persona_system_prompt(None)
    assert none_prompt == consumer_prompt


@pytest.mark.asyncio
async def test_chat_endpoint_with_persona():
    # Verify ChatRequest accepts persona="INDUSTRY" and persona="CONSUMER"
    req_industry = ChatRequest(message="Standards for steel", persona="INDUSTRY")
    assert req_industry.persona == "INDUSTRY"

    req_consumer = ChatRequest(message="Is this gold certified?", persona="CONSUMER")
    assert req_consumer.persona == "CONSUMER"

    req_default = ChatRequest(message="General query")
    assert req_default.persona == "CONSUMER"

    # Verify endpoint invocation with persona
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/chat",
            json={"message": "What standard applies to steel?", "persona": "INDUSTRY"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "answer" in data
        assert "conversation_id" in data


def test_generate_rejected_alternatives():
    alts_17803 = generate_rejected_alternatives("IS 17803:2022")
    assert len(alts_17803) >= 1
    codes_17803 = [a["standard_code"] for a in alts_17803]
    assert "IS 14756:2017" in codes_17803

    alts_4151 = generate_rejected_alternatives("IS 4151:2015")
    codes_4151 = [a["standard_code"] for a in alts_4151]
    assert "IS 2925:1984" in codes_4151

    alts_unknown = generate_rejected_alternatives("IS 99999:9999")
    assert len(alts_unknown) >= 1
    assert alts_unknown[0]["standard_code"] == "IS 13252 (Part 1):2010"
    assert "computing equipment" in alts_unknown[0]["reason_rejected"].lower()


@pytest.mark.asyncio
async def test_map_product_endpoint_includes_rejected_alternatives():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        resp = await ac.post(
            "/api/v1/certification/map-product",
            json={"description": "stainless steel vacuum flask"},
        )
        assert resp.status_code == 200
        data = resp.json()
        assert "rejected_alternatives" in data
        assert isinstance(data["rejected_alternatives"], list)
        assert len(data["rejected_alternatives"]) > 0


def test_whistleblower_pii_sanitization():
    from app.api.v1.grievance import sanitize_whistleblower_text

    raw_text = (
        "Hello, my name is Ramesh and I am Suresh. "
        "You can reach me at ramesh.kumar@example.com or whistleblower123@gov.in. "
        "My phone number is +91 9876543210 and alternate is 8765432109."
    )
    sanitized = sanitize_whistleblower_text(raw_text)

    # Verify email redaction
    assert "ramesh.kumar@example.com" not in sanitized
    assert "whistleblower123@gov.in" not in sanitized
    assert "[REDACTED_EMAIL]" in sanitized

    # Verify phone redaction
    assert "9876543210" not in sanitized
    assert "8765432109" not in sanitized
    assert "[REDACTED_PHONE]" in sanitized

    # Verify self-identifying phrases redaction
    assert "Ramesh" not in sanitized
    assert "Suresh" not in sanitized
    assert "[REDACTED_NAME]" in sanitized


@pytest.mark.asyncio
async def test_whistleblower_endpoint_lifecycle():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        payload = {
            "incident_type": "COUNTERFEIT_ISI",
            "suspect_entity": "Acme Steel Mills Ltd",
            "location": "Plot 42, Industrial Area, Ghaziabad, UP",
            "description": "My name is Amit and I saw fake ISI marks. Contact me at amit@fakeco.com or +919876543210.",
            "image_url": "https://example.com/evidence1.jpg",
        }
        resp = await ac.post("/api/v1/grievances/whistleblower", json=payload)
        assert resp.status_code == 200
        data = resp.json()
        assert "tracking_code" in data
        assert data["tracking_code"].startswith("BIS-WH-")
        assert data["status"] == "LOGGED"
        assert data["incident_type"] == "COUNTERFEIT_ISI"
        assert "DPDP Act, 2023" in data["message"]

        tracking_code = data["tracking_code"]

        # Call GET endpoint
        get_resp = await ac.get(f"/api/v1/grievances/whistleblower/{tracking_code}")
        assert get_resp.status_code == 200
        get_data = get_resp.json()
        assert get_data["tracking_code"] == tracking_code
        assert get_data["status"] == "LOGGED"
        assert get_data["suspect_entity"] == "Acme Steel Mills Ltd"
        assert "[REDACTED_NAME]" in get_data["evidence_text"]
        assert "[REDACTED_EMAIL]" in get_data["evidence_text"]
        assert "[REDACTED_PHONE]" in get_data["evidence_text"]
        assert "Amit" not in get_data["evidence_text"]
        assert "amit@fakeco.com" not in get_data["evidence_text"]
        assert "9876543210" not in get_data["evidence_text"]

        # Non-existent tracking code
        bad_resp = await ac.get("/api/v1/grievances/whistleblower/BIS-WH-9999-NOTFOUND")
        assert bad_resp.status_code == 404





