from __future__ import annotations

from typing import List, Optional
from pydantic import BaseModel


class AHCCentreOut(BaseModel):
    id: str
    recognition_number: str
    name: str
    city: str
    district: Optional[str] = None
    state: str
    status: str
    metal_capabilities: Optional[List[str]] = []

    model_config = {"from_attributes": True}


class JewellerOut(BaseModel):
    id: str
    registration_number: str
    name: str
    city: str
    district: Optional[str] = None
    state: str
    metal_category: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}
