# Parakh

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Supabase-4169E1?logo=postgresql&logoColor=white)](https://supabase.com/)
[![SQLAlchemy](https://img.shields.io/badge/SQLAlchemy-2.0%20Async-D71F00?logo=sqlalchemy&logoColor=white)](https://www.sqlalchemy.org/)
[![Gemini](https://img.shields.io/badge/Gemini%20AI-Multimodal-886CE4?logo=googlegemini&logoColor=white)](https://deepmind.google/technologies/gemini/)
[![Tests](https://img.shields.io/badge/Tests-110%20Passed-1E8449?logo=pytest&logoColor=white)](https://docs.pytest.org/)
[![SIH 2026](https://img.shields.io/badge/SIH-2026-1E8449)](https://www.sih.gov.in/)
[![Production Live](https://img.shields.io/badge/Production-Live%20VPS-007ACC)](https://bis.hizru.me/docs)

**Smart India Hackathon 2026**  
**Problem Statement ID:** 26107  
**Title:** *AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers*

**Live API Server:** [https://bis.hizru.me](https://bis.hizru.me)  
**Interactive API Documentation:** [https://bis.hizru.me/docs](https://bis.hizru.me/docs)  
**Frontend & RAG Integration Guide (PDF):** [https://bis.hizru.me/guide.pdf](https://bis.hizru.me/guide.pdf)

---

## Product Tour & Walkthrough

<p align="center">
  <img src="assets/parakh-preview.gif" alt="Parakh Architecture & Product Walkthrough" width="100%" style="border-radius: 12px; box-shadow: 0 10px 30px rgba(0,0,0,0.25);" />
</p>

---

## Overview

**Parakh** is an enterprise-grade AI orchestration and regulatory compliance platform engineered for the **Bureau of Indian Standards (BIS)**. It unifies Indian Standards discovery, statutory Quality Control Orders (QCOs), testing laboratory networks, hallmarking verification, and anti-counterfeit whistleblower reporting into a high-performance asynchronous API architecture.

Built with Python 3.10+, FastAPI, and PostgreSQL (Supabase), Parakh eliminates AI hallucinations by enforcing grounded retrieval, token-scored product mapping, and structured database fallbacks. It bridges the gap between everyday consumers seeking product safety and MSMEs navigating mandatory regulatory certifications.

---

## Enterprise Feature Suite

### 1. Dual-Persona Conversational AI Engine
- **Consumer Persona (`CONSUMER`)**: Delivers clear, non-technical explanations focused on product safety, hallmarking authenticity checks, and consumer protection rights under the Consumer Protection Act, 2019.
- **Industry / MSME Persona (`INDUSTRY`)**: Acts as a certified regulatory consultant, quoting exact Indian Standard clauses, QCO gazette notification numbers, factory audit protocols, and statutory concessions (e.g. 20% discount on BIS application and annual marking fees for Micro/Small enterprises).

### 2. "Why-Not-Others" Negative Rejection Rationale
- When classifying products to Indian Standards (`POST /api/v1/certification/map-product`), Parakh delivers not only the candidate standard but also an array of **`rejected_alternatives`**.
- Evaluates competing standards and outputs concrete regulatory justifications explaining why discarded standards were rejected (e.g., explaining why *IS 17803:2022* was chosen for stainless steel flasks while *IS 14756:2017* for non-insulated cookware was disqualified).

### 3. Dynamic QCO Countdown Timers & MSME Grace Windows
- Computes real-time countdown metrics (`days_until_enforcement`) and active enforcement status (`is_enforced`).
- Automatically calculates statutory grace extensions under Ministry guidelines:
  - **`msme_micro_deadline`**: +6 months statutory extension for Micro enterprises.
  - **`msme_small_deadline`**: +3 months statutory extension for Small enterprises.
  - **`exemption_note`**: Regulatory guidance outlining exemptions for domestic R&D and export-oriented units.

### 4. Geocoded Laboratories & Spatial Proximity Sorter
- Maps recognized testing laboratories with exact geographic coordinates (`latitude`, `longitude`).
- Accepts user coordinates (`user_lat`, `user_lng`) to compute real-time spatial distances via the **Haversine formula**, ranking nearest accredited laboratories first.
- Generates turn-by-turn Google Maps navigation deep links (`maps_url`) for immediate physical sample submission.

### 5. DPDP-Compliant Anonymous Whistleblower Fraud Reporting
- Dedicated reporting engine (`POST /api/v1/grievances/whistleblower`) for counterfeit ISI marks, fake hallmarking (HUID), and QCO violations under Section 29 of the BIS Act, 2016.
- **Zero-Trust DPDP Act Privacy Scrubber**: Irreversibly sanitizes Indian phone numbers (`+91`), email addresses, and self-identifying names before persisting to the database.
- Issues cryptographically secure tracking references (e.g. `BIS-WH-2026-DBEC4D`) for anonymous investigation tracking.

### 6. Measured Refusal & Admin Knowledge Gap Telemetry
- Enforces an automated refusal safeguard when product queries score below confidence thresholds ($< 0.40$), preventing misleading advice.
- Automatically logs unmapped queries into a `knowledge_gaps` telemetry registry.
- Provides administrators and BIS technical committees an analytics endpoint (`GET /api/v1/admin/gap-report`) to track emerging consumer and manufacturing search trends lacking standardized BIS specifications.

### 7. Tiered High-Speed Verification Engine
- Verifies Hallmarking Unique Identification (HUID), BIS Licence numbers (CM/L), and Compulsory Registration Scheme (CRS) R-numbers.
- **Tier 1 (Sub-50ms SQL Lookup)**: Prioritizes local PostgreSQL registry tables (`LOCAL_DATABASE_REGISTRY`) before falling back to mock or upstream portals.
- **Rich Deterministic Test Matrix**: Pre-seeded with authentic hallmarks (`ABC123`, `GLD916`, `DIA750`, `SIL925`, `K98L2M`), simulated error states (`EXP999`, `NOTF00`, `ERR500`), and a deterministic fallback generator.

---

## Repository Structure

```text
Parakh/
├── app/
│   ├── api/
│   │   └── v1/                   # REST API routes (chat, standards, qco, verification, labs, grievance, admin)
│   ├── core/                     # Security, exceptions, rate limiting, and hashing
│   ├── db/                       # SQLAlchemy 2.0 async engine and session management
│   ├── integrations/             # Google CloudCode OAuth provider, vision parser, verification mock
│   ├── models/                   # SQLAlchemy ORM models (Standard, QCO, Lab, Grievance, KnowledgeGap)
│   ├── schemas/                  # Pydantic v2 validation contracts
│   ├── services/                 # Chat, sync, and verification orchestrators
│   ├── config.py                 # Pydantic BaseSettings configuration
│   └── main.py                   # FastAPI application factory and lifecycle hooks
├── migrations/
│   └── versions/                 # Alembic async schema migrations (001_initial_schema, 002_enterprise_suite)
├── scripts/
│   ├── generate_guide_pdf.py     # 7-page ReportLab PDF integration documentation generator
│   └── seed_data.py              # Full database seeder for standards, QCOs, labs, jewellers, and schemes
├── tests/
│   ├── integration/              # End-to-end API integration tests
│   └── unit/                     # Business logic, proximity sorting, and PII scrubber tests
├── docs/                         # Architecture specifications and implementation plans
└── requirements.txt              # Production dependency manifest
```

---

## Tech Stack

| Layer | Technologies |
|---|---|
| **Core Framework** | FastAPI (ASGI), Python 3.10+, Starlette, Uvicorn |
| **Data Validation** | Pydantic v2, Pydantic-Settings |
| **Database & ORM** | PostgreSQL (Supabase), SQLAlchemy 2.0 (Async), `asyncpg` |
| **Migrations** | Alembic (async database migration engine) |
| **AI & NLP** | Google Gemini (`gemini-3.7-flash-high` / `gemini-3-flash`), CloudCode OAuth 24/7 headless manager |
| **Geospatial & Math** | Pure Python Haversine Formula with floating-point boundary clamping |
| **Privacy & Security** | DPDP Act (2023) Regex Sanitizer, PBKDF2-HMAC-SHA256, JWT (`python-jose`), API Key Guards |
| **Testing** | Pytest, Pytest-Asyncio, HTTPX (`110/110` passing tests) |
| **Documentation** | Swagger / OpenAPI 3.1, ReportLab PDF Engine |

---

## Quickstart

### Prerequisites
- Python 3.10+
- PostgreSQL instance (or local SQLite for lightweight testing)

### 1. Installation

```bash
# Clone the repository
git clone https://github.com/yuvraj-dw/Parakh.git
cd Parakh

# Create and activate virtual environment
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configuration

Copy the example environment template and configure your connection strings:

```bash
cp .env.example .env
```

Key environment variables:
```ini
APP_NAME="Parakh"
DATABASE_URL="postgresql+asyncpg://user:password@localhost:5432/parakh_db"
JWT_SECRET="your-32-character-secret-key-here"
ADMIN_API_KEY="your-admin-api-key-here"
LLM_PROVIDER="mock"  # or "openai_compatible"
```

### 3. Database Migration & Seeding

```bash
# Apply migrations to database
alembic upgrade head

# Seed complete standards, QCOs, labs, and mock verification catalog
python -m scripts.seed_data
```

### 4. Running the Application

```bash
uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```

Once running, interactive API documentation is available at `http://127.0.0.1:8000/docs`.

### 5. Running the Test Suite

```bash
pytest -v
```
*(All 110 automated unit and integration tests will execute and pass)*.

---

## API Summary

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/chat` | Dual-persona conversational assistant (`CONSUMER` / `INDUSTRY`) |
| `POST` | `/api/v1/certification/map-product` | Product-to-standard mapping with "Why-Not-Others" rejection rationale |
| `GET` | `/api/v1/qco` | Quality Control Orders with dynamic countdowns and MSME grace dates |
| `GET` | `/api/v1/laboratories` | Geocoded laboratory directory with Haversine distance sorting |
| `POST` | `/api/v1/verification/huid` | High-speed jewellery hallmark verification (Local DB priority) |
| `POST` | `/api/v1/verification/licence` | BIS ISI mark licence (CM/L) verification |
| `POST` | `/api/v1/verification/r-number` | Compulsory Registration Scheme (CRS) R-number verification |
| `POST` | `/api/v1/grievances/whistleblower` | DPDP-sanitized anonymous whistleblower fraud reporting |
| `GET` | `/api/v1/grievances/whistleblower/{code}` | Anonymous tracking of submitted whistleblower reports |
| `GET` | `/api/v1/admin/gap-report` | Admin intelligence report on unmapped queries and knowledge gaps |

---

## Documentation & Deliverables

- **Frontend & RAG Integration Guide (PDF)**: Publicly served live at [https://bis.hizru.me/guide.pdf](https://bis.hizru.me/guide.pdf) (7-page comprehensive reference including data schemas, mock registries, and error codes).
- **Interactive Swagger Documentation**: [https://bis.hizru.me/docs](https://bis.hizru.me/docs).

