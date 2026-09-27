from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import get_current_user
from app.database.database import get_db
from app.models.alert import Alert
from app.models.project import Project
from app.routes.projects import visible

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.get("")
def alerts(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = visible(
        select(Alert).join(Project, Project.id == Alert.project_id).where(
            Project.is_archived.is_(False)
        ),
        user,
    )
    rows = db.execute(
        query.order_by(Alert.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()
    return {
        "data": [
            {
                "id": str(alert.id),
                "project_id": str(alert.project_id),
                "type": alert.type,
                "message": alert.message,
                "is_read": alert.is_read,
                "created_at": alert.created_at.isoformat(),
            }
            for alert in rows
        ],
        "page": page,
        "limit": limit,
        "message": "Success",
    }


@router.patch("/{alert_id}/read")
def read(
    alert_id: str,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    alert = db.get(Alert, alert_id)
    if not alert:
        raise HTTPException(404, "Alert not found")

    project = db.get(Project, alert.project_id)
    if not project or project.is_archived:
        raise HTTPException(404, "Alert not found")

    scoped = db.execute(
        visible(select(Project).where(Project.id == project.id), user)
    ).scalar_one_or_none()
    if scoped is None:
        raise HTTPException(403, "Permission denied")

    alert.is_read = True
    db.commit()
    return {"data": {"is_read": True}, "message": "Success"}
