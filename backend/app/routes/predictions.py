from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.database.database import get_db
from app.models.prediction import Prediction
from app.models.risk_history import RiskHistory
from app.routes.projects import get_project
from app.core.dependencies import require_permission
from app.services.ml_service import MLServiceUnavailable, ml_service
from app.services.risk_service import risk_band
from app.services.audit_service import audit
from app.schemas.prediction import PredictionOut

router = APIRouter(prefix="/api/projects", tags=["Predictions"])


def features(p):
    return ml_service.build_features(p)


@router.post("/{project_id}/predict", response_model=PredictionOut)
def predict(project_id: str, request: Request, user=Depends(require_permission("PREDICTION_RUN")), db: Session = Depends(get_db)):
    p = get_project(db, project_id, user)
    f = features(p)
    try:
        result = ml_service.predict(f)
    except MLServiceUnavailable as exc:
        raise HTTPException(status_code=503, detail=str(exc)) from exc

    prob = float(result["risk_probability"])
    days = float(result["predicted_delay_days"])
    band = risk_band(prob)
    model_version = result.get("model_version", "unknown")
    pred = Prediction(
        project_id=p.id,
        risk_probability=prob,
        risk_band=band,
        predicted_delay_days=days,
        model_version=model_version,
        created_by=user.id,
    )
    db.add(pred)
    db.add(RiskHistory(project_id=p.id, risk_probability=prob, predicted_delay_days=days, model_version=model_version))
    audit(db, user, "PREDICTION_RUN", "PROJECT", p.id, request.state.request_id)
    db.commit()
    db.refresh(pred)
    return PredictionOut(
        project_id=p.public_id,
        risk_probability=prob,
        risk_percent=prob * 100,
        risk_band=band,
        predicted_delay_days=days,
        model_version=model_version,
        created_at=pred.created_at.isoformat(),
    )


@router.get("/{project_id}/prediction", response_model=PredictionOut)
def latest(project_id: str, user=Depends(require_permission("PREDICTION_VIEW")), db: Session = Depends(get_db)):
    p = get_project(db, project_id, user)
    pred = db.execute(select(Prediction).where(Prediction.project_id == p.id).order_by(Prediction.created_at.desc())).scalars().first()
    if not pred:
        raise HTTPException(404, "Prediction not found")
    return PredictionOut(project_id=p.public_id, risk_probability=pred.risk_probability, risk_percent=pred.risk_probability * 100, risk_band=pred.risk_band, predicted_delay_days=pred.predicted_delay_days, model_version=pred.model_version, created_at=pred.created_at.isoformat())


@router.get("/{project_id}/risk-history")
def history(project_id: str, page: int = 1, limit: int = 20, user=Depends(require_permission("PREDICTION_VIEW")), db: Session = Depends(get_db)):
    p = get_project(db, project_id, user)
    q = select(RiskHistory).where(RiskHistory.project_id == p.id).order_by(RiskHistory.created_at.desc())
    rows = db.execute(q.offset((page - 1) * min(limit, 100)).limit(min(limit, 100))).scalars().all()
    return {"data": [{"risk_probability": r.risk_probability, "predicted_delay_days": r.predicted_delay_days, "model_version": r.model_version, "created_at": r.created_at.isoformat()} for r in rows], "page": page, "limit": min(limit, 100), "message": "Success"}
