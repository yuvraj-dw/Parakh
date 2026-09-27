from __future__ import annotations

from datetime import datetime, timezone
from typing import Any, Dict

from app.integrations.verification.base import (
    BaseVerificationProvider,
    VerificationResponse,
)
from app.models.verification import VerificationStatus


class MockVerificationProvider(BaseVerificationProvider):
    async def verify_huid(self, huid: str) -> VerificationResponse:
        clean = huid.strip().upper()
        now = datetime.now(timezone.utc).isoformat()
        if clean.startswith("EXP"):
            return VerificationResponse(
                status=VerificationStatus.EXPIRED,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Hallmarking record has expired.",
            )
        if clean.startswith("NOTF"):
            return VerificationResponse(
                status=VerificationStatus.NOT_FOUND,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: HUID not found in database.",
            )
        if clean.startswith("ERR"):
            return VerificationResponse(
                status=VerificationStatus.ERROR,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Simulated upstream verification provider error.",
            )

        return VerificationResponse(
            status=VerificationStatus.VERIFIED,
            normalized_identifier=clean,
            source_name="MOCK_BIS_PROVIDER",
            source_url="https://manakonline.in/mock/huid",
            retrieved_at=now,
            data={
                "huid": clean,
                "jeweller_name": "Mock Authorized Jewellers Ltd.",
                "ahc_name": "National Assaying & Hallmarking Centre #1",
                "fineness": "916 (22K)",
                "article_type": "Gold Bangle",
            },
        )

    async def verify_licence(self, licence_no: str) -> VerificationResponse:
        clean = licence_no.strip().upper()
        now = datetime.now(timezone.utc).isoformat()
        if "EXPIRED" in clean or clean.startswith("EXP"):
            return VerificationResponse(
                status=VerificationStatus.EXPIRED,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Licence has expired.",
            )
        if clean.startswith("NOTF"):
            return VerificationResponse(
                status=VerificationStatus.NOT_FOUND,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Licence not found in database.",
            )
        if clean.startswith("ERR"):
            return VerificationResponse(
                status=VerificationStatus.ERROR,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Simulated upstream verification provider error.",
            )

        return VerificationResponse(
            status=VerificationStatus.VERIFIED,
            normalized_identifier=clean,
            source_name="MOCK_BIS_PROVIDER",
            source_url="https://manakonline.in/mock/licence",
            retrieved_at=now,
            data={
                "licence_no": clean,
                "grantee_name": "Standard Manufacturer India Pvt Ltd",
                "is_number": "IS 17803:2022",
                "validity": "2027-12-31",
            },
        )

    async def verify_r_number(self, r_number: str) -> VerificationResponse:
        clean = r_number.strip().upper()
        now = datetime.now(timezone.utc).isoformat()
        if "EXPIRED" in clean or clean.startswith("EXP"):
            return VerificationResponse(
                status=VerificationStatus.EXPIRED,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: CRS registration has expired.",
            )
        if clean.startswith("NOTF"):
            return VerificationResponse(
                status=VerificationStatus.NOT_FOUND,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: CRS registration not found in database.",
            )
        if clean.startswith("ERR"):
            return VerificationResponse(
                status=VerificationStatus.ERROR,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Simulated upstream verification provider error.",
            )

        return VerificationResponse(
            status=VerificationStatus.VERIFIED,
            normalized_identifier=clean,
            source_name="MOCK_BIS_PROVIDER",
            source_url="https://www.crsbis.in/mock/r-number",
            retrieved_at=now,
            data={
                "r_number": clean,
                "product": "Power Adaptors",
                "is_number": "IS 13252 (Part 1):2010",
                "brand": "TechCorp",
            },
        )
