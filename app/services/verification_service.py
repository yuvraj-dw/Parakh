from __future__ import annotations

from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession

from app.integrations.verification.base import (
    BaseVerificationProvider,
    VerificationResponse,
)
from app.models.verification import (
    VerificationRequest,
    VerificationResult,
    VerificationStatus,
    VerificationType,
)


class VerificationService:
    def __init__(self, provider: BaseVerificationProvider):
        self.provider = provider

    async def process_verification(
        self,
        db: AsyncSession,
        req_type: VerificationType,
        identifier: str,
        user_id: str | None = None,
    ) -> VerificationResponse:
        # 1. Normalize identifier
        clean_id = identifier.strip().upper()

        # 2. Call provider
        if req_type == VerificationType.HUID:
            resp = await self.provider.verify_huid(clean_id)
        elif req_type == VerificationType.LICENCE:
            resp = await self.provider.verify_licence(clean_id)
        elif req_type == VerificationType.CRS_R_NUMBER:
            resp = await self.provider.verify_r_number(clean_id)
        else:
            resp = VerificationResponse(
                status=VerificationStatus.ERROR,
                normalized_identifier=clean_id,
                source_name="UNKNOWN",
                retrieved_at=datetime.now(timezone.utc).isoformat(),
                notes=f"Unknown verification type: {req_type}",
            )

        # 3. Save audit request and result
        req_record = VerificationRequest(
            request_type=req_type,
            identifier=clean_id,
            user_id=user_id,
            status=resp.status,
            provider_name=resp.source_name,
        )
        db.add(req_record)
        await db.flush()

        res_record = VerificationResult(
            request_id=req_record.id,
            raw_response=resp.data,
            normalized_data=resp.data,
            verified_at=resp.retrieved_at,
            source_url=resp.source_url,
            notes=resp.notes,
        )
        db.add(res_record)
        await db.commit()

        return resp
