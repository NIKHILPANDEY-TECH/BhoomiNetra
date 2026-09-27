from fastapi import APIRouter, Depends
from sqlalchemy import select

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.models.prediction import Prediction
from app.routes.projects import get_project
from app.services.bottleneck_service import analyze
from app.services.recommendation_service import generate

router = APIRouter(prefix="/api/projects", tags=["Recommendations"])


@router.get("/{project_id}/recommendations")
def recs(project_id: str, user=Depends(require_permission("RECOMMENDATION_VIEW")), db=Depends(get_db)):
    project = get_project(db, project_id, user)
    prediction = db.execute(
        select(Prediction)
        .where(Prediction.project_id == project.id)
        .order_by(Prediction.created_at.desc())
    ).scalars().first()
    risk = prediction.risk_probability if prediction else 0.0
    return {"data": generate(project, risk, [], analyze(project)), "message": "Success"}
