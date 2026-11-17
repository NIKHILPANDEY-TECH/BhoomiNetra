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


## National Admin access control

The National Admin dashboard now includes `/access-control` for managing the role-permission matrix, enabling/disabling accounts, and reviewing optional identity submissions. The backend enforces every permission; frontend navigation visibility is only a usability layer.

### Identity document security configuration

Identity uploads are intentionally disabled until `IDENTITY_ENCRYPTION_KEY` is set. Generate a Fernet key with:

```bash
python -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Set the generated value as `IDENTITY_ENCRYPTION_KEY` in the backend deployment environment. Keep it secret and backed up securely. If the key is lost or changed, previously stored documents cannot be decrypted. The API accepts PDF/JPEG/PNG up to 5 MB and encrypts the file before storing it in the database. Do not request Aadhaar by default; prefer official employee credentials and collect only what policy requires. Establish a retention/deletion policy and encrypted database backups before production use.

The identity table is created by the existing `init_db()` metadata bootstrap. Deploy the backend changes before using the new frontend page.
