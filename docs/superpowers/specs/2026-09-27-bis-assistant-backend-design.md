# BIS Intelligent Assistant (Problem Statement 26107) - Backend Design Spec

**Date:** 2026-09-27  
**Status:** Approved  
**Topic:** BIS Intelligent Assistant Master Backend Architecture

---

## 1. Overview & Objectives

This specification defines the production-ready backend foundation for the **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers (Problem Statement 26107)**.

The system acts as the central orchestration layer connecting:
1. **Frontend Applications** (Citizen, MSME, Industry, Laboratory, and Admin users)
2. **PostgreSQL 16 Database** (Authoritative structured BIS data, provenance, directory records)
3. **Verification Layer** (HUID, Licence CM/L, CRS R-Number via decoupled provider interfaces)
4. **Knowledge Retrieval Layer** (RAG service integration contract)
5. **Generative AI Layer** (LLM service integration contract)
6. **Document & Image Processing** (Jewellery marking OCR, Assay report parsing)
7. **Background Synchronization** (Authoritative ingestion, change detection, and sync logging)

### Core Mandate: LLM is NOT the Source of Truth
The LLM does **not** independently decide:
- Whether certification is legally mandatory (governed by QCO dates and database mappings)
- Whether an Indian Standard applies or is superseded
- Whether a laboratory is recognized or has testing capability for a specific IS/parameter
- Whether an Assaying & Hallmarking Centre (AHC) or jeweller is licensed
- Whether a HUID, licence, or R-number is valid
- Whether jewellery metal is physically authentic

The backend enforces deterministic business logic and authoritative queries. The LLM and RAG services serve strictly to understand user intent, synthesize answers, explain clauses, and provide citations.

---

## 2. System Architecture

The backend adopts **Layered Clean Architecture with Provider Abstractions**:

```text
                               +-----------------------------+
                               |     Client / Frontend UI    |
                               +--------------+--------------+
                                              | HTTP / JSON (/api/v1)
                                              v
+-----------------------------------------------------------------------------------------+
|                                    FastAPI App Layer                                    |
|  [Correlation ID Middleware] -> [CORS] -> [Exception Handler] -> [JWT Auth / RBAC]    |
|                                                                                         |
|  Routers (/api/v1/):                                                                    |
|   ├── /standards, /qcos, /certification, /laboratories, /hallmarking, /jewellers        |
|   ├── /chat (Intent classification -> Structured DB + RAG Retrieval -> LLM Synthesis)  |
|   ├── /verification (HUID, Licence, CRS R-Number)                                       |
|   ├── /jewellery (Image Scan OCR, Assay Report extraction)                              |
|   └── /admin (Sync triggers, Sync runs, Source health)                                  |
+-----------------------------------------------------------------------------------------+
        |                          |                         |                      |
        v                          v                         v                      v
+----------------+      +--------------------+     +-------------------+  +------------------+
| Service Layer  |      |   Repositories     |     | Provider Clients  |  | In-Process Sync  |
| (Domain Logic, |<---->| (SQLAlchemy 2.0    |     | (Verification,    |  | BackgroundTasks  |
|  Calculations) |      |  AsyncPG Sessions) |     |  RAG, LLM, OCR)   |  | Runner           |
+----------------+      +----------+---------+     +---------+---------+  +--------+---------+
                                   |                         |                     |
                                   v                         v                     v
                        +--------------------+     +-------------------+  +------------------+
                        |  PostgreSQL 16     |     | External Services |  | Ingest / Sync    |
                        | (Structured BIS,   |     | (Mock / Real BIS, |  | Sources (JSON,   |
                        |  Provenance, Audit)|     |  Vector DB, LLMs) |  | Web Endpoints)   |
                        +--------------------+     +-------------------+  +------------------+
```

---

## 3. Repository & Package Layout

```text
backend/
├── app/
│   ├── main.py                     # FastAPI application factory and lifespan setup
│   ├── config.py                   # Pydantic v2 BaseSettings configuration
│   ├── dependencies.py             # FastAPI dependency injection (DB sessions, auth, providers)
│   ├── core/                       # Cross-cutting concerns
│   │   ├── exceptions.py           # Standard AppError and HTTPException handlers
│   │   ├── logging.py              # Structured JSON logging with request correlation ID
│   │   └── security.py             # JWT token creation/decoding, passlib hashing
│   ├── api/v1/                     # Version 1 API routers
│   │   ├── router.py               # Combined APIRouter aggregator
│   │   ├── auth.py                 # Login, user registration, token refresh
│   │   ├── standards.py            # Standards querying, detail, and relationships
│   │   ├── qco.py                  # Quality Control Orders and status evaluation
│   │   ├── certification.py        # Scheme mapping (Product -> Standard -> QCO -> Scheme)
│   │   ├── laboratories.py         # Lab directory, parameter & IS scope queries
│   │   ├── hallmarking.py          # A&H centres lookup and filtering
│   │   ├── jewellers.py            # Registered jewellers directory
│   │   ├── verification.py         # HUID, Licence, and R-number verification endpoints
│   │   ├── jewellery.py            # Jewellery OCR scan & Assay report parser
│   │   ├── chat.py                 # Conversational assistant orchestration
│   │   └── admin.py                # Sync monitoring, triggers, and health checks
│   ├── models/                     # SQLAlchemy declarative models
│   │   ├── base.py                 # Common Base with timestamp & provenance mixins
│   │   ├── user.py                 # Users and authentication roles
│   │   ├── standard.py             # Standards, versions, and relationships
│   │   ├── qco.py                  # QCOs and product mappings
│   │   ├── certification.py        # Certification schemes and requirements
│   │   ├── laboratory.py           # Laboratories and test scopes
│   │   ├── hallmarking.py          # A&H centres and jeweller registrations
│   │   ├── product.py              # Product definitions and standard linkages
│   │   ├── verification.py         # Verification audit logs and results
│   │   ├── chat.py                 # Conversations and messages
│   │   └── sync.py                 # Sync runs, errors, and data source health
│   ├── schemas/                    # Pydantic v2 request/response validation schemas
│   ├── repositories/               # Async database access layer
│   ├── services/                   # Business logic and domain coordination
│   ├── integrations/               # External service provider abstractions
│   │   ├── verification/           # VerificationProvider base, Mock & Official adapters
│   │   ├── rag/                    # RAGProvider base, Mock & HTTP client adapters
│   │   ├── llm/                    # LLMProvider base, Mock & OpenAI/Gemini/Ollama adapters
│   │   └── vision/                 # VisionProvider base, Mock & Tesseract/Cloud adapters
│   └── workers/                    # In-process sync runner and background handlers
├── migrations/                     # Alembic migration scripts
│   ├── env.py
│   └── versions/
├── tests/                          # Automated pytest suite
│   ├── conftest.py                 # Fixtures (in-memory SQLite / async test DB, mock clients)
│   ├── unit/                       # Tests for services, validators, status logic
│   └── integration/                # End-to-end API tests
├── scripts/                        # Database seeding, sample datasets, and CLI utilities
├── Dockerfile                      # Multi-stage production container
├── docker-compose.yml              # Local dev stack (FastAPI backend + PostgreSQL 16)
├── requirements.txt                # Pinned production dependencies
└── .env.example                    # Template environment variables
```

---

## 4. Data Model & Provenance Specification

### Provenance & Audit Mixin
Every structured record derives from `ProvenanceMixin`:
- `source_name: str` — Identifier of the origin (e.g., `"BIS_MANAK_ONLINE"`, `"GAZETTE_OF_INDIA"`, `"SEED_OFFICIAL"`)
- `source_url: Optional[str]` — Direct URL to gazette order or public portal page
- `source_type: str` — Classification (`"PUBLIC_PORTAL"`, `"GAZETTE_NOTIFICATION"`, `"AUTHORIZED_FEED"`)
- `source_identifier: Optional[str]` — E.g., S.O. Notification No., Lab Code, CM/L number
- `retrieved_at: datetime` — Ingestion timestamp
- `published_at: Optional[datetime]` — Original publication/notification date
- `last_verified_at: datetime` — Timestamp of last authoritative confirmation (used to assess data freshness: `CURRENT`, `STALE`, `UNKNOWN`)
- `created_at: datetime` & `updated_at: datetime`

### Database Entities

| Table | Primary Purpose | Key Fields |
|---|---|---|
| `users` | User and administrator credentials | `id`, `email`, `hashed_password`, `role` (`user`, `admin`), `is_active` |
| `standards` | Indian Standards catalogue | `id`, `is_number` (unique, indexed), `title`, `year`, `status` (`ACTIVE`, `WITHDRAWN`, `SUPERSEDED`, `UNDER_REVIEW`), `scope` |
| `standard_versions` | Revisions and amendments | `id`, `standard_id` (FK), `version_number`, `revision_year`, `amendment_number`, `publication_date` |
| `standard_relationships` | Relationships between standards | `id`, `source_standard_id`, `target_standard_id`, `relationship_type` (`SUPERSEDES`, `AMENDS`, `REFERENCES`, `EQUIVALENT_TO`) |
| `qcos` | Quality Control Orders | `id`, `qco_number`, `title`, `product_name`, `is_number` (indexed), `ministry`, `notification_number`, `notification_date`, `effective_date`, `status` (`UPCOMING`, `ACTIVE`, `EXPIRED`, `SUPERSEDED`, `UNKNOWN`) |
| `certification_schemes` | BIS certification schemes | `id`, `scheme_code` (e.g. `Scheme-I`, `Scheme-II (CRS)`), `name`, `description`, `application_procedure` |
| `products` | Real-world consumer/industrial goods | `id`, `name`, `description`, `category`, `industry`, `hs_code` |
| `product_standard_mappings` | Mapping goods to standards & QCOs | `id`, `product_id`, `standard_id`, `qco_id`, `is_mandatory` (bool), `notes` |
| `laboratories` | Testing labs recognized by BIS | `id`, `recognition_code` (unique), `name`, `address`, `city`, `district`, `state`, `pincode`, `contact_details` (JSONB), `status` (`RECOGNIZED`, `SUSPENDED`, `EXPIRED`), `valid_from`, `valid_until` |
| `laboratory_scopes` | Testing capabilities per lab | `id`, `laboratory_id` (FK), `is_number`, `product_name`, `test_name`, `parameter`, `capability_details`, `limit_of_detection` |
| `ahc_centres` | Assaying & Hallmarking Centres | `id`, `recognition_number` (unique), `name`, `address`, `city`, `district`, `state`, `pincode`, `status` (`ACTIVE`, `SUSPENDED`, `SURRENDERED`), `valid_from`, `valid_until`, `metal_capabilities` (JSONB: `["GOLD", "SILVER"]`) |
| `jewellers` | BIS-registered jewellers | `id`, `registration_number` (unique), `name`, `address`, `city`, `district`, `state`, `pincode`, `metal_category`, `status` (`VALID`, `CANCELLED`, `EXPIRED`), `valid_from`, `valid_until` |
| `verification_requests` | Verification request audit | `id`, `request_type` (`HUID`, `LICENCE`, `CRS_R_NUMBER`), `identifier`, `user_id` (optional), `status` (`UNKNOWN`, `PENDING`, `VERIFIED`, `NOT_VERIFIED`, `NOT_FOUND`, `EXPIRED`, `ERROR`), `provider_name`, `created_at` |
| `verification_results` | Authoritative verification result | `id`, `request_id` (FK, unique), `raw_response` (JSONB), `normalized_data` (JSONB), `verified_at`, `source_url`, `notes` |
| `conversations` | Chat session headers | `id`, `user_id` (optional FK), `title`, `created_at`, `updated_at` |
| `messages` | Chat turns and citations | `id`, `conversation_id` (FK), `role` (`user`, `assistant`, `system`), `content`, `citations` (JSONB), `created_at` |
| `sync_runs` | Dataset sync audit history | `id`, `dataset`, `status` (`RUNNING`, `SUCCESS`, `PARTIAL`, `FAILED`), `records_seen`, `records_created`, `records_updated`, `records_deactivated`, `source`, `started_at`, `completed_at` |
| `sync_errors` | Ingestion row-level failures | `id`, `sync_run_id` (FK), `item_identifier`, `error_type`, `message`, `raw_payload` (JSONB), `occurred_at` |

---

## 5. API Layer & Protocol Contracts

### Base Path
All endpoints reside under `/api/v1`.

### Pagination Protocol
List queries accept `page` (default 1) and `page_size` (default 20, max 100):
```json
{
  "items": [ ... ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

### Standard Error Response Envelope
```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Laboratory with code LAB-001 not found",
    "request_id": "a98b7f20-80de-4df4-8d45-7798728d11b3",
    "details": null
  }
}
```

### Core API Endpoints

1. **Standards**
   - `GET /api/v1/standards` — Search/filter by query, status, year, IS number.
   - `GET /api/v1/standards/{is_number}` — Full details, amendments, versions, and relationships.
   - `GET /api/v1/standards/{is_number}/relationships` — Superseded/superseding standards.

2. **Quality Control Orders (QCO)**
   - `GET /api/v1/qco` — Filter by ministry, status (`active`, `upcoming`, `expired`), IS number.
   - `GET /api/v1/qco/{id}` — Order details, gazette notification metadata, and enforcement date.

3. **Certification Schemes**
   - `GET /api/v1/certification/schemes` — Directory of BIS schemes (ISI Mark, CRS, Scheme-IV, etc.).
   - `POST /api/v1/certification/map-product` — Map product description $\rightarrow$ IS Number $\rightarrow$ QCO $\rightarrow$ Applicable scheme & procedure.

4. **Laboratories**
   - `GET /api/v1/laboratories` — Filter by `state`, `city`, `district`, `is_number`, `status`.
   - `GET /api/v1/laboratories/{recognition_code}` — Lab profile, accreditation, valid dates.
   - `GET /api/v1/laboratories/{recognition_code}/scopes` — Test scopes and testing capabilities.

5. **Hallmarking & Jewellers**
   - `GET /api/v1/hallmarking/centres` — Filter AHC centres by state, city, metal (`GOLD`, `SILVER`).
   - `GET /api/v1/hallmarking/jewellers` — Filter registered jewellers by state, city, licence no.

6. **Verification Service**
   - `POST /api/v1/verification/huid` — Body: `{"huid": "ABC123"}`
   - `POST /api/v1/verification/licence` — Body: `{"licence_no": "CM/L-1234567"}`
   - `POST /api/v1/verification/r-number` — Body: `{"r_number": "R-12345678"}`
   - *Status lifecycle*: `UNKNOWN`, `PENDING`, `VERIFIED`, `NOT_VERIFIED`, `NOT_FOUND`, `EXPIRED`, `ERROR`.

7. **Jewellery Vision & Assay Processing**
   - `POST /api/v1/jewellery/scan` — Upload image (`multipart/form-data`); returns separate `detected` attributes (HUID, purity) vs `verification` state. Recommends physical testing at an AHC.
   - `POST /api/v1/jewellery/assay-report` — Upload PDF/image of an assay test report; extracts test centre, metal, reported purity, and sample details.

8. **Chat & Assistant Orchestration**
   - `POST /api/v1/chat` — Body: `{"conversation_id": "...", "message": "What standard applies to stainless steel water bottles?"}`
   - Flow: Intent Classification $\rightarrow$ Query structured PostgreSQL $\rightarrow$ Query RAG $\rightarrow$ Synthesize with LLM $\rightarrow$ Validate evidence against DB $\rightarrow$ Output answer with grounded citations.

9. **Admin & Monitoring (Protected)**
   - `GET /api/v1/admin/sync/runs` — Paginated history of sync runs.
   - `GET /api/v1/admin/sync/errors` — Ingestion error logs.
   - `POST /api/v1/admin/sync/{dataset}` — Trigger background sync for `standards`, `qcos`, `laboratories`, `ahc_centres`, `jewellers`, or `all`.
   - `GET /api/v1/admin/source-health` — Real-time health: DB connection pool, data freshness counts, and external provider statuses.

---

## 6. Provider Abstractions & External Integrations

### Verification Provider
```python
class VerificationStatus(str, Enum):
    UNKNOWN = "UNKNOWN"
    PENDING = "PENDING"
    VERIFIED = "VERIFIED"
    NOT_VERIFIED = "NOT_VERIFIED"
    NOT_FOUND = "NOT_FOUND"
    EXPIRED = "EXPIRED"
    ERROR = "ERROR"

class BaseVerificationProvider(ABC):
    @abstractmethod
    async def verify_huid(self, huid: str) -> VerificationResponse: ...
    @abstractmethod
    async def verify_licence(self, licence_no: str) -> VerificationResponse: ...
    @abstractmethod
    async def verify_r_number(self, r_number: str) -> VerificationResponse: ...
```
- **`MockVerificationProvider`**: Deterministic mock responding based on pattern rules for reliable test runs.
- **`BISOfficialApiProvider`**: Designed for official credentials when government API access is granted.
- **`OfficialRedirectProvider`**: Returns `NOT_VERIFIED` with official verification portal links when direct API is unavailable.

### RAG Retrieval Provider
```python
class BaseRAGProvider(ABC):
    @abstractmethod
    async def retrieve(
        self, query: str, filters: Optional[dict] = None, top_k: int = 5
    ) -> List[RAGChunk]: ...
```
- Returns standard chunks with `text`, `document_id`, `document_title`, `standard_number`, `clause`, `page`, `source_url`, `retrieval_score`.

### LLM Provider
```python
class BaseLLMProvider(ABC):
    @abstractmethod
    async def generate_response(
        self, messages: List[ChatMessage], context_chunks: List[RAGChunk], system_instruction: str
    ) -> LLMResult: ...
    @abstractmethod
    async def extract_product_attributes(self, text: str) -> ExtractedProductAttributes: ...
```
- Providers: `MockLLMProvider` (offline/tests), `OpenAILLMProvider`, `GeminiLLMProvider`.
- **Evidence Verification**: Cited standards are validated against PostgreSQL `standards` table before returning to the user.

### Vision & OCR Provider
```python
class BaseVisionProvider(ABC):
    @abstractmethod
    async def scan_jewellery_marks(self, image_bytes: bytes) -> JewelleryScanDetection: ...
    @abstractmethod
    async def parse_assay_report(self, file_bytes: bytes, mime_type: str) -> AssayReportData: ...
```

---

## 7. Data Synchronization Engine

1. **Ingestion Loop**:
   - `Fetcher`: Reads authorized/seed datasets.
   - `Parser`: Converts raw feeds to structured records.
   - `Validator`: Pydantic ingestion validation.
   - `Normalizer`: Title case, Indian state/district canonical mapping (e.g. `"M.P."` $\rightarrow$ `"Madhya Pradesh"`), dates in ISO format.
   - `Change Detection`: Compares hash or timestamps.
   - `Upsert / Status Deactivation`: Inserts new records, updates modified records, flags missing records as `WITHDRAWN` or `EXPIRED`.
   - `Provenance & Audit`: Stamps `last_verified_at` and records run metrics in `sync_runs` and `sync_errors`.

2. **Execution**:
   - In-process background runner using FastAPI `BackgroundTasks` / `asyncio` loop.
   - Script runner for manual execution: `python -m scripts.sync --dataset ...`

---

## 8. Verification & Testing Strategy

- **Framework**: `pytest`, `pytest-asyncio`, `httpx` AsyncClient.
- **Unit Tests**:
  - String and location normalizers.
  - Deterministic QCO status calculations (`UPCOMING`, `ACTIVE`, `EXPIRED`, `SUPERSEDED`).
  - Verification status mapping (never binary Real/Fake).
  - Product-to-standard mapping logic.
  - File upload mime/size validators.
- **Integration Tests**:
  - Full CRUD and filtering for standards, QCOs, labs, AHCs, and jewellers.
  - Mock verification workflow and audit log persistence.
  - Jewellery scan and assay report parsing endpoints.
  - Multi-turn chat orchestration with mock RAG and LLM citations.
  - Admin endpoints with JWT RBAC and Admin API Key checks.
- **Reproducibility**:
  - 100% executable offline without live network dependencies using Mock providers.
  - Realistic seed fixtures for Indian Standards (IS 17803, IS 15820, IS 1293), QCOs, and lab directories.
