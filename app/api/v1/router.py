from __future__ import annotations

from fastapi import APIRouter
from app.api.v1.standards import router as standards_router
from app.api.v1.qco import router as qco_router
from app.api.v1.certification import router as cert_router
from app.api.v1.laboratories import router as lab_router
from app.api.v1.hallmarking import router as ahc_router
from app.api.v1.jewellers import router as jeweller_router

api_v1_router = APIRouter()
api_v1_router.include_router(standards_router)
api_v1_router.include_router(qco_router)
api_v1_router.include_router(cert_router)
api_v1_router.include_router(lab_router)
api_v1_router.include_router(ahc_router)
api_v1_router.include_router(jeweller_router)
