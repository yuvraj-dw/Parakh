from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Optional
from pydantic import BaseModel, Field


class JewelleryScanDetection(BaseModel):
    detected_huid: Optional[str] = None
    detected_fineness: Optional[str] = None
    detected_bis_logo: bool = False
    confidence_score: float = Field(default=0.0, ge=0.0, le=1.0)


class AssayReportData(BaseModel):
    report_number: Optional[str] = None
    centre_name: Optional[str] = None
    metal: Optional[str] = None
    reported_purity: Optional[str] = None
    test_date: Optional[str] = None
    sample_description: Optional[str] = None


class BaseVisionProvider(ABC):
    @abstractmethod
    async def scan_jewellery_marks(self, image_bytes: bytes) -> JewelleryScanDetection:
        """Analyze jewellery laser hallmarks to detect HUID, purity/fineness mark, and BIS logo."""
        pass

    @abstractmethod
    async def parse_assay_report(self, file_bytes: bytes, mime_type: str) -> AssayReportData:
        """Parse structured assay test report PDFs/scans to extract metallurgical parameters."""
        pass
