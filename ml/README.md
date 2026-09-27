# BhoomiMitra ML Service

Standalone inference service for the BhoomiMitra V2 model. It runs separately from the main FastAPI backend.

## Local

```powershell
cd ml
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

Health: `http://localhost:8001/health`

## Render

Root directory: `ml`
Build: `pip install -r requirements.txt`
Start: `uvicorn app:app --host 0.0.0.0 --port $PORT`
Health: `/health`

This package is inference-ready and keeps the trained artifacts required by the V2 model. Training dependencies are separated in `requirements-training.txt`.
