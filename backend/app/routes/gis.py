from fastapi import APIRouter, Depends, Query
from geoalchemy2 import Geography
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.models.prediction import Prediction
from app.models.project import Project
from app.routes.projects import visible

router = APIRouter(prefix="/api/gis", tags=["GIS"])


@router.get("/projects")
def gis(
    min_lat: float = Query(..., ge=-90, le=90),
    max_lat: float = Query(..., ge=-90, le=90),
    min_lng: float = Query(..., ge=-180, le=180),
    max_lng: float = Query(..., ge=-180, le=180),
    user=Depends(require_permission("PROJECT_READ")),
    db: Session = Depends(get_db),
):
    if min_lat > max_lat or min_lng > max_lng:
        return {"data": [], "message": "Invalid viewport"}

    envelope = cast(
        func.ST_SetSRID(
            func.ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat),
            4326,
        ),
        Geography(geometry_type="POLYGON", srid=4326),
    )

    latest = (
        select(
            Prediction.project_id,
            Prediction.risk_probability,
            Prediction.risk_band,
            func.row_number()
            .over(
                partition_by=Prediction.project_id,
                order_by=Prediction.created_at.desc(),
            )
            .label("rn"),
        )
        .subquery()
    )

    query = visible(
        select(Project, latest.c.risk_probability, latest.c.risk_band)
        .join(latest, latest.c.project_id == Project.id, isouter=True)
        .where(
            Project.is_archived.is_(False),
            latest.c.rn.is_(None) | (latest.c.rn == 1),
            func.ST_Intersects(Project.location, envelope),
        ),
        user,
    )

    rows = db.execute(query).all()
    output = []
    for project, risk, risk_band in rows:
        if project.location is None:
            continue
        point = db.execute(
            select(func.ST_Y(project.location), func.ST_X(project.location))
        ).one()
        output.append(
            {
                "project_id": project.public_id,
                "latitude": float(point[0]),
                "longitude": float(point[1]),
                "risk": float(risk) if risk is not None else None,
                "risk_band": risk_band,
            }
        )

    return {"data": output, "message": "Success"}
