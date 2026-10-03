from __future__ import annotations

import pytest

from app.integrations.openai_compatible import OpenAICompatibleVisionProvider
from app.integrations.vision.base import JewelleryScanDetection


def test_jewellery_scan_detection_schema():
    det = JewelleryScanDetection(
        detected_huid="ABC123",
        detected_fineness="916",
        detected_bis_logo=True,
        confidence_score=0.99,
        hallmark_present=True,
        hallmark_standard="INDIAN_BIS",
        detected_marks=["BIS Triangle", "22K916", "ABC123"],
        explanation="Standard BIS hallmarking verified.",
    )
    dumped = det.model_dump()
    assert dumped["detected_huid"] == "ABC123"
    assert dumped["detected_fineness"] == "916"
    assert dumped["detected_bis_logo"] is True
    assert dumped["confidence_score"] == 0.99
    assert dumped["hallmark_present"] is True
    assert dumped["hallmark_standard"] == "INDIAN_BIS"
    assert len(dumped["detected_marks"]) == 3
    assert "Standard BIS" in dumped["explanation"]


def test_jewellery_scan_detection_international_hallmark():
    # Demonstrates accurate handling of UK Birmingham Assay hallmark (user's sample)
    det = JewelleryScanDetection(
        detected_huid=None,
        detected_fineness="750",
        detected_bis_logo=False,
        confidence_score=0.98,
        hallmark_present=True,
        hallmark_standard="INTERNATIONAL_UK",
        detected_marks=[
            "PETRA (Maker's mark)",
            "Crown (Gold standard mark)",
            "750 (18ct fineness)",
            "Anchor (Birmingham Assay Office)",
            "X (2022 Date letter)",
        ],
        explanation="The item exhibits British statutory hallmarks for 18-carat gold (750 purity). No Indian BIS triangular mark or 6-digit HUID are present.",
    )
    assert det.hallmark_present is True
    assert det.detected_fineness == "750"
    assert det.detected_huid is None
    assert det.detected_bis_logo is False
    assert det.hallmark_standard == "INTERNATIONAL_UK"
    assert "British" in det.explanation


def test_jewellery_scan_detection_vintage_pre_huid():
    # Demonstrates pre-2021 Indian hallmark where BIS logo and fineness are present, but no HUID
    det = JewelleryScanDetection(
        detected_huid=None,
        detected_fineness="916",
        detected_bis_logo=True,
        confidence_score=0.95,
        hallmark_present=True,
        hallmark_standard="INDIAN_VINTAGE_PRE_HUID",
        detected_marks=["BIS Triangular Logo", "916", "Assay Centre Logo", "Jeweller Stamp"],
        explanation="Vintage Indian BIS hallmark under pre-July 2021 regulations without 6-character HUID.",
    )
    assert det.hallmark_present is True
    assert det.detected_bis_logo is True
    assert det.detected_huid is None
    assert det.hallmark_standard == "INDIAN_VINTAGE_PRE_HUID"


@pytest.mark.asyncio
async def test_openai_compatible_provider_jewellery_empty():
    provider = OpenAICompatibleVisionProvider(
        base_url="http://127.0.0.1:8045/v1",
        api_key="test-key",
        model="gemini-3.8-flash-high",
    )
    res = await provider.scan_jewellery_marks(b"")
    assert res.detected_huid is None
    assert res.detected_fineness is None
    assert res.detected_bis_logo is False
    assert res.confidence_score == 0.0
    assert res.hallmark_present is False
