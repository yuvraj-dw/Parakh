"""Seed realistic Indian Standards, QCOs, Laboratories, and Jewellers data."""
from __future__ import annotations

import asyncio
import logging
from datetime import date
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from app.dependencies import async_session_maker
from app.models.standard import Standard, StandardStatus
from app.models.qco import QCO, QCOStatus
from app.models.laboratory import Laboratory, LabStatus
from app.models.hallmarking import AHCCentre, Jeweller, CentreStatus, JewellerStatus
from app.models.certification import CertificationScheme
from app.models.product import Product, ProductStandardMapping

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


async def seed(session_factory: Optional[async_sessionmaker[AsyncSession]] = None) -> None:
    maker = session_factory or async_session_maker
    async with maker() as session:
        logger.info("Seeding BIS standards...")
        stmt_std = select(Standard).where(Standard.is_number == "IS 17803:2022")
        existing_std = (await session.execute(stmt_std)).scalar_one_or_none()
        if not existing_std:
            std = Standard(
                is_number="IS 17803:2022",
                title="Stainless Steel Vacuum Insulated Flasks and Bottles",
                year=2022,
                status=StandardStatus.ACTIVE,
                scope="Specifies material, performance, and thermal insulation criteria.",
                source_name="BIS_MANAK_ONLINE",
                source_url="https://standardsbis.bsbedge.com",
            )
            session.add(std)
            await session.flush()
        else:
            std = existing_std

        logger.info("Seeding QCOs...")
        stmt_qco = select(QCO).where(QCO.qco_number == "S.O. 1234(E)")
        existing_qco = (await session.execute(stmt_qco)).scalar_one_or_none()
        if not existing_qco:
            qco = QCO(
                qco_number="S.O. 1234(E)",
                title="Cookware and Utensils (Quality Control) Order, 2023",
                product_name="Stainless Steel Water Bottles",
                is_number="IS 17803:2022",
                ministry="Ministry of Commerce and Industry",
                notification_date=date(2023, 8, 10),
                effective_date=date(2024, 3, 1),
                status=QCOStatus.ACTIVE,
            )
            session.add(qco)
            await session.flush()
        else:
            qco = existing_qco

        logger.info("Seeding Laboratories...")
        stmt_lab = select(Laboratory).where(Laboratory.recognition_code == "BIS-LAB-DEL-01")
        existing_lab = (await session.execute(stmt_lab)).scalar_one_or_none()
        if not existing_lab:
            lab = Laboratory(
                recognition_code="BIS-LAB-DEL-01",
                name="National Quality Testing Laboratory",
                city="New Delhi",
                state="Delhi",
                status=LabStatus.RECOGNIZED,
            )
            session.add(lab)

        logger.info("Seeding AHC Centres & Jewellers...")
        stmt_ahc = select(AHCCentre).where(AHCCentre.recognition_number == "AHC-DL-001")
        existing_ahc = (await session.execute(stmt_ahc)).scalar_one_or_none()
        if not existing_ahc:
            ahc = AHCCentre(
                recognition_number="AHC-DL-001",
                name="Central Assaying and Hallmarking Centre",
                city="New Delhi",
                state="Delhi",
                status=CentreStatus.ACTIVE,
                metal_capabilities=["GOLD", "SILVER"],
            )
            session.add(ahc)

        stmt_jwl = select(Jeweller).where(Jeweller.registration_number == "JWL-MH-1002")
        existing_jwl = (await session.execute(stmt_jwl)).scalar_one_or_none()
        if not existing_jwl:
            jeweller = Jeweller(
                registration_number="JWL-MH-1002",
                name="Zaveri Jewellers Ltd",
                city="Mumbai",
                state="Maharashtra",
                metal_category="GOLD",
                status=JewellerStatus.VALID,
            )
            session.add(jeweller)

        logger.info("Seeding Certification Schemes...")
        stmt_scheme1 = select(CertificationScheme).where(CertificationScheme.scheme_code == "SCHEME_I")
        if not (await session.execute(stmt_scheme1)).scalar_one_or_none():
            session.add(
                CertificationScheme(
                    scheme_code="SCHEME_I",
                    name="Product Certification Scheme (ISI Mark)",
                    description="Standard Mark licensing for products meeting Indian Standards.",
                    application_procedure="Apply via Manakonline, undergo factory inspection, sample testing, and license grant.",
                )
            )
        stmt_scheme2 = select(CertificationScheme).where(CertificationScheme.scheme_code == "SCHEME_II")
        if not (await session.execute(stmt_scheme2)).scalar_one_or_none():
            session.add(
                CertificationScheme(
                    scheme_code="SCHEME_II",
                    name="Compulsory Registration Scheme (CRS)",
                    description="Self-declaration of conformity for electronics and IT goods.",
                    application_procedure="Submit test report from BIS recognized lab on portal.",
                )
            )

        logger.info("Seeding Products and Mappings...")
        stmt_prod = select(Product).where(Product.name == "Stainless Steel Vacuum Flask")
        existing_prod = (await session.execute(stmt_prod)).scalar_one_or_none()
        if not existing_prod:
            product = Product(
                name="Stainless Steel Vacuum Flask",
                description="Double-wall vacuum insulated container for liquids.",
                category="Domestic Utensils",
                industry="Consumer Goods",
                hs_code="961700",
            )
            session.add(product)
            await session.flush()

            mapping = ProductStandardMapping(
                product_id=product.id,
                standard_id=std.id,
                qco_id=qco.id,
                is_mandatory=True,
                notes="Mandated under Cookware and Utensils QCO.",
            )
            session.add(mapping)

        await session.commit()
        logger.info("Seed data applied successfully!")


async def main():
    await seed()
    from app.dependencies import engine
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
