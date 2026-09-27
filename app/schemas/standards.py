from __future__ import annotations

from typing import Optional
from pydantic import BaseModel


class StandardOut(BaseModel):
    id: str
    is_number: str
    title: str
    year: Optional[int] = None
    status: str
    scope: Optional[str] = None
    source_name: str = "MANUAL"
    source_url: Optional[str] = None
    last_verified_at: str

    model_config = {"from_attributes": True}
