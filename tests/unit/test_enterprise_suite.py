from __future__ import annotations

from datetime import date
import pytest
from app.api.v1.laboratories import calculate_haversine_distance
from app.api.v1.qco import compute_qco_enforcement_details
from app.models.laboratory import Laboratory
from app.schemas.laboratories import LaboratoryOut


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


