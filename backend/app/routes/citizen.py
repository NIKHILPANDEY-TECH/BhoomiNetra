from datetime import datetime
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from geoalchemy2 import Geography, Geometry
from pydantic import BaseModel, Field
from sqlalchemy import cast, func, select
from sqlalchemy.orm import Session

from app.core.dependencies import require_citizen
from app.database.database import get_db
from app.models.citizen_report import CitizenReport
from app.models.project import Project
from app.models.user import User
from app.routes.projects import visible
from app.services.audit_service import audit

router = APIRouter(prefix="/api/citizen", tags=["Local Citizen"])

PUBLIC_STATUSES = ("APPROVED", "ACTIVE", "COMPLETED")


class CitizenReportCreate(BaseModel):
    project_id: str = Field(min_length=1, max_length=50)
    category: Literal[
        "PROJECT_UPDATE",
        "SITE_CONCERN",
        "ACCESS_OR_SAFETY",
        "REHABILITATION_QUERY",
        "OTHER",
    ]
    description: str = Field(min_length=10, max_length=2000)


def public_projects_query(user: User):
    query = select(Project).where(
        Project.is_archived.is_(False),
        Project.status.in_(PUBLIC_STATUSES),
    )
    return visible(query, user)


def get_public_project(db: Session, project_id: str, user: User) -> Project:
    try:
        identifier = Project.id == UUID(project_id)
    except (ValueError, TypeError, AttributeError):
        identifier = Project.public_id == project_id

    project = db.execute(
        public_projects_query(user).where(identifier)
    ).scalars().first()

    # Do not reveal whether a project exists outside the citizen's area.
    if not project:
        raise HTTPException(status_code=404, detail="Public project not found in your area")
    return project


def project_coordinates(db: Session, project_id):
    row = db.execute(
        select(
            func.ST_Y(cast(Project.location, Geometry)).label("latitude"),
            func.ST_X(cast(Project.location, Geometry)).label("longitude"),
        ).where(Project.id == project_id, Project.location.is_not(None))
    ).first()
    if not row:
        return None, None
    return float(row.latitude), float(row.longitude)


def public_project_data(project: Project, latitude=None, longitude=None):
    """Return only fields approved for citizen-facing display."""
    return {
        "id": project.public_id,
        "public_id": project.public_id,
        "project_name": project.project_name,
        "state": project.state,
        "district": project.district,
        "project_type": project.project_type,
        "status": project.status,
        "current_stage": project.current_stage,
        "project_start_date": project.project_start_date.isoformat() if project.project_start_date else None,
        "planned_completion_date": project.planned_completion_date.isoformat() if project.planned_completion_date else None,
        "compensation_progress": float(project.compensation_progress or 0),
        "rr_progress": float(project.rr_progress or 0),
        "latitude": latitude,
        "longitude": longitude,
        "updated_at": project.updated_at.isoformat() if project.updated_at else None,
    }


@router.get("/summary")
def summary(
    user: User = Depends(require_citizen("CITIZEN_PROJECT_READ")),
    db: Session = Depends(get_db),
):
    visible_projects = public_projects_query(user).subquery()
    total_projects = db.scalar(select(func.count()).select_from(visible_projects)) or 0
    active_projects = db.scalar(
        select(func.count()).select_from(visible_projects).where(visible_projects.c.status == "ACTIVE")
    ) or 0
    completed_projects = db.scalar(
        select(func.count()).select_from(visible_projects).where(visible_projects.c.status == "COMPLETED")
    ) or 0
    my_reports = db.scalar(
        select(func.count()).select_from(CitizenReport).where(CitizenReport.user_id == user.id)
    ) or 0
    open_reports = db.scalar(
        select(func.count()).select_from(CitizenReport).where(
            CitizenReport.user_id == user.id,
            CitizenReport.status != "RESOLVED",
        )
    ) or 0
    return {
        "data": {
            "state": user.state_jurisdiction.name if user.state_jurisdiction else None,
            "district": user.district_jurisdiction.name if user.district_jurisdiction else None,
            "total_projects": total_projects,
            "active_projects": active_projects,
            "completed_projects": completed_projects,
            "my_reports": my_reports,
            "open_reports": open_reports,
        },
        "message": "Success",
    }


@router.get("/projects")
def list_public_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    search: str | None = Query(default=None, max_length=150),
    user: User = Depends(require_citizen("CITIZEN_PROJECT_READ")),
    db: Session = Depends(get_db),
):
    query = public_projects_query(user)
    if search and search.strip():
        term = f"%{search.strip()}%"
        query = query.where(
            Project.project_name.ilike(term) | Project.public_id.ilike(term)
        )

    total = db.scalar(
        select(func.count()).select_from(query.order_by(None).subquery())
    ) or 0
    projects = db.execute(
        query.order_by(Project.project_name.asc(), Project.public_id.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()

    return {
        "data": [public_project_data(project) for project in projects],
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit,
        "message": "Success",
    }


@router.get("/projects/{project_id}")
def public_project_detail(
    project_id: str,
    user: User = Depends(require_citizen("CITIZEN_PROJECT_READ")),
    db: Session = Depends(get_db),
):
    project = get_public_project(db, project_id, user)
    latitude, longitude = project_coordinates(db, project.id)
    return {"data": public_project_data(project, latitude, longitude), "message": "Success"}


@router.get("/map")
def public_map_projects(
    min_lat: float = Query(8, ge=-90, le=90),
    max_lat: float = Query(37, ge=-90, le=90),
    min_lng: float = Query(68, ge=-180, le=180),
    max_lng: float = Query(98, ge=-180, le=180),
    limit: int = Query(500, ge=1, le=500),
    user: User = Depends(require_citizen("CITIZEN_PROJECT_READ")),
    db: Session = Depends(get_db),
):
    if min_lat >= max_lat or min_lng >= max_lng:
        raise HTTPException(status_code=422, detail="Invalid map viewport bounds")

    envelope = cast(
        func.ST_SetSRID(func.ST_MakeEnvelope(min_lng, min_lat, max_lng, max_lat), 4326),
        Geography(geometry_type="POLYGON", srid=4326),
    )
    latitude = func.ST_Y(cast(Project.location, Geometry)).label("latitude")
    longitude = func.ST_X(cast(Project.location, Geometry)).label("longitude")

    query = select(
        Project.id,
        Project.public_id,
        Project.project_name,
        Project.state,
        Project.district,
        Project.current_stage,
        Project.status,
        latitude,
        longitude,
    ).where(
        Project.is_archived.is_(False),
        Project.status.in_(PUBLIC_STATUSES),
        Project.location.is_not(None),
        func.ST_Intersects(Project.location, envelope),
    )
    query = visible(query, user).order_by(Project.public_id.asc()).limit(limit + 1)
    rows = db.execute(query).all()
    has_more = len(rows) > limit

    data = [
        {
            "project_id": row.public_id,
            "project_name": row.project_name,
            "state": row.state,
            "district": row.district,
            "current_stage": row.current_stage,
            "status": row.status,
            "latitude": float(row.latitude),
            "longitude": float(row.longitude),
        }
        for row in rows[:limit]
    ]
    return {"data": data, "has_more": has_more, "limit": limit, "message": "Success"}


@router.post("/reports", status_code=201)
def create_report(
    body: CitizenReportCreate,
    request: Request,
    user: User = Depends(require_citizen("CITIZEN_REPORT_CREATE")),
    db: Session = Depends(get_db),
):
    project = get_public_project(db, body.project_id, user)
    report = CitizenReport(
        user_id=user.id,
        project_id=project.id,
        category=body.category,
        description=body.description.strip(),
        status="SUBMITTED",
    )
    db.add(report)
    db.flush()
    audit(
        db,
        user,
        "CITIZEN_REPORT_CREATE",
        "CITIZEN_REPORT",
        report.id,
        request.state.request_id,
        {"project_id": project.public_id, "category": body.category},
    )
    db.commit()
    db.refresh(report)
    return {
        "data": {
            "id": str(report.id),
            "project_id": project.public_id,
            "project_name": project.project_name,
            "category": report.category,
            "description": report.description,
            "status": report.status,
            "created_at": report.created_at.isoformat() if report.created_at else datetime.utcnow().isoformat(),
        },
        "message": "Report submitted successfully",
    }


@router.get("/reports")
def list_my_reports(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    user: User = Depends(require_citizen("CITIZEN_REPORT_VIEW")),
    db: Session = Depends(get_db),
):
    base = select(CitizenReport).where(CitizenReport.user_id == user.id)
    total = db.scalar(select(func.count()).select_from(base.subquery())) or 0
    rows = db.execute(
        base.order_by(CitizenReport.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()
    project_ids = {row.project_id for row in rows}
    project_map = {}
    if project_ids:
        project_map = {
            project.id: project
            for project in db.execute(select(Project).where(Project.id.in_(project_ids))).scalars().all()
        }

    data = []
    for report in rows:
        project = project_map.get(report.project_id)
        data.append({
            "id": str(report.id),
            "project_id": project.public_id if project else None,
            "project_name": project.project_name if project else "Project unavailable",
            "category": report.category,
            "description": report.description,
            "status": report.status,
            "created_at": report.created_at.isoformat() if report.created_at else None,
            "updated_at": report.updated_at.isoformat() if report.updated_at else None,
        })
    return {
        "data": data,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit,
        "message": "Success",
    }
