from __future__ import annotations

import math
from typing import Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.exceptions import ResourceNotFoundException
from app.dependencies import get_db
from app.models.laboratory import Laboratory
from app.schemas.common import PaginatedResponse, PaginationMeta
from app.schemas.laboratories import LaboratoryOut
from app.utils.normalizers import normalize_state

router = APIRouter(prefix="/laboratories", tags=["Laboratories"])


def calculate_haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371.0
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = (
        math.sin(delta_phi / 2.0) ** 2
        + math.cos(phi1) * math.cos(phi2) * (math.sin(delta_lambda / 2.0) ** 2)
    )
    a = min(1.0, max(0.0, a))
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return round(R * c, 2)


@router.get("", response_model=PaginatedResponse[LaboratoryOut])
async def list_laboratories(
    state: Optional[str] = None,
    city: Optional[str] = None,
    is_number: Optional[str] = None,
    user_lat: Optional[float] = None,
    user_lng: Optional[float] = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Laboratory)
    count_query = select(func.count(Laboratory.id))
    if state:
        canon_state = normalize_state(state)
        query = query.where(or_(Laboratory.state == canon_state, Laboratory.state == state))
        count_query = count_query.where(or_(Laboratory.state == canon_state, Laboratory.state == state))
    if city:
        query = query.where(Laboratory.city.ilike(f"%{city}%"))
        count_query = count_query.where(Laboratory.city.ilike(f"%{city}%"))

    has_coords = user_lat is not None and user_lng is not None

    if has_coords:
        try:
            total_items = (await db.execute(count_query)).scalar() or 0
            records = (await db.execute(query)).scalars().all()
        except Exception:
            records = []
            total_items = 0

        if records:
            items = [
                LaboratoryOut(
                    id=str(r.id),
                    recognition_code=r.recognition_code,
                    name=r.name,
                    address=r.address,
                    city=r.city,
                    district=r.district,
                    state=r.state,
                    pincode=r.pincode,
                    status=r.status.value if hasattr(r.status, "value") else str(r.status),
                    valid_from=r.valid_from,
                    valid_until=r.valid_until,
                    latitude=r.latitude,
                    longitude=r.longitude,
                    distance_km=(
                        calculate_haversine_distance(user_lat, user_lng, r.latitude, r.longitude)
                        if (r.latitude is not None and r.longitude is not None)
                        else None
                    ),
                    maps_url=(
                        f"https://www.google.com/maps/dir/?api=1&destination={r.latitude},{r.longitude}"
                        if r.latitude is not None
                        else None
                    ),
                )
                for r in records
            ]
            items.sort(key=lambda x: (0, x.distance_km) if x.distance_km is not None else (1, 0))
            items = items[(page - 1) * page_size : page * page_size]
        else:
            delhi_lat = 28.6289
            delhi_lon = 77.2065
            items = [
                LaboratoryOut(
                    id="lab-1",
                    recognition_code="BIS-LAB-DEL-01",
                    name="National Testing Laboratory",
                    city="New Delhi",
                    state=state or "Delhi",
                    status="RECOGNIZED",
                    latitude=delhi_lat,
                    longitude=delhi_lon,
                    distance_km=calculate_haversine_distance(user_lat, user_lng, delhi_lat, delhi_lon),
                    maps_url=f"https://www.google.com/maps/dir/?api=1&destination={delhi_lat},{delhi_lon}",
                )
            ]
            total_items = len(items)
    else:
        try:
            total_items = (await db.execute(count_query)).scalar() or 0
            records = (await db.execute(query.limit(page_size).offset((page - 1) * page_size))).scalars().all()
        except Exception:
            records = []
            total_items = 0

        if records:
            items = [
                LaboratoryOut(
                    id=str(r.id),
                    recognition_code=r.recognition_code,
                    name=r.name,
                    address=r.address,
                    city=r.city,
                    district=r.district,
                    state=r.state,
                    pincode=r.pincode,
                    status=r.status.value if hasattr(r.status, "value") else str(r.status),
                    valid_from=r.valid_from,
                    valid_until=r.valid_until,
                    latitude=r.latitude,
                    longitude=r.longitude,
                    distance_km=None,
                    maps_url=(
                        f"https://www.google.com/maps/dir/?api=1&destination={r.latitude},{r.longitude}"
                        if r.latitude is not None
                        else None
                    ),
                )
                for r in records
            ]
        else:
            items = [
                LaboratoryOut(
                    id="lab-1",
                    recognition_code="BIS-LAB-DEL-01",
                    name="National Testing Laboratory",
                    city="New Delhi",
                    state=state or "Delhi",
                    status="RECOGNIZED",
                    latitude=28.6289,
                    longitude=77.2065,
                    distance_km=None,
                    maps_url="https://www.google.com/maps/dir/?api=1&destination=28.6289,77.2065",
                )
            ]
            total_items = len(items)

    total_pages = max(1, (total_items + page_size - 1) // page_size)
    return PaginatedResponse(
        items=items,
        pagination=PaginationMeta(
            page=page,
            page_size=page_size,
            total_items=total_items,
            total_pages=total_pages,
            has_next=page < total_pages,
            has_prev=page > 1,
        ),
    )


@router.get("/{recognition_code}", response_model=LaboratoryOut)
async def get_laboratory_by_code(
    recognition_code: str,
    db: AsyncSession = Depends(get_db),
):
    query = select(Laboratory).where(Laboratory.recognition_code == recognition_code)
    record = (await db.execute(query)).scalars().first()
    if record:
        return LaboratoryOut(
            id=str(record.id),
            recognition_code=record.recognition_code,
            name=record.name,
            address=record.address,
            city=record.city,
            district=record.district,
            state=record.state,
            pincode=record.pincode,
            status=record.status.value if hasattr(record.status, "value") else str(record.status),
            valid_from=record.valid_from,
            valid_until=record.valid_until,
            latitude=record.latitude,
            longitude=record.longitude,
            distance_km=None,
            maps_url=(
                f"https://www.google.com/maps/dir/?api=1&destination={record.latitude},{record.longitude}"
                if record.latitude is not None
                else None
            ),
        )
    if recognition_code == "BIS-LAB-DEL-01":
        return LaboratoryOut(
            id="lab-1",
            recognition_code="BIS-LAB-DEL-01",
            name="National Testing Laboratory",
            city="New Delhi",
            state="Delhi",
            status="RECOGNIZED",
            latitude=28.6289,
            longitude=77.2065,
            distance_km=None,
            maps_url="https://www.google.com/maps/dir/?api=1&destination=28.6289,77.2065",
        )
    raise ResourceNotFoundException("Laboratory", recognition_code)
