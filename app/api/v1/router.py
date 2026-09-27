from __future__ import annotations

from fastapi import APIRouter
from app.api.v1.standards import router as standards_router
from app.api.v1.qco import router as qco_router
from app.api.v1.certification import router as cert_router
from app.api.v1.laboratories import router as lab_router
from app.api.v1.hallmarking import router as ahc_router
from app.api.v1.jewellers import router as jeweller_router
from app.api.v1.auth import router as auth_router
from app.api.v1.verification import router as verification_router
from app.api.v1.jewellery import router as jewellery_router
from app.api.v1.chat import router as chat_router
from app.api.v1.admin import router as admin_router

api_v1_router = APIRouter()
api_v1_router.include_router(standards_router)
api_v1_router.include_router(qco_router)
api_v1_router.include_router(cert_router)
api_v1_router.include_router(lab_router)
api_v1_router.include_router(ahc_router)
api_v1_router.include_router(jeweller_router)
api_v1_router.include_router(auth_router)
api_v1_router.include_router(verification_router)
api_v1_router.include_router(jewellery_router)
api_v1_router.include_router(chat_router)
api_v1_router.include_router(admin_router)
