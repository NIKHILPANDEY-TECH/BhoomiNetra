# BhoomiNetra

### Predictive Intervention Intelligence for Land Acquisition

BhoomiNetra is an AI-assisted decision-support system for identifying land-acquisition projects at risk of delay, explaining contributing model factors, identifying bottlenecks, testing intervention scenarios, and supporting follow-up action.

**Core workflow:** Predict → Explain → Find Bottleneck → Simulate → Recommend → Monitor

## What it provides

- Project and portfolio management
- Delay-risk probability and expected delay duration
- Stage-wise risk and bottleneck analysis
- SHAP-based prediction explanations
- Model-based what-if intervention simulation
- Action-oriented recommendations
- GIS-based project and risk visualization
- Alerts, audit logs, RBAC, and administrative controls
- Data-quality and prediction-reliability information

## Architecture

```text
React / Vite
     │
     │ HTTPS / REST
     ▼
FastAPI Backend
     │
     ├── PostgreSQL + PostGIS
     ├── Risk / Recommendation / Simulation Services
     ├── Authentication / RBAC / Audit
     │
     └── ML Service
           ├── Delay Classification
           ├── Delay Regression
           └── SHAP Explainability
```
Internal Architecture Diagram -
![BhoomiNetra Internal System Architecture](diagram.png)


## Technology

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS, React Router, Axios, Recharts, React-Leaflet, Lucide React |
| Backend | FastAPI, SQLAlchemy, Pydantic, Alembic |
| Database | PostgreSQL, PostGIS |
| ML | Python, Pandas, NumPy, scikit-learn, XGBoost/LightGBM, SHAP, Joblib |
| Deployment | Vercel, Render, managed PostgreSQL |

## Repository

```text
BhoomiNetra/
├── Frontend/       # React application
├── backend/        # FastAPI API and business services
├── ml/             # ML inference service and model artifacts
└── README.md
```

- [Frontend README](Frontend/README.md)
- [Backend README](backend/README.md)
- [ML README](ml/README.md)

## Quick start

### Frontend

```bash
cd Frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
python -m venv .venv
```

Activate the environment, install dependencies, configure `.env`, then:

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API docs:

```text
http://127.0.0.1:8000/docs
```

### ML service

```bash
cd ml
pip install -r requirements.txt
uvicorn app:app --reload
```

## Data transparency

The labelled dataset used for the current MVP training is **synthetic prototype data**. It is not represented as government data.

The system is designed so validated and authorized real project data can replace or supplement prototype data.

Prediction features must represent information available at prediction time. Final-outcome fields are not used as prediction inputs.

## Interpretation

- SHAP shows features contributing to a model prediction; it does not prove causation.
- What-if results are model-based scenario estimates, not guaranteed outcomes.
- The system supports human decision-making; it does not autonomously approve, reject, or execute government actions.
- Performance on synthetic data should not be interpreted as production performance on real government data.

## Security

Do not commit `.env` files, passwords, JWT secrets, database credentials, API keys, or other private configuration.

## Deployment

```text
Vercel
  └── Frontend

Render
  ├── Backend (FastAPI)
  └── ML Service

Managed PostgreSQL / Supabase
  └── Application data
```

BhoomiNetra is an SIH 2026 prototype focused on predictive early warning and intervention intelligence for land-acquisition delays.
