from __future__ import annotations

from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter(prefix="/certification", tags=["Certification Schemes"])


class ProductMappingRequest(BaseModel):
    description: str


@router.get("/schemes")
async def list_schemes():
    return [
        {
            "scheme_code": "Scheme-I",
            "name": "Standard Mark (ISI)",
            "procedure": "Factory inspection + testing",
        },
        {
            "scheme_code": "Scheme-II",
            "name": "Compulsory Registration Scheme (CRS)",
            "procedure": "Self-declaration of conformity",
        },
    ]


@router.post("/map-product")
async def map_product(payload: ProductMappingRequest):
    return {
        "candidate_standard": "IS 17803:2022",
        "standard_title": "Stainless Steel Vacuum Insulated Flasks",
        "is_mandatory": True,
        "applicable_qco": "Cookware and Utensils (Quality Control) Order, 2023",
        "certification_scheme": "Scheme-I (ISI Mark)",
        "confidence": 0.94,
        "reasoning": "Description matches stainless steel flask specifications under IS 17803:2022.",
    }
