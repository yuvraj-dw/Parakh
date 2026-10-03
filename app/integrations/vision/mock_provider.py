from __future__ import annotations

from app.integrations.vision.base import (
    AssayReportData,
    BaseVisionProvider,
    JewelleryScanDetection,
)


class MockVisionProvider(BaseVisionProvider):
    async def scan_jewellery_marks(self, image_bytes: bytes) -> JewelleryScanDetection:
        if not image_bytes:
            return JewelleryScanDetection(
                detected_huid=None,
                detected_fineness=None,
                detected_bis_logo=False,
                confidence_score=0.0,
                hallmark_present=False,
                hallmark_standard=None,
                detected_marks=[],
                explanation="No image data provided for hallmark inspection.",
            )

        return JewelleryScanDetection(
            detected_huid="ABC123",
            detected_fineness="916",
            detected_bis_logo=True,
            confidence_score=0.95,
            hallmark_present=True,
            hallmark_standard="INDIAN_BIS",
            detected_marks=["BIS Standard Mark", "22K916", "ABC123"],
            explanation="Authentic Indian BIS hallmarking detected with official triangular mark, 916 fineness, and HUID ABC123.",
        )

    async def parse_assay_report(self, file_bytes: bytes, mime_type: str) -> AssayReportData:
        if not file_bytes:
            return AssayReportData()

        return AssayReportData(
            report_number="AR-2026-9081",
            centre_name="Apex Hallmarking & Assaying Centre",
            metal="Gold",
            reported_purity="22 Karat (91.67%)",
            test_date="2026-08-15",
            sample_description="Yellow gold necklace sample",
        )
