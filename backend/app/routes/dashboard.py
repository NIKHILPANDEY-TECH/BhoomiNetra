from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.models.prediction import Prediction
from app.models.project import Project
from app.routes.projects import visible

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


def latest_predictions():
    return (
        select(
            Prediction.project_id,
            Prediction.risk_band,
            Prediction.risk_probability,
            func.row_number()
            .over(
                partition_by=Prediction.project_id,
                order_by=Prediction.created_at.desc(),
            )
            .label("rn"),
        )
        .subquery()
    )


@router.get("/summary")
def summary(user=Depends(require_permission("REPORT_VIEW")), db: Session = Depends(get_db)):
    base = visible(select(Project).where(Project.is_archived.is_(False)), user).subquery()
    total = db.scalar(select(func.count()).select_from(base)) or 0
    active = db.scalar(select(func.count()).select_from(base).where(base.c.status == "ACTIVE")) or 0
    return {"data": {"total_projects": total, "active_projects": active}, "message": "Success"}


@router.get("/risk-distribution")
def risk(user=Depends(require_permission("REPORT_VIEW")), db: Session = Depends(get_db)):
    latest = latest_predictions()
    query = visible(
        select(latest.c.risk_band, func.count())
        .join(Project, Project.id == latest.c.project_id)
        .where(Project.is_archived.is_(False), latest.c.rn == 1),
        user,
    )
    rows = db.execute(query.group_by(latest.c.risk_band)).all()
    return {"data": [{"risk_band": band, "count": count} for band, count in rows], "message": "Success"}


@router.get("/state-distribution")
def state(user=Depends(require_permission("REPORT_VIEW")), db: Session = Depends(get_db)):
    query = visible(
        select(Project.state, func.count()).where(Project.is_archived.is_(False)),
        user,
    )
    rows = db.execute(query.group_by(Project.state)).all()
    return {"data": [{"state": state, "count": count} for state, count in rows], "message": "Success"}


@router.get("/stage-distribution")
def stage(user=Depends(require_permission("REPORT_VIEW")), db: Session = Depends(get_db)):
    query = visible(
        select(Project.current_stage, func.count()).where(Project.is_archived.is_(False)),
        user,
    )
    rows = db.execute(query.group_by(Project.current_stage)).all()
    return {"data": [{"stage": stage, "count": count} for stage, count in rows], "message": "Success"}


@router.get("/top-bottlenecks")
def bottlenecks(user=Depends(require_permission("REPORT_VIEW")), db: Session = Depends(get_db)):
    query = visible(
        select(
            Project.current_stage,
            func.avg(Project.days_current_stage - Project.historical_stage_avg_days).label("avg_overrun"),
        ).where(Project.is_archived.is_(False)),
        user,
    )
    rows = db.execute(
        query.group_by(Project.current_stage)
        .order_by(func.avg(Project.days_current_stage - Project.historical_stage_avg_days).desc())
        .limit(10)
    ).all()
    return {"data": [{"stage": stage, "avg_overrun": float(overrun or 0)} for stage, overrun in rows], "message": "Success"}
