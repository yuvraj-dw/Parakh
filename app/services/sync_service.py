from __future__ import annotations

import logging
from datetime import date, datetime, timezone
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.sync import SyncError, SyncRun, SyncStatus
from app.models.standard import Standard, StandardStatus
from app.models.laboratory import Laboratory, LabStatus
from app.models.hallmarking import AHCCentre, CentreStatus, Jeweller, JewellerStatus
from app.models.qco import QCO, QCOStatus
from app.utils.normalizers import normalize_is_number, normalize_state, normalize_text

logger = logging.getLogger(__name__)


class SyncResult:
    def __init__(
        self,
        status: SyncStatus,
        records_seen: int,
        records_created: int,
        records_updated: int,
        records_deactivated: int = 0,
        errors: int = 0,
        sync_run_id: Optional[str] = None,
    ):
        self.status = status
        self.records_seen = records_seen
        self.records_created = records_created
        self.records_updated = records_updated
        self.records_deactivated = records_deactivated
        self.errors = errors
        self.sync_run_id = sync_run_id


class SyncService:
    async def fetch_records(self, dataset_name: str) -> list[dict[str, Any]]:
        """Fetch feed/seed records for a dataset."""
        if dataset_name == "standards":
            return [
                {
                    "is_number": "IS 17803:2022",
                    "title": "Stainless Steel Cookware and Flasks",
                    "year": 2022,
                    "source_url": "https://bis.gov.in/standards/17803",
                },
                {
                    "is_number": "IS 15820:2009",
                    "title": "General Requirements for Assaying and Hallmarking Centres",
                    "year": 2009,
                    "source_url": "https://bis.gov.in/standards/15820",
                },
                {
                    "is_number": "IS 1293:2019",
                    "title": "Plugs and Socket-Outlets",
                    "year": 2019,
                    "source_url": "https://bis.gov.in/standards/1293",
                },
            ]
        elif dataset_name == "laboratories":
            return [
                {
                    "recognition_code": "LAB-DEL-001",
                    "name": "Central BIS Testing Laboratory",
                    "city": "New Delhi",
                    "state": "Delhi",
                }
            ]
        elif dataset_name == "ahc_centres":
            return [
                {
                    "recognition_number": "AHC-DEL-001",
                    "name": "Delhi Central Assaying Centre",
                    "city": "New Delhi",
                    "state": "Delhi",
                }
            ]
        elif dataset_name == "jewellers":
            return [
                {
                    "registration_number": "JWL-DEL-001",
                    "name": "Delhi Jewellers Guild",
                    "city": "New Delhi",
                    "state": "Delhi",
                }
            ]
        elif dataset_name == "qcos":
            return [
                {
                    "qco_number": "S.O. 1234(E)",
                    "title": "Stainless Steel Products Quality Control Order",
                    "product_name": "Stainless Steel Flasks",
                    "is_number": "IS 17803",
                    "ministry": "Ministry of Commerce and Industry",
                    "effective_date": date.today().isoformat(),
                }
            ]
        return []

    async def sync_dataset(
        self,
        dataset_name: str,
        raw_records: Optional[list[dict[str, Any]]] = None,
        db_session: Optional[AsyncSession] = None,
        source_name: str = "MOCK_FEED",
    ) -> SyncResult:
        if raw_records is None:
            raw_records = await self.fetch_records(dataset_name)

        seen = len(raw_records)
        created = 0
        updated = 0
        deactivated = 0
        err_count = 0

        sync_run: Optional[SyncRun] = None
        if db_session is not None:
            sync_run = SyncRun(
                dataset=dataset_name,
                status=SyncStatus.RUNNING,
                records_seen=seen,
                source=source_name,
                started_at=datetime.now(timezone.utc),
            )
            db_session.add(sync_run)
            await db_session.flush()

        for item in raw_records:
            try:
                if not isinstance(item, dict):
                    raise ValueError(f"Record must be a dictionary, got {type(item).__name__}")

                if db_session is None:
                    # Dry-run validation and normalization
                    self._normalize_and_validate(dataset_name, item)
                    created += 1
                else:
                    item_created, item_updated = await self._upsert_record(
                        dataset_name=dataset_name,
                        item=item,
                        db_session=db_session,
                        source_name=source_name,
                    )
                    if item_created:
                        created += 1
                    elif item_updated:
                        updated += 1

            except Exception as e:
                err_count += 1
                logger.warning(f"Error syncing record in {dataset_name}: {e}")
                if db_session is not None and sync_run is not None:
                    ident = (
                        item.get("is_number")
                        or item.get("recognition_code")
                        or item.get("recognition_number")
                        or item.get("registration_number")
                        or item.get("qco_number")
                        or item.get("id")
                        if isinstance(item, dict)
                        else None
                    )
                    error_entry = SyncError(
                        sync_run_id=sync_run.id,
                        item_identifier=str(ident) if ident else None,
                        error_type=(
                            "VALIDATION_ERROR"
                            if isinstance(e, (ValueError, KeyError))
                            else "PROCESSING_ERROR"
                        ),
                        message=str(e),
                        raw_payload=item if isinstance(item, dict) else None,
                    )
                    db_session.add(error_entry)

        # Compute status
        if err_count == 0:
            final_status = SyncStatus.SUCCESS
        elif created > 0 or updated > 0:
            final_status = SyncStatus.PARTIAL
        else:
            final_status = SyncStatus.FAILED

        if db_session is not None and sync_run is not None:
            sync_run.status = final_status
            sync_run.records_seen = seen
            sync_run.records_created = created
            sync_run.records_updated = updated
            sync_run.records_deactivated = deactivated
            sync_run.completed_at = datetime.now(timezone.utc)
            await db_session.commit()

        return SyncResult(
            status=final_status,
            records_seen=seen,
            records_created=created,
            records_updated=updated,
            records_deactivated=deactivated,
            errors=err_count,
            sync_run_id=sync_run.id if sync_run else None,
        )

    def _normalize_and_validate(self, dataset_name: str, item: dict[str, Any]) -> None:
        if dataset_name == "standards":
            if not item.get("is_number"):
                raise ValueError("Record missing required field: 'is_number'")
            item["is_number"] = normalize_is_number(item["is_number"])
            if not item["is_number"]:
                raise ValueError("Record 'is_number' is empty after normalization")
            if "title" in item and item["title"]:
                item["title"] = normalize_text(item["title"])

        elif dataset_name == "laboratories":
            if not item.get("recognition_code"):
                raise ValueError("Record missing required field: 'recognition_code'")
            if not item.get("name"):
                raise ValueError("Record missing required field: 'name'")
            if not item.get("city"):
                raise ValueError("Record missing required field: 'city'")
            if not item.get("state"):
                raise ValueError("Record missing required field: 'state'")
            item["name"] = normalize_text(item["name"])
            item["city"] = normalize_text(item["city"])
            item["state"] = normalize_state(item["state"])

        elif dataset_name == "ahc_centres":
            if not item.get("recognition_number"):
                raise ValueError("Record missing required field: 'recognition_number'")
            if not item.get("name"):
                raise ValueError("Record missing required field: 'name'")
            if not item.get("city"):
                raise ValueError("Record missing required field: 'city'")
            if not item.get("state"):
                raise ValueError("Record missing required field: 'state'")
            item["name"] = normalize_text(item["name"])
            item["city"] = normalize_text(item["city"])
            item["state"] = normalize_state(item["state"])

        elif dataset_name == "jewellers":
            if not item.get("registration_number"):
                raise ValueError("Record missing required field: 'registration_number'")
            if not item.get("name"):
                raise ValueError("Record missing required field: 'name'")
            if not item.get("city"):
                raise ValueError("Record missing required field: 'city'")
            if not item.get("state"):
                raise ValueError("Record missing required field: 'state'")
            item["name"] = normalize_text(item["name"])
            item["city"] = normalize_text(item["city"])
            item["state"] = normalize_state(item["state"])

        elif dataset_name == "qcos":
            if not item.get("qco_number"):
                raise ValueError("Record missing required field: 'qco_number'")
            if not item.get("title"):
                raise ValueError("Record missing required field: 'title'")
            if not item.get("ministry"):
                raise ValueError("Record missing required field: 'ministry'")
            if not item.get("effective_date"):
                raise ValueError("Record missing required field: 'effective_date'")
            item["title"] = normalize_text(item["title"])
            item["ministry"] = normalize_text(item["ministry"])

    async def _upsert_record(
        self,
        dataset_name: str,
        item: dict[str, Any],
        db_session: AsyncSession,
        source_name: str,
    ) -> Tuple[bool, bool]:
        """Returns (is_created, is_updated)."""
        self._normalize_and_validate(dataset_name, item)
        now_utc = datetime.now(timezone.utc)

        if dataset_name == "standards":
            is_num = item["is_number"]
            stmt = select(Standard).where(Standard.is_number == is_num)
            existing = (await db_session.execute(stmt)).scalar_one_or_none()

            scope_val = item.get("scope") or item.get("description")
            year_val = item.get("year")
            source_url = item.get("source_url")

            if existing:
                if "title" in item and item["title"]:
                    existing.title = item["title"]
                if scope_val is not None:
                    existing.scope = scope_val
                if "status" in item and item["status"]:
                    existing.status = (
                        StandardStatus(item["status"])
                        if isinstance(item["status"], str)
                        else item["status"]
                    )
                if year_val is not None:
                    existing.year = int(year_val)
                if source_url is not None:
                    existing.source_url = source_url
                existing.last_verified_at = now_utc
                return False, True
            else:
                std = Standard(
                    is_number=is_num,
                    title=item.get("title", is_num),
                    year=int(year_val) if year_val is not None else None,
                    status=(
                        StandardStatus(item["status"])
                        if "status" in item and item["status"]
                        else StandardStatus.ACTIVE
                    ),
                    scope=scope_val,
                    source_name=source_name,
                    source_url=source_url,
                    last_verified_at=now_utc,
                )
                db_session.add(std)
                return True, False

        elif dataset_name == "laboratories":
            code = item["recognition_code"]
            stmt = select(Laboratory).where(Laboratory.recognition_code == code)
            existing = (await db_session.execute(stmt)).scalar_one_or_none()

            v_from = item.get("valid_from")
            if isinstance(v_from, str):
                v_from = date.fromisoformat(v_from)
            v_until = item.get("valid_until")
            if isinstance(v_until, str):
                v_until = date.fromisoformat(v_until)

            if existing:
                existing.name = item["name"]
                existing.city = item["city"]
                existing.state = item["state"]
                if "address" in item:
                    existing.address = item["address"]
                if "district" in item:
                    existing.district = item["district"]
                if "pincode" in item:
                    existing.pincode = item["pincode"]
                if "status" in item and item["status"]:
                    existing.status = (
                        LabStatus(item["status"])
                        if isinstance(item["status"], str)
                        else item["status"]
                    )
                if v_from:
                    existing.valid_from = v_from
                if v_until:
                    existing.valid_until = v_until
                if "contact_details" in item:
                    existing.contact_details = item["contact_details"]
                existing.last_verified_at = now_utc
                return False, True
            else:
                lab = Laboratory(
                    recognition_code=code,
                    name=item["name"],
                    city=item["city"],
                    state=item["state"],
                    address=item.get("address"),
                    district=item.get("district"),
                    pincode=item.get("pincode"),
                    status=(
                        LabStatus(item["status"])
                        if "status" in item and item["status"]
                        else LabStatus.RECOGNIZED
                    ),
                    valid_from=v_from,
                    valid_until=v_until,
                    contact_details=item.get("contact_details", {}),
                    source_name=source_name,
                    last_verified_at=now_utc,
                )
                db_session.add(lab)
                return True, False

        elif dataset_name == "ahc_centres":
            num = item["recognition_number"]
            stmt = select(AHCCentre).where(AHCCentre.recognition_number == num)
            existing = (await db_session.execute(stmt)).scalar_one_or_none()

            v_from = item.get("valid_from")
            if isinstance(v_from, str):
                v_from = date.fromisoformat(v_from)
            v_until = item.get("valid_until")
            if isinstance(v_until, str):
                v_until = date.fromisoformat(v_until)

            if existing:
                existing.name = item["name"]
                existing.city = item["city"]
                existing.state = item["state"]
                if "address" in item:
                    existing.address = item["address"]
                if "district" in item:
                    existing.district = item["district"]
                if "pincode" in item:
                    existing.pincode = item["pincode"]
                if "status" in item and item["status"]:
                    existing.status = (
                        CentreStatus(item["status"])
                        if isinstance(item["status"], str)
                        else item["status"]
                    )
                if "metal_capabilities" in item:
                    existing.metal_capabilities = item["metal_capabilities"]
                if v_from:
                    existing.valid_from = v_from
                if v_until:
                    existing.valid_until = v_until
                existing.last_verified_at = now_utc
                return False, True
            else:
                ahc = AHCCentre(
                    recognition_number=num,
                    name=item["name"],
                    city=item["city"],
                    state=item["state"],
                    address=item.get("address"),
                    district=item.get("district"),
                    pincode=item.get("pincode"),
                    status=(
                        CentreStatus(item["status"])
                        if "status" in item and item["status"]
                        else CentreStatus.ACTIVE
                    ),
                    valid_from=v_from,
                    valid_until=v_until,
                    metal_capabilities=item.get("metal_capabilities", []),
                    source_name=source_name,
                    last_verified_at=now_utc,
                )
                db_session.add(ahc)
                return True, False

        elif dataset_name == "jewellers":
            num = item["registration_number"]
            stmt = select(Jeweller).where(Jeweller.registration_number == num)
            existing = (await db_session.execute(stmt)).scalar_one_or_none()

            v_from = item.get("valid_from")
            if isinstance(v_from, str):
                v_from = date.fromisoformat(v_from)
            v_until = item.get("valid_until")
            if isinstance(v_until, str):
                v_until = date.fromisoformat(v_until)

            if existing:
                existing.name = item["name"]
                existing.city = item["city"]
                existing.state = item["state"]
                if "address" in item:
                    existing.address = item["address"]
                if "district" in item:
                    existing.district = item["district"]
                if "pincode" in item:
                    existing.pincode = item["pincode"]
                if "metal_category" in item:
                    existing.metal_category = item["metal_category"]
                if "status" in item and item["status"]:
                    existing.status = (
                        JewellerStatus(item["status"])
                        if isinstance(item["status"], str)
                        else item["status"]
                    )
                if v_from:
                    existing.valid_from = v_from
                if v_until:
                    existing.valid_until = v_until
                existing.last_verified_at = now_utc
                return False, True
            else:
                jwl = Jeweller(
                    registration_number=num,
                    name=item["name"],
                    city=item["city"],
                    state=item["state"],
                    address=item.get("address"),
                    district=item.get("district"),
                    pincode=item.get("pincode"),
                    metal_category=item.get("metal_category"),
                    status=(
                        JewellerStatus(item["status"])
                        if "status" in item and item["status"]
                        else JewellerStatus.VALID
                    ),
                    valid_from=v_from,
                    valid_until=v_until,
                    source_name=source_name,
                    last_verified_at=now_utc,
                )
                db_session.add(jwl)
                return True, False

        elif dataset_name == "qcos":
            qco_num = item["qco_number"]
            stmt = select(QCO).where(QCO.qco_number == qco_num)
            existing = (await db_session.execute(stmt)).scalar_one_or_none()

            eff_date = item.get("effective_date")
            if isinstance(eff_date, str):
                eff_date = date.fromisoformat(eff_date)
            notif_date = item.get("notification_date")
            if isinstance(notif_date, str):
                notif_date = date.fromisoformat(notif_date)

            prod_name = item.get("product_name") or item.get("title") or "General"
            is_num = item.get("is_number") or "IS 0000"

            if existing:
                existing.title = item["title"]
                existing.ministry = item["ministry"]
                if "product_name" in item:
                    existing.product_name = item["product_name"]
                if "is_number" in item:
                    existing.is_number = normalize_is_number(item["is_number"])
                if notif_date:
                    existing.notification_date = notif_date
                if eff_date:
                    existing.effective_date = eff_date
                if "status" in item and item["status"]:
                    existing.status = (
                        QCOStatus(item["status"])
                        if isinstance(item["status"], str)
                        else item["status"]
                    )
                if "is_superseded" in item:
                    existing.is_superseded = bool(item["is_superseded"])
                if "is_withdrawn" in item:
                    existing.is_withdrawn = bool(item["is_withdrawn"])
                existing.last_verified_at = now_utc
                return False, True
            else:
                qco = QCO(
                    qco_number=qco_num,
                    title=item["title"],
                    product_name=prod_name,
                    is_number=normalize_is_number(is_num),
                    ministry=item["ministry"],
                    notification_number=item.get("notification_number"),
                    notification_date=notif_date,
                    effective_date=eff_date,
                    status=(
                        QCOStatus(item["status"])
                        if "status" in item and item["status"]
                        else QCOStatus.ACTIVE
                    ),
                    is_superseded=bool(item.get("is_superseded", False)),
                    is_withdrawn=bool(item.get("is_withdrawn", False)),
                    source_name=source_name,
                    last_verified_at=now_utc,
                )
                db_session.add(qco)
                return True, False

        return False, False
