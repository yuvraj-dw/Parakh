from __future__ import annotations

from datetime import date
from typing import Optional
from pydantic import BaseModel


class LaboratoryScopeOut(BaseModel):
    id: str
    laboratory_id: str
    is_number: str
    product_name: Optional[str] = None
    test_name: Optional[str] = None
    parameter: Optional[str] = None
    capability_details: Optional[str] = None
    limit_of_detection: Optional[str] = None

    model_config = {"from_attributes": True}


class LaboratoryOut(BaseModel):
    id: str
    recognition_code: str
    name: str
    address: Optional[str] = None
    city: str
    district: Optional[str] = None
    state: str
    pincode: Optional[str] = None
    status: str
    valid_from: Optional[date] = None
    valid_until: Optional[date] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    distance_km: Optional[float] = None
    maps_url: Optional[str] = None

    model_config = {"from_attributes": True}
