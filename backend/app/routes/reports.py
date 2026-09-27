from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.models.prediction import Prediction
from app.models.project import Project
from app.routes.projects import visible

router = APIRouter(prefix="/api/reports", tags=["Reports"])


def latest_prediction_subquery():
    return select(
        Prediction.project_id,
        Prediction.risk_probability,
        Prediction.risk_band,
        Prediction.predicted_delay_days,
        func.row_number().over(
            partition_by=Prediction.project_id,
            order_by=Prediction.created_at.desc(),
        ).label("rn"),
    ).subquery()


@router.get("/overview")
def overview(user=Depends(require_permission("REPORT_VIEW")), db: Session = Depends(get_db)):
    projects_q = visible(select(Project).where(Project.is_archived.is_(False)), user)
    projects = db.execute(projects_q).scalars().all()
    latest = latest_prediction_subquery()
    scored_q = visible(
        select(latest)
        .join(Project, Project.id == latest.c.project_id)
        .where(Project.is_archived.is_(False), latest.c.rn == 1),
        user,
    )
    scored = db.execute(scored_q).all()
    risks = [float(row.risk_probability) for row in scored]
    delays = [float(row.predicted_delay_days) for row in scored]
    return {
        "data": {
            "total_projects": len(projects),
            "active_projects": sum(p.status == "ACTIVE" for p in projects),
            "high_risk": sum(row.risk_band == "HIGH" for row in scored),
            "medium_risk": sum(row.risk_band == "MEDIUM" for row in scored),
            "low_risk": sum(row.risk_band == "LOW" for row in scored),
            "average_risk": sum(risks) / len(risks) if risks else 0,
            "average_predicted_delay": sum(delays) / len(delays) if delays else 0,
            "bottlenecks": sum((p.days_current_stage or 0) > (p.historical_stage_avg_days or 0) for p in projects),
            "generated_at": __import__("datetime").datetime.utcnow().isoformat(),
        },
        "message": "Success",
    }
