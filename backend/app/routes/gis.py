from fastapi import APIRouter, Depends, Query
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session
from geoalchemy2 import Geometry, Geography

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.models.project import Project
from app.models.prediction import Prediction
from app.routes.projects import visible


router = APIRouter(prefix="/api/gis", tags=["GIS"])


@router.get("/projects")
def gis(
    min_lat: float = Query(8.0),
    max_lat: float = Query(37.0),
    min_lng: float = Query(68.0),
    max_lng: float = Query(98.0),
    user=Depends(require_permission("PROJECT_READ")),
    db: Session = Depends(get_db),
):
    """
    Return projects visible to the current user inside the requested
    geographic bounding box.

    Project.location is stored as Geography(Point, 4326).

    Important:
    - ST_Intersects works with Geography.
    - ST_X / ST_Y require Geometry, so location is cast to Geometry
      only for coordinate extraction.
    """

    # ---------------------------------------------------------
    # 1. Create the viewport bounding box
    # ---------------------------------------------------------
    envelope = cast(
        func.ST_SetSRID(
            func.ST_MakeEnvelope(
                min_lng,
                min_lat,
                max_lng,
                max_lat,
            ),
            4326,
        ),
        Geography(geometry_type="POLYGON", srid=4326),
    )

    # ---------------------------------------------------------
    # 2. Get latest prediction for every project
    # ---------------------------------------------------------
    latest_prediction = (
        select(
            Prediction.project_id.label("project_id"),
            Prediction.risk_probability.label("risk_probability"),
            Prediction.risk_band.label("risk_band"),
            func.row_number()
            .over(
                partition_by=Prediction.project_id,
                order_by=Prediction.created_at.desc(),
            )
            .label("rn"),
        )
        .subquery()
    )

    # ---------------------------------------------------------
    # 3. Extract coordinates
    #
    # Project.location = Geography(Point, 4326)
    #
    # ST_X/ST_Y do NOT accept Geography directly.
    # Cast Geography -> Geometry first.
    # ---------------------------------------------------------
    latitude = func.ST_Y(
        cast(Project.location, Geometry)
    ).label("latitude")

    longitude = func.ST_X(
        cast(Project.location, Geometry)
    ).label("longitude")

    # ---------------------------------------------------------
    # 4. Build query
    # ---------------------------------------------------------
    query = (
        select(
            Project.public_id.label("project_id"),
            latitude,
            longitude,
            latest_prediction.c.risk_probability,
            latest_prediction.c.risk_band,
        )
        .outerjoin(
            latest_prediction,
            (
                latest_prediction.c.project_id == Project.id
            )
            & (
                latest_prediction.c.rn == 1
            ),
        )
        .where(
            Project.is_archived.is_(False),
            Project.location.is_not(None),
            func.ST_Intersects(
                Project.location,
                envelope,
            ),
        )
    )

    # ---------------------------------------------------------
    # 5. Apply existing RBAC visibility rules
    # ---------------------------------------------------------
    query = visible(query, user)

    # ---------------------------------------------------------
    # 6. Limit response size for fast GIS rendering
    # ---------------------------------------------------------
    query = query.limit(5000)

    rows = db.execute(query).all()

    # ---------------------------------------------------------
    # 7. Convert DB rows to frontend format
    # ---------------------------------------------------------
    output = []

    for row in rows:
        risk_probability = row.risk_probability

        if risk_probability is None:
            risk = None
            risk_band = "UNSCORED"
        else:
            risk = float(risk_probability)
            risk_band = row.risk_band or "UNSCORED"

        output.append(
            {
                "project_id": row.project_id,
                "latitude": float(row.latitude),
                "longitude": float(row.longitude),
                "risk": risk,
                "risk_band": risk_band,
            }
        )

    return {
        "data": output,
        "message": "Success",
    }