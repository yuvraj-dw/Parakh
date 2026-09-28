# Parakh

A backend service for Indian Standards search, regulatory verification, and assistance.

Built with FastAPI, PostgreSQL, and multimodal AI support.

## What's Inside

- **Standards & QCOs**: Search Indian Standards, Quality Control Orders, and check validity statuses.
- **Verification**: Verify jewellery HUID, BIS licence numbers, and CRS registration numbers.
- **Vision & AI**: Hallmark mark recognition from photos and assay report parsing, with grounded assistant Q&A.
- **Directories**: Searchable directories of recognized testing labs, hallmarking centres, and registered jewellers.

## Quickstart

### Prerequisites
- Python 3.10+
- PostgreSQL or SQLite

### Setup

```bash
# Clone the repository
git clone https://github.com/yuvraj-dw/Parakh.git
cd Parakh

# Set up virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
.\venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Run database migrations
alembic upgrade head

# (Optional) Seed initial data
python -m scripts.seed_data

# Start local server
uvicorn app.main:app --reload --port 8000
```

Once running, interactive API docs are available at `/docs`.

## Running Tests

```bash
pytest -v
```
