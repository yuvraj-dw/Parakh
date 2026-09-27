from __future__ import annotations

from datetime import datetime, timezone

from app.integrations.verification.base import (
    BaseVerificationProvider,
    VerificationResponse,
)
from app.models.verification import VerificationStatus


class OfficialRedirectProvider(BaseVerificationProvider):
    """Fallback provider when official third-party API is not accessible.

    Provides verified redirect URLs to official BIS Care portals rather than fabricating results.
    """

    async def verify_huid(self, huid: str) -> VerificationResponse:
        clean = huid.strip().upper()
        return VerificationResponse(
            status=VerificationStatus.NOT_VERIFIED,
            normalized_identifier=clean,
            source_name="BIS_CARE_OFFICIAL_PORTAL",
            source_url="https://www.bis.gov.in/bis-care-app/",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            notes="Direct automated third-party API is not available. Please verify via official BIS Care App.",
        )

    async def verify_licence(self, licence_no: str) -> VerificationResponse:
        clean = licence_no.strip().upper()
        return VerificationResponse(
            status=VerificationStatus.NOT_VERIFIED,
            normalized_identifier=clean,
            source_name="BIS_MANAK_ONLINE",
            source_url="https://www.manakonline.in/MANAK/SearchLicence",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            notes="Direct automated third-party API is not available. Please verify on official Manakonline portal.",
        )

    async def verify_r_number(self, r_number: str) -> VerificationResponse:
        clean = r_number.strip().upper()
        return VerificationResponse(
            status=VerificationStatus.NOT_VERIFIED,
            normalized_identifier=clean,
            source_name="BIS_CRS_PORTAL",
            source_url="https://www.crsbis.in/BIS/products.do",
            retrieved_at=datetime.now(timezone.utc).isoformat(),
            notes="Direct automated third-party API is not available. Please verify on official CRS portal.",
        )


class BISOfficialApiProvider(BaseVerificationProvider):
    """Stub ready for official government API credentials once authorized."""

    def __init__(self, api_base_url: str = "", api_key: str = ""):
        self.api_base_url = api_base_url
        self.api_key = api_key

    async def verify_huid(self, huid: str) -> VerificationResponse:
        raise NotImplementedError("Official BIS API credentials not yet provisioned.")

    async def verify_licence(self, licence_no: str) -> VerificationResponse:
        raise NotImplementedError("Official BIS API credentials not yet provisioned.")

    async def verify_r_number(self, r_number: str) -> VerificationResponse:
        raise NotImplementedError("Official BIS API credentials not yet provisioned.")
