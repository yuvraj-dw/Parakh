# BIS Intelligent Assistant Backend (Problem Statement 26107)

Backend orchestration layer for Indian Standards and BIS services, supporting industries, MSMEs, jewellers, testing laboratories, and consumers.

## Features

- **Standards & QCO Engine**: Search, filter, and track BIS standards and Quality Control Orders with deterministic status resolution (`ACTIVE`, `UPCOMING`, `SUPERSEDED`, `EXPIRED`).
- **Directories**: Searchable recognized testing laboratories, Assaying and Hallmarking Centres (AHC), and registered jewellers.
- **Verification Engine**: Verification provider abstractions supporting HUID (jewellery hallmarking), licence number, and CRS registration numbers.
- **AI & Vision Assistant**: Grounded conversational assistant with citation tracking, multi-turn dialogs, and jewellery hallmark / assay report parsing.
- **Data Synchronization**: Pluggable sync engine with incremental updates, audit logs, and background run support.
- **Database & Migrations**: Async SQLAlchemy 2.0 ORM with Alembic schema management and PostgreSQL/SQLite support.

## Quickstart

### 1. Local Setup

```bash
# Clone and enter the repository
cd "SIH 2"

# Create and activate virtual environment
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
```

### 2. Database Migrations & Seed Data

```bash
# Run Alembic migrations
alembic upgrade head

# Populate realistic BIS seed data
python -m scripts.seed_data
```

### 3. Run Development Server

```bash
uvicorn app.main:app --reload --port 8000
```

Open interactive Swagger API Documentation at:
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

### 4. Run Test Suite

```bash
pytest -v
```

### 5. Run with Docker Compose

To start both PostgreSQL 16 and the FastAPI backend:

```bash
docker compose up -d --build
```

To stop the containers:

```bash
docker compose down
```

## API Structure

- `GET /health` - Service health status
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login (OAuth2 password flow)
- `GET /api/v1/auth/me` - Current authenticated user
- `GET /api/v1/standards` - Search and list Indian Standards
- `GET /api/v1/qco` - List and filter Quality Control Orders
- `GET /api/v1/laboratories` - Directory of testing laboratories
- `GET /api/v1/certification/schemes` - BIS certification schemes
- `POST /api/v1/certification/map-product` - Map product to applicable standards
- `GET /api/v1/hallmarking/centres` - Directory of AHC centres
- `GET /api/v1/jewellers` - Directory of registered jewellers
- `POST /api/v1/verification/verify` - Verify HUID, Licence, or CRS R-number
- `POST /api/v1/jewellery/scan` - Vision scan of jewellery hallmark marks
- `POST /api/v1/jewellery/assay-report` - Parse assay test reports
- `POST /api/v1/chat` - Conversational Q&A with standards citations
- `POST /api/v1/admin/sync/trigger` - Trigger dataset synchronization
