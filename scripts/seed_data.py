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
from app.models.laboratory import Laboratory, LaboratoryScope, LabStatus
from app.models.hallmarking import AHCCentre, Jeweller, CentreStatus, JewellerStatus
from app.models.certification import CertificationScheme
from app.models.product import Product, ProductStandardMapping

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")


STANDARDS_DATA = [
    {
        "is_number": "IS 17803:2022",
        "title": "Stainless Steel Vacuum Insulated Flasks and Bottles",
        "year": 2022,
        "status": StandardStatus.ACTIVE,
        "scope": "Specifies material, performance, and thermal insulation criteria for vacuum insulated bottles.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 1417:2016",
        "title": "Gold and Gold Alloys, Jewellery/Artefacts - Fineness and Marking",
        "year": 2016,
        "status": StandardStatus.ACTIVE,
        "scope": "Prescribes requirements for fineness and hallmarking grades (916, 750, 585) of gold jewellery.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 2112:2014",
        "title": "Silver and Silver Alloys, Jewellery/Artefacts - Fineness and Marking",
        "year": 2014,
        "status": StandardStatus.ACTIVE,
        "scope": "Prescribes requirements for purity grades and hallmarking criteria of silver jewellery and artefacts.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 1293:2019",
        "title": "Plugs and Socket-Outlets for Domestic and Similar Purposes",
        "year": 2019,
        "status": StandardStatus.ACTIVE,
        "scope": "Applies to plugs and fixed or portable socket-outlets for a.c. only, with or without earthing contact.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 13252 (Part 1):2010",
        "title": "Information Technology Equipment - Safety - General Requirements",
        "year": 2010,
        "status": StandardStatus.ACTIVE,
        "scope": "Specifies safety requirements for mains-powered or battery-powered information technology equipment.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 16046 (Part 2):2018",
        "title": "Secondary Cells and Batteries Containing Alkaline or Other Non-Acid Electrolytes - Lithium Systems",
        "year": 2018,
        "status": StandardStatus.ACTIVE,
        "scope": "Requirements and tests for the safe operation of portable sealed secondary lithium cells and batteries.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 4151:2015",
        "title": "Protective Helmets for Motorcycle Riders",
        "year": 2015,
        "status": StandardStatus.ACTIVE,
        "scope": "Prescribes requirements for protective helmets for riders of two-wheeled motor vehicles.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 14543:2004",
        "title": "Packaged Drinking Water (Other than Packaged Natural Mineral Water)",
        "year": 2004,
        "status": StandardStatus.ACTIVE,
        "scope": "Prescribes the requirements and methods of sampling and test for packaged drinking water.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 9873 (Part 1):2019",
        "title": "Safety of Toys - Mechanical and Physical Properties",
        "year": 2019,
        "status": StandardStatus.ACTIVE,
        "scope": "Specifies acceptable criteria for physical and mechanical features of toys intended for children.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 1786:2008",
        "title": "High Strength Deformed Steel Bars and Wires for Concrete Reinforcement",
        "year": 2008,
        "status": StandardStatus.ACTIVE,
        "scope": "Specifies chemical composition, physical properties, and tensile test requirements for TMT steel bars.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 302 (Part 1):2008",
        "title": "Safety of Household and Similar Electrical Appliances",
        "year": 2008,
        "status": StandardStatus.ACTIVE,
        "scope": "Deals with the safety of electrical appliances for household and similar purposes.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
    {
        "is_number": "IS 15820:2009",
        "title": "General Requirements for Competence of Assaying and Hallmarking Centres",
        "year": 2009,
        "status": StandardStatus.ACTIVE,
        "scope": "Criteria and operational guidelines for recognition and quality management in AHC facilities.",
        "source_name": "BIS_MANAK_ONLINE",
        "source_url": "https://standardsbis.bsbedge.com",
    },
]

QCOS_DATA = [
    {
        "qco_number": "S.O. 1234(E)",
        "title": "Cookware and Utensils (Quality Control) Order, 2023",
        "product_name": "Stainless Steel Water Bottles",
        "is_number": "IS 17803:2022",
        "ministry": "Ministry of Commerce and Industry",
        "notification_date": date(2023, 8, 10),
        "effective_date": date(2024, 3, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 853(E)",
        "title": "Toys (Quality Control) Order, 2020",
        "product_name": "Children's Mechanical Toys",
        "is_number": "IS 9873 (Part 1):2019",
        "ministry": "Ministry of Commerce and Industry",
        "notification_date": date(2020, 2, 25),
        "effective_date": date(2021, 1, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 4567(E)",
        "title": "Plugs and Socket-Outlets (Quality Control) Order, 2021",
        "product_name": "Electrical Plugs and Sockets",
        "is_number": "IS 1293:2019",
        "ministry": "Ministry of Heavy Industries",
        "notification_date": date(2021, 4, 15),
        "effective_date": date(2022, 1, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 3211(E)",
        "title": "Two Wheeler Helmet (Quality Control) Order, 2020",
        "product_name": "Motorcycle Protective Helmets",
        "is_number": "IS 4151:2015",
        "ministry": "Ministry of Road Transport and Highways",
        "notification_date": date(2020, 11, 26),
        "effective_date": date(2021, 6, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 982(E)",
        "title": "Steel and Steel Products (Quality Control) Order, 2024",
        "product_name": "TMT High Strength Steel Bars",
        "is_number": "IS 1786:2008",
        "ministry": "Ministry of Steel",
        "notification_date": date(2024, 1, 15),
        "effective_date": date(2024, 7, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 2105(E)",
        "title": "Bottled Water (Quality Control) Order, 2021",
        "product_name": "Packaged Drinking Water",
        "is_number": "IS 14543:2004",
        "ministry": "Ministry of Consumer Affairs",
        "notification_date": date(2021, 3, 10),
        "effective_date": date(2021, 9, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 5621(E)",
        "title": "Household Appliances Safety (Quality Control) Order, 2023",
        "product_name": "Domestic Electrical Appliances",
        "is_number": "IS 302 (Part 1):2008",
        "ministry": "Ministry of Heavy Industries",
        "notification_date": date(2023, 10, 5),
        "effective_date": date(2024, 5, 1),
        "status": QCOStatus.ACTIVE,
    },
    {
        "qco_number": "S.O. 6712(E)",
        "title": "Specialty Industrial Coatings (Quality Control) Order, 2026",
        "product_name": "Protective Industrial Paint",
        "is_number": "IS 17803:2022",
        "ministry": "Ministry of Chemicals and Petrochemicals",
        "notification_date": date(2026, 4, 10),
        "effective_date": date(2027, 1, 1),
        "status": QCOStatus.UPCOMING,
    },
]

LABORATORIES_DATA = [
    {
        "recognition_code": "BIS-LAB-DEL-01",
        "name": "National Quality Testing Laboratory",
        "city": "New Delhi",
        "district": "Central Delhi",
        "state": "Delhi",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 17803:2022", "IS 1293:2019", "IS 14543:2004"],
    },
    {
        "recognition_code": "BIS-LAB-MH-02",
        "name": "Western Regional Testing Centre",
        "city": "Mumbai",
        "district": "Mumbai Suburban",
        "state": "Maharashtra",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 1417:2016", "IS 2112:2014", "IS 1786:2008"],
    },
    {
        "recognition_code": "BIS-LAB-KA-03",
        "name": "Southern Electronics & Battery Test Lab",
        "city": "Bengaluru",
        "district": "Bengaluru Urban",
        "state": "Karnataka",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 13252 (Part 1):2010", "IS 16046 (Part 2):2018"],
    },
    {
        "recognition_code": "BIS-LAB-TN-04",
        "name": "Chennai Automotive & Safety Test Station",
        "city": "Chennai",
        "district": "Chennai",
        "state": "Tamil Nadu",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 4151:2015", "IS 1293:2019"],
    },
    {
        "recognition_code": "BIS-LAB-WB-05",
        "name": "Eastern Metallurgical & Steel Evaluation Centre",
        "city": "Kolkata",
        "district": "Kolkata",
        "state": "West Bengal",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 1786:2008", "IS 17803:2022"],
    },
    {
        "recognition_code": "BIS-LAB-GJ-06",
        "name": "Gujarat Plastics & Polymer Testing Laboratory",
        "city": "Ahmedabad",
        "district": "Ahmedabad",
        "state": "Gujarat",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 9873 (Part 1):2019", "IS 14543:2004"],
    },
    {
        "recognition_code": "BIS-LAB-RJ-07",
        "name": "Jaipur Precious Metals & Minerals Testing Facility",
        "city": "Jaipur",
        "district": "Jaipur",
        "state": "Rajasthan",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 1417:2016", "IS 2112:2014"],
    },
    {
        "recognition_code": "BIS-LAB-TS-08",
        "name": "Hyderabad Electrical Safety Testing Bureau",
        "city": "Hyderabad",
        "district": "Hyderabad",
        "state": "Telangana",
        "status": LabStatus.RECOGNIZED,
        "is_numbers": ["IS 302 (Part 1):2008", "IS 1293:2019"],
    },
]

AHC_CENTRES_DATA = [
    {
        "recognition_number": "AHC-DL-001",
        "name": "Central Assaying and Hallmarking Centre",
        "city": "New Delhi",
        "district": "Central Delhi",
        "state": "Delhi",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD", "SILVER"],
    },
    {
        "recognition_number": "AHC-MH-002",
        "name": "Zaveri Hallmarking Services",
        "city": "Mumbai",
        "district": "Mumbai City",
        "state": "Maharashtra",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD", "SILVER"],
    },
    {
        "recognition_number": "AHC-GJ-003",
        "name": "Surat Diamond & Gold Assaying Bureau",
        "city": "Surat",
        "district": "Surat",
        "state": "Gujarat",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD"],
    },
    {
        "recognition_number": "AHC-KL-004",
        "name": "Malabar Assaying & Hallmarking Complex",
        "city": "Thrissur",
        "district": "Thrissur",
        "state": "Kerala",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD", "SILVER"],
    },
    {
        "recognition_number": "AHC-RJ-005",
        "name": "Rajasthan Heritage Assay Centre",
        "city": "Jaipur",
        "district": "Jaipur",
        "state": "Rajasthan",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD", "SILVER"],
    },
    {
        "recognition_number": "AHC-WB-006",
        "name": "Bengal Bullion & Hallmarking Centre",
        "city": "Kolkata",
        "district": "Kolkata",
        "state": "West Bengal",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD", "SILVER"],
    },
    {
        "recognition_number": "AHC-TN-007",
        "name": "Madurai Gold Assay Laboratory",
        "city": "Madurai",
        "district": "Madurai",
        "state": "Tamil Nadu",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD"],
    },
    {
        "recognition_number": "AHC-TS-008",
        "name": "Deccan Precious Metals Testing Centre",
        "city": "Hyderabad",
        "district": "Hyderabad",
        "state": "Telangana",
        "status": CentreStatus.ACTIVE,
        "metal_capabilities": ["GOLD", "SILVER"],
    },
]

JEWELLERS_DATA = [
    {
        "registration_number": "JWL-MH-1002",
        "name": "Zaveri Jewellers Ltd",
        "city": "Mumbai",
        "state": "Maharashtra",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-DL-2001",
        "name": "Kalyan Heritage Gems",
        "city": "New Delhi",
        "state": "Delhi",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-KA-3004",
        "name": "Tanishq Retail Vault",
        "city": "Bengaluru",
        "state": "Karnataka",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-KL-4005",
        "name": "Malabar Ornaments Pvt Ltd",
        "city": "Kozhikode",
        "state": "Kerala",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-GJ-5006",
        "name": "Joyalukkas Trade Centre",
        "city": "Ahmedabad",
        "state": "Gujarat",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-RJ-6007",
        "name": "Johri Bazaar Jewels",
        "city": "Jaipur",
        "state": "Rajasthan",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-WB-7008",
        "name": "Senco Gold & Diamonds",
        "city": "Kolkata",
        "state": "West Bengal",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-TN-8009",
        "name": "GRT Jewellers Hub",
        "city": "Chennai",
        "state": "Tamil Nadu",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-TS-9010",
        "name": "Bhima Gold House",
        "city": "Hyderabad",
        "state": "Telangana",
        "metal_category": "GOLD",
        "status": JewellerStatus.VALID,
    },
    {
        "registration_number": "JWL-EXP-9999",
        "name": "Royal Heritage Jewels",
        "city": "Surat",
        "state": "Gujarat",
        "metal_category": "GOLD",
        "status": JewellerStatus.EXPIRED,
    },
    {
        "registration_number": "JWL-CAN-8888",
        "name": "National Gems & Bullion Ltd",
        "city": "Kanpur",
        "state": "Uttar Pradesh",
        "metal_category": "GOLD",
        "status": JewellerStatus.CANCELLED,
    },
]

SCHEMES_DATA = [
    {
        "scheme_code": "SCHEME_I",
        "name": "Product Certification Scheme (ISI Mark)",
        "description": "Standard Mark licensing for products meeting Indian Standards through factory inspection and sample testing.",
        "application_procedure": "Apply via Manakonline, undergo factory audit, sample verification at BIS lab, and license issuance.",
    },
    {
        "scheme_code": "SCHEME_II",
        "name": "Compulsory Registration Scheme (CRS)",
        "description": "Self-declaration of conformity for electronics, IT goods, and solar components based on accredited lab test reports.",
        "application_procedure": "Submit test report from BIS recognized lab on CRS portal and obtain R-number registration.",
    },
    {
        "scheme_code": "SCHEME_III",
        "name": "Grant of Certificate of Conformity",
        "description": "Conformity assessment for lots and batches where continuous production licensing is not viable.",
        "application_procedure": "Apply with batch specifications; BIS officers draw random lot samples for laboratory verification.",
    },
    {
        "scheme_code": "SCHEME_IV",
        "name": "Management Systems Certification (MSCS)",
        "description": "ISO 9001, ISO 14001, and ISO 22000 quality and environmental management certifications.",
        "application_procedure": "Stage 1 documentation audit followed by Stage 2 on-site comprehensive compliance assessment.",
    },
    {
        "scheme_code": "SCHEME_HALLMARK",
        "name": "Gold and Silver Jewellery Hallmarking Scheme",
        "description": "Mandatory purity certification for 14K, 18K, 20K, 22K, 23K, and 24K gold articles with 6-digit HUID.",
        "application_procedure": "Jeweller registers online; jewellery batches sent to recognized AHC for XRF/fire assay and laser engraving.",
    },
    {
        "scheme_code": "SCHEME_ECO",
        "name": "Eco Mark Scheme",
        "description": "Labelling of environment-friendly consumer products that meet relevant standards and ecological criteria.",
        "application_procedure": "Comply with respective Indian Standard plus specific environmental criteria set by MoEFCC.",
    },
]

PRODUCTS_DATA = [
    {
        "name": "Stainless Steel Vacuum Flask",
        "description": "Double-wall vacuum insulated container for hot and cold liquids.",
        "category": "Domestic Utensils",
        "industry": "Consumer Goods",
        "hs_code": "961700",
        "is_number": "IS 17803:2022",
        "qco_number": "S.O. 1234(E)",
    },
    {
        "name": "Two-Wheeler Protective Helmet",
        "description": "Full face and open face crash helmet for motorcycle riders.",
        "category": "Personal Safety Equipment",
        "industry": "Automotive & Safety",
        "hs_code": "650610",
        "is_number": "IS 4151:2015",
        "qco_number": "S.O. 3211(E)",
    },
    {
        "name": "3-Pin Electrical Plug & Socket",
        "description": "Household 6A and 16A grounded electrical plugs and socket outlets.",
        "category": "Electrical Accessories",
        "industry": "Power & Home Electricals",
        "hs_code": "853669",
        "is_number": "IS 1293:2019",
        "qco_number": "S.O. 4567(E)",
    },
    {
        "name": "Packaged Drinking Water Bottle",
        "description": "Sealed PET container holding purified treated drinking water.",
        "category": "Food & Beverages",
        "industry": "Beverages",
        "hs_code": "220190",
        "is_number": "IS 14543:2004",
        "qco_number": "S.O. 2105(E)",
    },
    {
        "name": "Lithium-Ion Rechargeable Battery",
        "description": "Secondary lithium-ion cell pack used in laptops and portable devices.",
        "category": "Electronics & IT",
        "industry": "Electronics",
        "hs_code": "850760",
        "is_number": "IS 16046 (Part 2):2018",
        "qco_number": None,
    },
    {
        "name": "Gold Bangle 22 Karat",
        "description": "916 fineness hallmarked yellow gold ornamental bangle.",
        "category": "Precious Jewellery",
        "industry": "Gems & Jewellery",
        "hs_code": "711319",
        "is_number": "IS 1417:2016",
        "qco_number": None,
    },
    {
        "name": "Plastic Toy Car",
        "description": "Moulded non-toxic plastic toy car for children under 14 years.",
        "category": "Children Products",
        "industry": "Toy Manufacturing",
        "hs_code": "950300",
        "is_number": "IS 9873 (Part 1):2019",
        "qco_number": "S.O. 853(E)",
    },
    {
        "name": "Fe 500D TMT Reinforcement Steel Bar",
        "description": "Thermo-Mechanically Treated high strength deformed steel bar for building construction.",
        "category": "Construction Materials",
        "industry": "Iron & Steel",
        "hs_code": "721420",
        "is_number": "IS 1786:2008",
        "qco_number": "S.O. 982(E)",
    },
]


async def seed(session_factory: Optional[async_sessionmaker[AsyncSession]] = None) -> None:
    maker = session_factory or async_session_maker
    async with maker() as session:
        logger.info("Seeding Standards...")
        standards_by_num = {}
        for s_data in STANDARDS_DATA:
            stmt = select(Standard).where(Standard.is_number == s_data["is_number"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                std = Standard(**s_data)
                session.add(std)
                await session.flush()
                standards_by_num[s_data["is_number"]] = std
            else:
                standards_by_num[s_data["is_number"]] = existing

        logger.info("Seeding QCOs...")
        qcos_by_num = {}
        for q_data in QCOS_DATA:
            stmt = select(QCO).where(QCO.qco_number == q_data["qco_number"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                qco = QCO(**q_data)
                session.add(qco)
                await session.flush()
                qcos_by_num[q_data["qco_number"]] = qco
            else:
                qcos_by_num[q_data["qco_number"]] = existing

        logger.info("Seeding Laboratories and Scopes...")
        for l_data in LABORATORIES_DATA:
            stmt = select(Laboratory).where(Laboratory.recognition_code == l_data["recognition_code"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                lab = Laboratory(
                    recognition_code=l_data["recognition_code"],
                    name=l_data["name"],
                    city=l_data["city"],
                    district=l_data["district"],
                    state=l_data["state"],
                    status=l_data["status"],
                )
                session.add(lab)
                await session.flush()

                for is_num in l_data["is_numbers"]:
                    scope = LaboratoryScope(
                        laboratory_id=lab.id,
                        is_number=is_num,
                        product_name="Sample tested under " + is_num,
                        test_name="Full Parameter Conformity Test",
                        parameter="Material, Physical and Safety Parameters",
                    )
                    session.add(scope)

        logger.info("Seeding AHC Centres...")
        for a_data in AHC_CENTRES_DATA:
            stmt = select(AHCCentre).where(AHCCentre.recognition_number == a_data["recognition_number"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                ahc = AHCCentre(**a_data)
                session.add(ahc)

        logger.info("Seeding Jewellers...")
        for j_data in JEWELLERS_DATA:
            stmt = select(Jeweller).where(Jeweller.registration_number == j_data["registration_number"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                jeweller = Jeweller(**j_data)
                session.add(jeweller)

        logger.info("Seeding Certification Schemes...")
        for sc_data in SCHEMES_DATA:
            stmt = select(CertificationScheme).where(CertificationScheme.scheme_code == sc_data["scheme_code"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                scheme = CertificationScheme(**sc_data)
                session.add(scheme)

        logger.info("Seeding Products and Mappings...")
        for p_data in PRODUCTS_DATA:
            stmt = select(Product).where(Product.name == p_data["name"])
            existing = (await session.execute(stmt)).scalar_one_or_none()
            if not existing:
                prod = Product(
                    name=p_data["name"],
                    description=p_data["description"],
                    category=p_data["category"],
                    industry=p_data["industry"],
                    hs_code=p_data["hs_code"],
                )
                session.add(prod)
                await session.flush()

                std_obj = standards_by_num.get(p_data["is_number"])
                qco_obj = qcos_by_num.get(p_data["qco_number"]) if p_data["qco_number"] else None
                if std_obj:
                    mapping = ProductStandardMapping(
                        product_id=prod.id,
                        standard_id=std_obj.id,
                        qco_id=qco_obj.id if qco_obj else None,
                        is_mandatory=qco_obj is not None,
                        notes=f"Applicable standard {std_obj.is_number} under BIS guidelines.",
                    )
                    session.add(mapping)

        await session.commit()
        logger.info("All seed data applied successfully to database!")


async def main():
    await seed()
    from app.dependencies import engine
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(main())
