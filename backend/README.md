# BhoomiNetra Backend

FastAPI backend for authentication, authorization, project management, database access, ML orchestration, explainability, recommendations, simulation, GIS, alerts, reports, and audit logging.

## Stack

FastAPI · SQLAlchemy · Pydantic · Alembic · PostgreSQL · PostGIS · JWT authentication

## Structure

```text
backend/
├── app/
│   ├── core/         # configuration, security, permissions
│   ├── database/     # database setup
│   ├── models/       # SQLAlchemy models
│   ├── schemas/      # Pydantic schemas
│   ├── routes/       # API endpoints
│   ├── services/     # business and integration logic
│   └── main.py
├── alembic/
├── scripts/
├── tests/
├── requirements.txt
└── .env.example
```

## Run locally

```bash
cd backend
python -m venv .venv
```

Activate the environment and install:

```bash
pip install -r requirements.txt
```

Copy the environment template:

```bash
copy .env.example .env
```

macOS/Linux:

```bash
cp .env.example .env
```

Set the database, authentication, CORS, and ML-service values required by the application.

Start:

```bash
uvicorn app.main:app --reload
```

API:

```text
http://127.0.0.1:8000
```

Docs:

```text
http://127.0.0.1:8000/docs
```

Health:

```text
GET /health
```

## API areas

- Authentication and users
- Projects and lifecycle management
- Predictions and risk
- SHAP explanations
- What-if simulation
- Recommendations
- Dashboard analytics
- GIS / GeoJSON
- Alerts and interventions
- Reports
- Audit logs
- Data import and administration

Use `/docs` for the current request and response schemas.

## ML integration

The backend does not train models during API requests.

```text
Request
  ↓
Authentication + permission/scope checks
  ↓
Project and feature validation
  ↓
ML service
  ↓
Risk / bottleneck / recommendation processing
  ↓
Persistence + audit
  ↓
Response
```

The ML service URL is supplied through backend environment configuration.

## Authorization

```text
User → Role → Permissions + Geographic Scope + Project Assignment
```

The backend enforces authorization; hiding a frontend button is not considered security.

## Database

PostgreSQL is the primary database and PostGIS provides geographic support.

```bash
alembic upgrade head
```

Production data should enter through the validated import/normalization workflow.

## Testing

```bash
pytest
```

Tests cover core API behavior, authentication/permissions, and ML-service failure handling.

## Deployment

Typical Render configuration:

```text
Root Directory: backend
Build Command: pip install -r requirements.txt
Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
Health Check: /health
```

The root directory must match the actual repository folder casing.

## Security

Keep secrets in environment variables. Never commit `.env`, passwords, JWT secrets, database credentials, or API keys. Use HTTPS and restrict CORS to trusted frontend origins.
