from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import AppException
from app.dependencies import get_db, get_optional_current_user, get_verification_service
from app.integrations.verification.base import VerificationResponse
from app.models.user import User
from app.models.verification import VerificationType
from app.services.verification_service import VerificationService

router = APIRouter(prefix="/verification", tags=["Verification"])


class HUIDRequest(BaseModel):
    huid: Optional[str] = None
    identifier: Optional[str] = None


class LicenceRequest(BaseModel):
    licence_number: Optional[str] = None
    cml_number: Optional[str] = None
    identifier: Optional[str] = None


class RNumberRequest(BaseModel):
    r_number: Optional[str] = None
    identifier: Optional[str] = None


@router.post("/huid", response_model=VerificationResponse)
async def verify_huid_endpoint(
    payload: HUIDRequest,
    db: AsyncSession = Depends(get_db),
    verification_service: VerificationService = Depends(get_verification_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    ident = payload.huid or payload.identifier
    if not ident or not ident.strip():
        raise AppException("INVALID_INPUT", "Field 'huid' is required", 400)

    return await verification_service.process_verification(
        db=db,
        req_type=VerificationType.HUID,
        identifier=ident.strip(),
        user_id=current_user.id if current_user else None,
    )


@router.post("/licence", response_model=VerificationResponse)
async def verify_licence_endpoint(
    payload: LicenceRequest,
    db: AsyncSession = Depends(get_db),
    verification_service: VerificationService = Depends(get_verification_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    ident = payload.licence_number or payload.cml_number or payload.identifier
    if not ident or not ident.strip():
        raise AppException("INVALID_INPUT", "Field 'licence_number' is required", 400)

    return await verification_service.process_verification(
        db=db,
        req_type=VerificationType.LICENCE,
        identifier=ident.strip(),
        user_id=current_user.id if current_user else None,
    )


@router.post("/r-number", response_model=VerificationResponse)
async def verify_r_number_endpoint(
    payload: RNumberRequest,
    db: AsyncSession = Depends(get_db),
    verification_service: VerificationService = Depends(get_verification_service),
    current_user: Optional[User] = Depends(get_optional_current_user),
):
    ident = payload.r_number or payload.identifier
    if not ident or not ident.strip():
        raise AppException("INVALID_INPUT", "Field 'r_number' is required", 400)

    return await verification_service.process_verification(
        db=db,
        req_type=VerificationType.CRS_R_NUMBER,
        identifier=ident.strip(),
        user_id=current_user.id if current_user else None,
    )
