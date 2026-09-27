# BhoomiMitra Backend

FastAPI modular monolith for SIH26017. It integrates the existing `ml/` artifact package without retraining or changing artifacts. The included ML package uses `.pkl` artifacts, so the backend points to `../ml/models` rather than renaming or rewriting them.

## Run

```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate
# Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# set DATABASE_URL, SECRET_KEY and JWT_SECRET_KEY
alembic upgrade head
python scripts/create_demo_users.py
python scripts/seed_database.py
uvicorn app.main:app --reload
```

Swagger: `http://localhost:8000/docs`

The seed dataset is synthetic prototype data. It must not be represented as government data. Formal security assessment, departmental authorization, penetration testing, infrastructure hardening, data-governance review and applicable government certification are required before real production deployment.
