from __future__ import annotations

import hashlib
from datetime import datetime, timezone
from typing import Any, Dict

from app.integrations.verification.base import (
    BaseVerificationProvider,
    VerificationResponse,
)
from app.models.verification import VerificationStatus

# Specific realistic demo HUID records
KNOWN_HUID_DATABASE: Dict[str, Dict[str, Any]] = {
    "ABC123": {
        "huid": "ABC123",
        "jeweller_name": "Zaveri Jewellers Ltd",
        "jeweller_registration": "JWL-MH-1002",
        "ahc_name": "Zaveri Hallmarking Services",
        "ahc_recognition": "AHC-MH-002",
        "fineness": "916 (22K)",
        "article_type": "Gold Bangle",
        "gross_weight": "34.80 grams",
        "net_weight": "34.80 grams",
        "hallmarking_date": "2026-08-14",
    },
    "GLD916": {
        "huid": "GLD916",
        "jeweller_name": "Kalyan Heritage Gems",
        "jeweller_registration": "JWL-DL-2001",
        "ahc_name": "Central Assaying and Hallmarking Centre",
        "ahc_recognition": "AHC-DL-001",
        "fineness": "916 (22K Gold)",
        "article_type": "Gold Handcrafted Bangles (Pair)",
        "gross_weight": "42.50 grams",
        "net_weight": "42.50 grams",
        "hallmarking_date": "2026-07-28",
    },
    "DIA750": {
        "huid": "DIA750",
        "jeweller_name": "Tanishq Retail Vault",
        "jeweller_registration": "JWL-KA-3004",
        "ahc_name": "Deccan Precious Metals Testing Centre",
        "ahc_recognition": "AHC-TS-008",
        "fineness": "750 (18K Gold)",
        "article_type": "18K Solitaire Diamond Ring",
        "gross_weight": "5.45 grams",
        "net_weight": "5.10 grams",
        "hallmarking_date": "2026-09-02",
    },
    "SIL925": {
        "huid": "SIL925",
        "jeweller_name": "Johri Bazaar Jewels",
        "jeweller_registration": "JWL-RJ-6007",
        "ahc_name": "Rajasthan Heritage Assay Centre",
        "ahc_recognition": "AHC-RJ-005",
        "fineness": "925 (Sterling Silver)",
        "article_type": "Sterling Silver Antique Puja Thali Set",
        "gross_weight": "450.00 grams",
        "net_weight": "450.00 grams",
        "hallmarking_date": "2026-06-15",
    },
    "K98L2M": {
        "huid": "K98L2M",
        "jeweller_name": "Malabar Ornaments Pvt Ltd",
        "jeweller_registration": "JWL-KL-4005",
        "ahc_name": "Malabar Assaying & Hallmarking Complex",
        "ahc_recognition": "AHC-KL-004",
        "fineness": "916 (22K Gold)",
        "article_type": "Traditional Kerala Kasu Mala",
        "gross_weight": "28.20 grams",
        "net_weight": "28.20 grams",
        "hallmarking_date": "2026-08-30",
    },
}

JEWELLER_POOL = [
    ("Zaveri Jewellers Ltd", "JWL-MH-1002", "Zaveri Hallmarking Services", "AHC-MH-002"),
    ("Kalyan Heritage Gems", "JWL-DL-2001", "Central Assaying and Hallmarking Centre", "AHC-DL-001"),
    ("Tanishq Retail Vault", "JWL-KA-3004", "Deccan Precious Metals Testing Centre", "AHC-TS-008"),
    ("Malabar Ornaments Pvt Ltd", "JWL-KL-4005", "Malabar Assaying & Hallmarking Complex", "AHC-KL-004"),
    ("Joyalukkas Trade Centre", "JWL-GJ-5006", "Surat Diamond & Gold Assaying Bureau", "AHC-GJ-003"),
    ("Johri Bazaar Jewels", "JWL-RJ-6007", "Rajasthan Heritage Assay Centre", "AHC-RJ-005"),
    ("Senco Gold & Diamonds", "JWL-WB-7008", "Bengal Bullion & Hallmarking Centre", "AHC-WB-006"),
    ("GRT Jewellers Hub", "JWL-TN-8009", "Madurai Gold Assay Laboratory", "AHC-TN-007"),
    ("Bhima Gold House", "JWL-TS-9010", "Deccan Precious Metals Testing Centre", "AHC-TS-008"),
]

ARTICLE_TYPES = [
    ("Gold Bangle", "916 (22K Gold)", "18.50 grams"),
    ("Gold Chain", "916 (22K Gold)", "12.20 grams"),
    ("Gold Ring", "750 (18K Gold)", "4.80 grams"),
    ("Gold Mangalsutra", "916 (22K Gold)", "22.40 grams"),
    ("Gold Earrings (Jhumkas)", "916 (22K Gold)", "8.60 grams"),
    ("Gold Pendant", "750 (18K Gold)", "6.10 grams"),
    ("Silver Bracelet", "925 (Sterling Silver)", "25.00 grams"),
]


class MockVerificationProvider(BaseVerificationProvider):
    async def verify_huid(self, huid: str) -> VerificationResponse:
        clean = huid.strip().upper()
        now = datetime.now(timezone.utc).isoformat()

        # Simulated status checks based on prefix
        if clean.startswith("EXP"):
            return VerificationResponse(
                status=VerificationStatus.EXPIRED,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Hallmarking record has expired or registration validity has lapsed.",
                data={
                    "huid": clean,
                    "jeweller_name": "Royal Heritage Jewels",
                    "status": "EXPIRED",
                },
            )
        if clean.startswith("NOTF"):
            return VerificationResponse(
                status=VerificationStatus.NOT_FOUND,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: HUID not found in BIS Manakonline database. Beware of counterfeit marks.",
            )
        if clean.startswith("ERR"):
            return VerificationResponse(
                status=VerificationStatus.ERROR,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                retrieved_at=now,
                notes="Mock: Simulated upstream verification provider error.",
            )

        # 1. Check known realistic records
        if clean in KNOWN_HUID_DATABASE:
            record = KNOWN_HUID_DATABASE[clean]
            return VerificationResponse(
                status=VerificationStatus.VERIFIED,
                normalized_identifier=clean,
                source_name="MOCK_BIS_PROVIDER",
                source_url="https://manakonline.in/MANAK/huidVerification",
                retrieved_at=now,
                data=record,
                notes="Authentic BIS 6-digit Hallmark Unique Identification (HUID) verified.",
            )

        # 2. Deterministic generator for any 6-digit alphanumeric HUID
        # Uses hash to give consistent details for the same HUID
        h_val = int(hashlib.md5(clean.encode()).hexdigest(), 16)
        jwl = JEWELLER_POOL[h_val % len(JEWELLER_POOL)]
        art = ARTICLE_TYPES[(h_val // 7) % len(ARTICLE_TYPES)]

        day = 1 + (h_val % 28)
        month = 1 + ((h_val // 28) % 12)
        h_date = f"2026-{month:02d}-{day:02d}"

        return VerificationResponse(
            status=VerificationStatus.VERIFIED,
            normalized_identifier=clean,
            source_name="MOCK_BIS_PROVIDER",
            source_url="https://manakonline.in/MANAK/huidVerification",
            retrieved_at=now,
            data={
                "huid": clean,
                "jeweller_name": jwl[0],
                "jeweller_registration": jwl[1],
                "ahc_name": jwl[2],
                "ahc_recognition": jwl[3],
                "fineness": art[1],
                "article_type": art[0],
                "gross_weight": art[2],
                "net_weight": art[2],
                "hallmarking_date": h_date,
            },
            notes="Authentic BIS 6-digit Hallmark Unique Identification (HUID) verified.",
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
