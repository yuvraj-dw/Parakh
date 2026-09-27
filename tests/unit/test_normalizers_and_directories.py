from __future__ import annotations

from datetime import date
import pytest
from sqlalchemy import create_engine, select
from sqlalchemy.orm import Session

from app.utils.normalizers import normalize_is_number, normalize_state, normalize_text
from app.models.laboratory import Laboratory, LaboratoryScope, LabStatus
from app.models.hallmarking import AHCCentre, Jeweller, CentreStatus, JewellerStatus
import app.models as models


def test_normalize_state_canonical():
    assert normalize_state("M.P.") == "Madhya Pradesh"
    assert normalize_state("mp") == "Madhya Pradesh"
    assert normalize_state("  madhya   pradesh  ") == "Madhya Pradesh"
    assert normalize_state("karnataka") == "Karnataka"
    assert normalize_state("delhi") == "Delhi"
    assert normalize_state("u.p.") == "Uttar Pradesh"
    assert normalize_state("UP") == "Uttar Pradesh"
    assert normalize_state("maharashtra") == "Maharashtra"
    assert normalize_state("TAMIL NADU") == "Tamil Nadu"
    assert normalize_state("nct of delhi") == "Delhi"
    assert normalize_state("unknown state") == "Unknown State"
    assert normalize_state("") == ""
    assert normalize_state(None) == ""


def test_normalize_is_number():
    assert normalize_is_number("is 17803:2022") == "IS 17803:2022"
    assert normalize_is_number("IS17803") == "IS 17803"
    assert normalize_is_number("  is  15820  ") == "IS 15820"
    assert normalize_is_number("IS:1234") == "IS 1234"
    assert normalize_is_number("IS-1234") == "IS 1234"
    assert normalize_is_number("IS 15820 (Part 1):2010") == "IS 15820 (Part 1):2010"
    assert normalize_is_number("IS/ISO 9001:2015") == "IS/ISO 9001:2015"
    assert normalize_is_number("") == ""
    assert normalize_is_number(None) == ""


def test_normalize_text():
    assert normalize_text("  Testing   Sample   123  ") == "Testing Sample 123"
    assert normalize_text("\t\n Hello   World \n\t") == "Hello World"
    assert normalize_text("") == ""
    assert normalize_text(None) == ""


def test_laboratory_and_scope_models():
    lab = Laboratory(
        recognition_code="LAB-DEL-001",
        name="National Testing Laboratory",
        city="New Delhi",
        state="Delhi",
        valid_from=date(2023, 1, 1),
        valid_until=date(2026, 1, 1),
        contact_details={"email": "ntl@example.com"},
    )
    assert lab.id is not None
    assert len(lab.id) == 36
    assert lab.status == LabStatus.RECOGNIZED
    assert lab.source_name == "MANUAL"
    assert lab.recognition_code == "LAB-DEL-001"
    assert lab.contact_details == {"email": "ntl@example.com"}

    scope = LaboratoryScope(
        laboratory_id=lab.id,
        is_number="IS 17803",
        product_name="Textiles",
        test_name="Tensile Strength",
        parameter="Tensile",
        limit_of_detection="0.1 N",
    )
    assert scope.id is not None
    assert scope.laboratory_id == lab.id
    assert scope.is_number == "IS 17803"


def test_hallmarking_models():
    ahc = AHCCentre(
        recognition_number="AHC-DL-001",
        name="Delhi Assaying Centre",
        city="New Delhi",
        state="Delhi",
        metal_capabilities=["GOLD", "SILVER"],
    )
    assert ahc.id is not None
    assert ahc.status == CentreStatus.ACTIVE
    assert ahc.metal_capabilities == ["GOLD", "SILVER"]
    assert ahc.source_name == "MANUAL"

    jeweller = Jeweller(
        registration_number="JWL-DL-9999",
        name="Pure Gold Jewellers",
        city="New Delhi",
        state="Delhi",
        metal_category="GOLD",
    )
    assert jeweller.id is not None
    assert jeweller.status == JewellerStatus.VALID
    assert jeweller.metal_category == "GOLD"
    assert jeweller.source_name == "MANUAL"


def test_directories_persistence_in_sqlite():
    engine = create_engine("sqlite:///:memory:")
    models.Base.metadata.create_all(engine)

    with Session(engine) as session:
        lab = Laboratory(
            recognition_code="LAB-TEST-01",
            name="Test Analytical Labs",
            city="Bhopal",
            state="Madhya Pradesh",
            status=LabStatus.RECOGNIZED,
        )
        scope = LaboratoryScope(
            laboratory=lab,
            is_number="IS 15820",
            product_name="Gold Jewellery",
            test_name="Fire Assay",
        )
        ahc = AHCCentre(
            recognition_number="AHC-MP-001",
            name="Central Assaying Centre",
            city="Indore",
            state="Madhya Pradesh",
            metal_capabilities=["GOLD"],
        )
        jeweller = Jeweller(
            registration_number="JWL-MP-001",
            name="Royal Jewellers",
            city="Bhopal",
            state="Madhya Pradesh",
            metal_category="GOLD",
        )

        session.add_all([lab, scope, ahc, jeweller])
        session.commit()

        # Query back
        stored_lab = session.scalar(select(Laboratory).where(Laboratory.recognition_code == "LAB-TEST-01"))
        assert stored_lab is not None
        assert stored_lab.name == "Test Analytical Labs"
        assert len(stored_lab.scopes) == 1
        assert stored_lab.scopes[0].test_name == "Fire Assay"

        stored_ahc = session.scalar(select(AHCCentre).where(AHCCentre.recognition_number == "AHC-MP-001"))
        assert stored_ahc is not None
        assert stored_ahc.city == "Indore"
        assert stored_ahc.metal_capabilities == ["GOLD"]

        stored_jeweller = session.scalar(select(Jeweller).where(Jeweller.registration_number == "JWL-MP-001"))
        assert stored_jeweller is not None
        assert stored_jeweller.name == "Royal Jewellers"


def test_models_init_exports_directories():
    expected_exports = [
        "Laboratory",
        "LaboratoryScope",
        "LabStatus",
        "AHCCentre",
        "Jeweller",
        "CentreStatus",
        "JewellerStatus",
    ]
    for export_name in expected_exports:
        assert hasattr(models, export_name), f"models missing {export_name}"
        assert export_name in models.__all__, f"{export_name} missing from models.__all__"
