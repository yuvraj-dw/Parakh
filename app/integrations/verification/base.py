from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from pydantic import BaseModel

from app.models.verification import VerificationStatus


class VerificationResponse(BaseModel):
    status: VerificationStatus
    normalized_identifier: str
    source_name: str
    source_url: Optional[str] = None
    retrieved_at: str
    data: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None


class BaseVerificationProvider(ABC):
    @abstractmethod
    async def verify_huid(self, huid: str) -> VerificationResponse:
        """Verify 6-character alphanumeric Hallmarking Unique Identification (HUID)."""
        pass

    @abstractmethod
    async def verify_licence(self, licence_no: str) -> VerificationResponse:
        """Verify BIS Licence number (e.g., CM/L-1234567)."""
        pass

    @abstractmethod
    async def verify_r_number(self, r_number: str) -> VerificationResponse:
        """Verify Compulsory Registration Scheme (CRS) R-number (e.g., R-12345678)."""
        pass
