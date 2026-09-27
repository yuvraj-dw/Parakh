from __future__ import annotations

import base64
from typing import Optional
from fastapi import APIRouter, Depends, File, Request, UploadFile

from app.dependencies import get_vision_provider
from app.integrations.vision.base import (
    AssayReportData,
    BaseVisionProvider,
    JewelleryScanDetection,
)

router = APIRouter(prefix="/jewellery", tags=["Jewellery"])


@router.post("/scan", response_model=JewelleryScanDetection)
async def scan_jewellery(
    request: Request,
    file: Optional[UploadFile] = File(None),
    provider: BaseVisionProvider = Depends(get_vision_provider),
):
    image_bytes = b""
    if file is not None:
        image_bytes = await file.read()
    else:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                body = await request.json()
                b64_str = body.get("image_base64") or body.get("image")
                if b64_str:
                    image_bytes = base64.b64decode(b64_str)
            except Exception:
                pass
        if not image_bytes:
            image_bytes = await request.body()

    return await provider.scan_jewellery_marks(image_bytes)


@router.post("/assay-report", response_model=AssayReportData)
async def parse_assay_report(
    request: Request,
    file: Optional[UploadFile] = File(None),
    provider: BaseVisionProvider = Depends(get_vision_provider),
):
    file_bytes = b""
    mime_type = "application/pdf"
    if file is not None:
        file_bytes = await file.read()
        if file.content_type:
            mime_type = file.content_type
    else:
        content_type = request.headers.get("content-type", "")
        if "application/json" in content_type:
            try:
                body = await request.json()
                b64_str = body.get("report_base64") or body.get("file")
                if b64_str:
                    file_bytes = base64.b64decode(b64_str)
                mime_type = body.get("mime_type", mime_type)
            except Exception:
                pass
        if not file_bytes:
            file_bytes = await request.body()

    return await provider.parse_assay_report(file_bytes, mime_type=mime_type)
