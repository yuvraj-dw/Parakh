# BIS Intelligent Assistant 26107
## Master Backend Development Prompt

You are the primary backend engineer for this project.

Build a clean, production-quality backend foundation for an AI-powered BIS services platform based on Problem Statement 26107: **AI-powered Intelligent Assistant for Indian Standards and BIS Services for Industries and Consumers**.

The system should help industries, MSMEs, startups, students, and consumers interact with BIS-related information and services through a unified application.

## 1. Primary Objective

Build the complete backend as the central orchestration layer between:

1. Frontend
2. PostgreSQL structured BIS database
3. BIS public/authorized data sources
4. RAG service
5. LLM service
6. Verification services
7. Document/image processing
8. Background synchronization jobs

Keep the backend modular so the RAG/AI developer can work independently. Do not tightly couple the backend to one LLM, vector database, embedding model, or RAG implementation.

## 2. Separate the Four Information Types

### Structured BIS data
Examples:
- Standards metadata
- QCOs
- Certification schemes
- BIS-recognized laboratories and scopes
- Assaying & Hallmarking Centres
- Licensed jewellers
- Other public/authorized BIS records

Store structured data in PostgreSQL.

### Document knowledge
Examples:
- BIS documents
- Standards documents
- FAQs
- Circulars
- Guidelines
- Certification documents
- Clauses

This belongs primarily to the RAG/knowledge system. The backend needs a clean retrieval interface.

### Business logic
Examples:
- Laboratory matching
- A&H centre filtering
- Product → standard → QCO → certification mapping
- Verification workflows
- Data freshness
- Provenance
- Certification workflows

This belongs in the backend.

### Generative AI
Examples:
- Natural-language understanding
- Answer generation
- Summarization
- Multilingual explanation
- Document explanation
- Image/OCR interpretation

The backend orchestrates these services.

## 3. LLM Is Not the Source of Truth

The LLM must NOT independently decide:
- Whether certification is legally required
- Whether a HUID is genuine
- Whether a licence is valid
- Whether a laboratory is currently recognized
- Whether a QCO is currently effective
- Whether a particular standard applies
- Whether jewellery is physically genuine

Use authoritative structured data or authoritative verification responses whenever available. The LLM explains information but must not invent authoritative facts.

## 4. Recommended Stack

Use:
- Python
- FastAPI
- PostgreSQL
- SQLAlchemy
- Pydantic
- Alembic
- pytest
- httpx

Optionally use Redis and a worker system such as Celery, RQ, or Arq only where actually useful. Use Docker.

Do not introduce unnecessary infrastructure.

## 5. Suggested Repository Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── config.py
│   ├── dependencies.py
│   ├── api/
│   │   ├── chat.py
│   │   ├── standards.py
│   │   ├── certification.py
│   │   ├── qco.py
│   │   ├── laboratories.py
│   │   ├── hallmarking.py
│   │   ├── jewellers.py
│   │   ├── verification.py
│   │   ├── jewellery.py
│   │   └── documents.py
│   ├── services/
│   ├── models/
│   ├── schemas/
│   ├── repositories/
│   ├── integrations/
│   │   ├── bis/
│   │   ├── rag/
│   │   └── llm/
│   ├── workers/
│   ├── utils/
│   └── middleware/
├── migrations/
├── tests/
├── scripts/
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
├── .env.example
└── README.md
```

Improve this only when there is a strong technical reason. Do not over-engineer.

## 6. Core Database

Use PostgreSQL and proper relational models.

Core entities:

```text
users
conversations
messages

standards
standard_versions
standard_relationships

qcos
certification_schemes

laboratories
laboratory_scopes

ahc_centres
ahc_capabilities

jewellers

products
product_standard_mappings

verification_requests
verification_results

documents

data_sources
sync_runs
sync_errors
```

Add tables only when genuinely necessary.

## 7. Standards

Support at least:

```text
id
is_number
title
year
status
scope
source_url
source_identifier
last_verified_at
created_at
updated_at
```

Where appropriate support revisions, amendments, superseded standards, related standards, and referenced standards.

Do not infer relationships blindly.

## 8. QCOs

Support:

```text
id
product
is_number
ministry
notification
notification_date
effective_date
status
source_url
source_identifier
last_verified_at
created_at
updated_at
```

Support statuses such as:
- upcoming
- active
- expired/superseded
- unknown

Calculate these through explicit backend logic, not an LLM.

## 9. Certification Schemes

Support:

```text
Product
  ↓
Indian Standard
  ↓
QCO
  ↓
Certification Scheme
  ↓
Requirements
```

Expose these relationships through APIs.

## 10. Laboratories

Support:
- recognition code
- name
- address
- city
- district
- state
- contact information where available
- status
- valid_from
- valid_until
- source
- last_verified_at

Laboratory scopes should support:
- IS number
- test
- parameter
- capability

Support queries such as:
- laboratories in a state/city
- laboratories capable of testing against an IS number
- laboratories performing a specific test

Do not use an LLM for simple database filtering.

## 11. Assaying & Hallmarking Centres

Support:
- recognition number
- name
- address
- city
- district
- state
- status
- validity
- metal/capability
- source
- last_verified_at

Support location-based search if coordinates are actually available. Normal city/district/state filtering is sufficient for MVP.

## 12. Licensed Jewellers

Support:
- registration/licence number
- name
- address
- city
- district
- state
- metal/category
- status
- source
- last_verified_at

Users should be able to search and inspect source information.

## 13. Data Provenance

Every BIS-derived record must preserve:

```text
source_name
source_url
source_type
source_identifier
retrieved_at
published_at
last_verified_at
```

The UI should eventually be able to show source and synchronization time.

Never hide the source of regulatory information.

## 14. Data Synchronization

Do not scrape BIS on every request.

Use:

```text
Scheduler
  ↓
Source Fetcher
  ↓
Raw Data
  ↓
Parser
  ↓
Validator
  ↓
Normalizer
  ↓
Database Upsert
  ↓
Change Detection
  ↓
Sync Log
```

Potential jobs:

```text
sync_standards
sync_qcos
sync_certification_schemes
sync_laboratories
sync_laboratory_scopes
sync_ahc_centres
sync_jewellers
```

Every sync should:
1. Fetch
2. Parse
3. Validate
4. Normalize
5. Detect duplicates
6. Upsert
7. Handle deactivated/removed records
8. Update provenance
9. Log changes
10. Record failures

## 15. Do Not Assume BIS Has a Public API

A public BIS web/app feature does not automatically mean a public third-party API exists.

Create provider abstractions, e.g.:

```python
class VerificationProvider:
    async def verify_huid(self, huid):
        raise NotImplementedError
```

Possible implementations:
- BISOfficialApiProvider
- AuthorizedDataFeedProvider
- OfficialRedirectProvider
- MockVerificationProvider

The rest of the backend must not depend on one implementation.

## 16. Never Reverse Engineer Private BIS Systems

Do not:
- bypass authentication
- reverse-engineer private APIs
- defeat rate limits
- impersonate BIS
- scrape protected endpoints
- use undocumented private endpoints in production

If official access is unavailable, provide an official-verification workflow/redirect instead of pretending live access exists.

## 17. Verification Service

Support:
- HUID
- BIS licence
- CRS R-number

Use explicit statuses:

```text
UNKNOWN
PENDING
VERIFIED
NOT_VERIFIED
NOT_FOUND
EXPIRED
ERROR
```

Never reduce verification to simply `REAL` or `FAKE`.

## 18. HUID Verification

Endpoint:

```http
POST /api/v1/verification/huid
```

Request:

```json
{"huid": "ABC123"}
```

Responsibilities:
1. Validate
2. Normalize
3. Create verification request
4. Call authorized provider when available
5. Normalize provider response
6. Save audit information
7. Return status, source, and timestamp

If live authorized access does not exist, clearly indicate that official verification is required. Never fabricate a result.

## 19. BIS Licence Verification

Endpoint:

```http
POST /api/v1/verification/licence
```

Use the same provider architecture.

## 20. CRS R-number Verification

Endpoint:

```http
POST /api/v1/verification/r-number
```

Use the same verification abstraction.

## 21. Jewellery Image Scanning

Endpoint:

```http
POST /api/v1/jewellery/scan
```

Responsibilities:
1. Validate image
2. Enforce size/type limits
3. Temporarily store if needed
4. Send to vision/OCR service
5. Receive detected identifiers
6. Allow user confirmation where appropriate
7. Pass confirmed identifiers to verification
8. Return separate detection and verification states

Example:

```json
{
  "detected": {
    "huid": "ABC123",
    "fineness": "916"
  },
  "verification": {
    "huid": "VERIFIED"
  }
}
```

`detected` does NOT mean `verified`.

## 22. Physical Jewellery Authenticity

Never implement:

```text
photo → definitely genuine gold
```

A photograph cannot establish physical metal composition.

Instead support:

```text
Location
 ↓
Recognized A&H centres
 ↓
Physical testing
 ↓
Assay report
```

## 23. Assay Reports

Support:

```http
POST /api/v1/jewellery/assay-report
```

Allow document processing to extract:
- report number
- centre
- metal
- reported purity
- date
- sample information

Never modify or invent laboratory results.

## 24. Product-to-Standard Mapping

Input example:

```json
{
  "description": "I manufacture stainless steel water bottles for domestic use."
}
```

The backend may call AI to extract:
- product type
- material
- intended use
- capacity
- industry
- other relevant attributes

Combine those attributes with structured BIS data and/or RAG evidence.

Return:

```text
Candidate standard
Reason
Evidence
Confidence/uncertainty
```

Do not blindly trust an LLM's guessed IS number.

## 25. Chat Architecture

Endpoint:

```http
POST /api/v1/chat
```

Flow:

```text
User
 ↓
Chat API
 ↓
ChatService
 ↓
Intent / request classification
 ↓
 ┌──────────────────────┐
 │                      │
Structured BIS data?   Document evidence?
 │                      │
 ↓                      ↓
PostgreSQL             RAG Service
 │                      │
 └──────────┬───────────┘
            ↓
        LLM Service
            ↓
      Evidence validation
            ↓
      Final response
```

The backend orchestrates this flow.

## 26. RAG Integration

Do not implement RAG internals in the backend unless explicitly required.

Use a contract such as:

```http
POST /retrieve
```

Request:

```json
{
  "query": "What testing requirements apply to stainless steel water bottles?",
  "filters": {"standard": "..."},
  "top_k": 8
}
```

Response:

```json
{
  "results": [
    {
      "text": "...",
      "document_id": "...",
      "document_title": "...",
      "standard_number": "...",
      "clause": "...",
      "page": 17,
      "source_url": "...",
      "retrieval_score": 0.91
    }
  ]
}
```

Build the backend around this contract.

## 27. LLM Integration

Create:

```python
class LLMProvider:
    async def generate(self, messages, context):
        ...
```

Do not hard-code one provider throughout the application. Configure providers through environment variables.

## 28. Citations

The final answer should be able to expose:
- document title
- IS number
- clause
- page
- source URL

Example:

```json
{
  "answer": "...",
  "citations": [
    {
      "document_title": "...",
      "standard_number": "IS XXXXX",
      "clause": "5.2",
      "page": 17,
      "source_url": "..."
    }
  ]
}
```

## 29. API Versioning

Use:

```text
/api/v1/
```

from the beginning.

## 30. Pagination

All list APIs must support pagination, e.g.:

```text
?page=1&page_size=20
```

Set reasonable maximum page sizes.

## 31. Filtering

Use structured query parameters, e.g.:

```http
GET /api/v1/laboratories?state=Madhya%20Pradesh&city=Bhopal
```

Do not accept arbitrary SQL-like filters.

## 32. Error Handling

Use consistent errors:

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "Laboratory not found",
    "request_id": "..."
  }
}
```

Do not expose stack traces.

## 33. Logging

Every request should have a request ID.

Log:
- request ID
- endpoint
- status
- duration
- relevant service calls
- errors

Never log:
- passwords
- API keys
- sensitive tokens
- unnecessary personal data

## 34. Security

Implement:
- environment-based secrets
- CORS configuration
- authentication where required
- admin authorization
- rate limiting
- request validation
- upload validation
- file size limits
- secure temporary file handling
- ORM/parameterized SQL
- verification audit logs

## 35. Admin APIs

Create:

```text
GET /api/v1/admin/sync/runs
GET /api/v1/admin/sync/errors
POST /api/v1/admin/sync/{dataset}
GET /api/v1/admin/source-health
```

Protect them.

## 36. Sync Monitoring

Track:

```text
sync_id
dataset
started_at
completed_at
status
records_seen
records_created
records_updated
records_deactivated
errors
source
```

Statuses:

```text
RUNNING
SUCCESS
PARTIAL
FAILED
```

## 37. Testing

Do not consider the backend complete without tests.

### Unit tests
Test:
- validators
- services
- business logic
- normalization
- QCO status logic
- filtering
- verification status mapping

### Integration tests
Test:
- PostgreSQL
- API endpoints
- repositories
- RAG integration
- mocked BIS providers
- mocked LLM provider

### End-to-end scenarios
1. Product description → candidate standards → evidence → certification information
2. Laboratory search → filtered results
3. A&H centre search → results
4. HUID → provider → normalized result
5. Image → OCR/vision → detected HUID → verification

## 38. Mock External Services

Create:
- MockBISVerificationProvider
- MockRAGProvider
- MockLLMProvider

This allows independent backend development.

Do not put fake data into production configuration.

## 39. Environment

Create `.env.example`:

```env
APP_ENV=development
DATABASE_URL=
REDIS_URL=

LLM_PROVIDER=
LLM_API_KEY=

RAG_BASE_URL=
RAG_API_KEY=

BIS_API_BASE_URL=
BIS_API_KEY=

STORAGE_BUCKET=
STORAGE_ENDPOINT=

JWT_SECRET=
```

Never commit real credentials.

## 40. Docker

Provide a development Docker setup with at least:
- backend
- postgres

Add Redis only if actually used.

## 41. Database Migrations

Use Alembic. Every schema change must have a migration.

## 42. API Documentation

FastAPI OpenAPI documentation should cover every endpoint with:
- description
- request schema
- response schema
- error responses
- useful examples

## 43. BIS Data Source Rules

Before implementing any BIS scraper/API client:

1. Identify the actual source.
2. Determine whether it is public.
3. Determine whether automated access is permitted.
4. Check whether an official API exists.
5. Check source stability.
6. Implement a source adapter.

Never invent an API URL.

If a source cannot be verified, create an adapter interface and mock implementation.

## 44. Do Not Build Fake Integrations

Never write something like:

```python
requests.get("https://bis.gov.in/api/something")
```

unless the endpoint has actually been verified.

Do not invent:
- API endpoints
- response formats
- authentication
- BIS database fields
- verification responses

Use placeholders/mocks until real integration is confirmed.

## 45. Data Normalization

Normalize:
- capitalization
- state names
- district names
- whitespace
- identifiers
- dates
- punctuation

Preserve original source values where useful.

Example:

```text
M.P.
Madhya Pradesh
Madhya  Pradesh
```

can map to a canonical representation.

## 46. Data Freshness

Every important record should have:

```text
last_verified_at
```

Support states such as:
- current/verified
- stale
- unknown

Never silently treat stale data as current.

## 47. Implementation Order

### Phase 1: Foundation
- FastAPI
- configuration
- PostgreSQL
- SQLAlchemy
- Alembic
- Docker
- logging
- error handling

### Phase 2: Structured database
- standards
- QCOs
- certification schemes
- laboratories
- A&H centres
- jewellers

### Phase 3: Read APIs
- standards
- QCOs
- certification
- laboratories
- hallmarking
- jewellers

### Phase 4: Synchronization framework
Start with mock/source adapters, then implement verified BIS sources.

### Phase 5
Chat/session backend.

### Phase 6
RAG integration.

### Phase 7
LLM integration.

### Phase 8
Verification abstraction.

### Phase 9
Jewellery image/document processing.

### Phase 10
Admin/sync monitoring.

### Phase 11
Testing, security, production cleanup.

## 48. Definition of Done

The backend is complete only when:

- [ ] Application starts successfully
- [ ] PostgreSQL connection works
- [ ] Alembic migrations work
- [ ] Docker setup works
- [ ] API versioning exists
- [ ] Core database models exist
- [ ] Pydantic schemas exist
- [ ] Repository/data-access layer exists
- [ ] Service layer exists
- [ ] Standards API works
- [ ] QCO API works
- [ ] Certification API works
- [ ] Laboratory API works
- [ ] A&H API works
- [ ] Jeweller API works
- [ ] Chat API exists
- [ ] RAG integration interface exists
- [ ] LLM integration interface exists
- [ ] Verification abstraction exists
- [ ] HUID endpoint exists
- [ ] Licence endpoint exists
- [ ] R-number endpoint exists
- [ ] Jewellery scan endpoint exists
- [ ] Assay report endpoint exists
- [ ] Provenance is stored
- [ ] Sync framework exists
- [ ] Sync logging exists
- [ ] Admin endpoints are protected
- [ ] External integrations can be mocked
- [ ] Unit tests exist
- [ ] Integration tests exist
- [ ] API documentation is complete
- [ ] `.env.example` exists
- [ ] README explains setup
- [ ] No secrets are committed
- [ ] No fake BIS API endpoints are presented as real
- [ ] No undocumented/private BIS API is used
- [ ] No regulatory claim is generated without evidence

## 49. Code Quality

Write code as if another developer will maintain it after the hackathon.

Avoid:
- giant `main.py`
- giant service classes
- duplicated database logic
- hardcoded secrets
- unverified BIS URLs
- magic strings everywhere
- unnecessary global state
- deeply nested conditionals
- duplicated schemas
- LLM calls directly inside random route handlers

Prefer:
- dependency injection
- typed schemas
- small services
- repository abstraction
- provider interfaces
- clear error handling
- reusable utilities
- testable functions

## 50. Before Writing Code

First inspect the entire existing repository.

Do not immediately generate files.

Determine:
1. Existing project structure
2. Existing dependencies
3. Existing database
4. Existing APIs
5. Existing environment configuration
6. Existing frontend expectations
7. Existing RAG integration
8. Existing authentication
9. Existing deployment configuration
10. Existing reusable code

If something is already correct, extend it instead of rewriting it.

## 51. Do Not Break Existing Functionality

If this is an existing repository:
- preserve working features
- preserve existing API contracts unless there is a strong reason to change them
- avoid unnecessary rewrites
- migrate incrementally
- run tests after significant changes

Understand existing code before modifying it.

## 52. Development Behavior

Work in small, verifiable stages.

After each major phase:
1. Run the application.
2. Run tests.
3. Check migrations.
4. Check API startup.
5. Test representative endpoints.
6. Fix errors before proceeding.

Do not build everything and only then discover that the database architecture is broken.

## 53. If Something Is Unknown

Do not guess.

For example, if you do not know whether BIS provides:

```text
/api/huid/verify
```

do NOT invent it.

Instead:

```text
Create VerificationProvider interface
        ↓
Create MockVerificationProvider
        ↓
Leave BISOfficialProvider ready for confirmed integration
```

Apply the same rule to all BIS data sources.

## 54. Final Output Required

After implementation, provide:

### A. Architecture summary
Explain what was built.

### B. Repository structure
Explain important directories.

### C. Database schema
Explain major tables and relationships.

### D. API documentation
List implemented endpoints.

### E. External integrations
Clearly identify:
- implemented
- mocked
- pending official access

### F. Data sources
For every BIS dataset explain:
- source
- synchronization method
- last verification status
- whether automated access is confirmed

### G. Setup instructions
Explain exactly how another developer can run the backend.

### H. Test results
Report:
- tests run
- passed
- failed
- known limitations

### I. Remaining work
Separate:
- Required before demo
- Optional
- Blocked on BIS
- Future enhancement

## 55. Most Important Rule

Build a **real backend**, not a collection of AI prompts.

The architecture must remain useful even if the LLM is removed.

For example, these should work without an LLM:

```text
GET /laboratories
GET /qcos
GET /standards
GET /hallmarking/centres
GET /hallmarking/jewellers
```

The LLM/RAG layer should enhance the system rather than become the system.

Target architecture:

```text
                         FRONTEND
                            |
                            v
                    +---------------+
                    |    FastAPI    |
                    |    Backend    |
                    +-------+-------+
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
     PostgreSQL          RAG Service       LLM Service
          |
          v
    Structured BIS Data
          |
     +----+-----+---------+---------+
     |          |         |         |
     v          v         v         v
 Standards    QCOs      Labs      A&H
                                      |
                                      v
                                  Jewellers

                            +
                            |
                            v
                    Verification Layer
                            |
                 +----------+----------+
                 |          |          |
                HUID      Licence    R-number
                 |
                 v
              BIS official
              service/API
              when authorized
```

Build this systematically.

Prioritize correctness, maintainability, authoritative data handling, clean interfaces, and testability over flashy features.

Do not invent missing BIS APIs or data.

Do not treat AI-generated information as authoritative merely because it sounds confident.

The goal is a backend that can genuinely serve as the foundation of the complete BIS Intelligent Assistant.
