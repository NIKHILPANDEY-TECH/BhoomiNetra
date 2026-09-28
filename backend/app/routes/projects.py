from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from geoalchemy2.elements import WKTElement
from sqlalchemy import Integer, cast, func, select
from sqlalchemy.orm import Session

from app.core.dependencies import project_scope, require_permission
from app.database.database import get_db
from app.models.prediction import Prediction
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate, ProjectOut, ProjectUpdate
from app.services.audit_service import audit
from geoalchemy2.shape import to_shape

router = APIRouter(prefix="/api/projects", tags=["Projects"])


def visible(q, user):
    role = user.role.name

    if role == "NATIONAL_ADMIN":
        return q

    if role in ("STATE_ADMIN", "STATE_ANALYST"):
        return q.where(Project.state_id == user.state_id)

    if role == "DIVISION_OFFICER":
        return q.where(Project.division_id == user.division_id)

    if role in ("DISTRICT_OFFICER", "DISTRICT_ANALYST"):
        return q.where(Project.district_id == user.district_id)

    if role == "PROJECT_OFFICER":
        return q.where(Project.assigned_user_id == user.id)

    return q.where(Project.organization_id == user.organization_id)


def get_project(db, pid, user, include_archived=False):
    try:
        project_uuid = UUID(pid)
        identifier = Project.id == project_uuid
    except (ValueError, AttributeError):
        identifier = Project.public_id == pid

    q = select(Project).where(identifier)

    if not include_archived:
        q = q.where(Project.is_archived.is_(False))

    project = db.execute(visible(q, user)).scalars().first()

    if not project:
        raise HTTPException(
            status_code=404,
            detail="Project not found",
        )

    return project


def project_output(project):
    latitude = None
    longitude = None

    if project.location is not None:
        try:
            geometry = to_shape(project.location)
            longitude = float(geometry.x)
            latitude = float(geometry.y)
        except Exception:
            pass

    data = {
        field: getattr(project, field)
        for field in ProjectOut.model_fields
        if field not in ("latitude", "longitude")
        and hasattr(project, field)
    }

    data["id"] = str(project.id)
    data["latitude"] = latitude
    data["longitude"] = longitude

    return ProjectOut(**data)


@router.post("", response_model=ProjectOut)
def create(
    body: ProjectCreate,
    request: Request,
    user=Depends(require_permission("PROJECT_CREATE")),
    db: Session = Depends(get_db),
):
    max_number = db.scalar(
    select(
        func.max(
            cast(
                func.substring(Project.public_id, 4),
                Integer,
            )
        )
    )
)

    next_number = (max_number or 0) + 1

    data = body.model_dump()
    latitude = data.pop("latitude", None)
    longitude = data.pop("longitude", None)

    project = Project(
        public_id=f"LA-{next_number:05d}",
        **data,
        organization_id=user.organization_id,
        state_id=user.state_id,
        division_id=user.division_id,
        district_id=user.district_id,
    )

    if latitude is not None and longitude is not None:
        project.location = WKTElement(
            f"POINT({longitude} {latitude})",
            srid=4326,
        )

    db.add(project)
    db.flush()

    audit(
        db,
        user,
        "PROJECT_CREATE",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()
    db.refresh(project)

    return project_output(project)


@router.get("")
def list_projects(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    state: str | None = None,
    district: str | None = None,
    project_type: str | None = None,
    current_stage: str | None = None,
    status: str | None = None,
    risk_band: str | None = None,
    search: str | None = None,
    user=Depends(require_permission("PROJECT_READ")),
    db: Session = Depends(get_db),
):
    q = select(Project).where(Project.is_archived.is_(False))
    q = visible(q, user)

    if state:
        q = q.where(Project.state == state)

    if district:
        q = q.where(Project.district == district)

    if project_type:
        q = q.where(Project.project_type == project_type)

    if current_stage:
        q = q.where(Project.current_stage == current_stage)

    if status:
        q = q.where(Project.status == status)

    if search:
        q = q.where(Project.project_name.ilike(f"%{search}%"))

    if risk_band:
        latest_prediction = (
            select(
                Prediction.project_id,
                Prediction.risk_band,
                func.row_number()
                .over(
                    partition_by=Prediction.project_id,
                    order_by=Prediction.created_at.desc(),
                )
                .label("row_number"),
            )
            .subquery()
        )

        q = q.join(
            latest_prediction,
            latest_prediction.c.project_id == Project.id,
        ).where(
            latest_prediction.c.row_number == 1,
            latest_prediction.c.risk_band == risk_band,
        )

    total = db.scalar(
        select(func.count()).select_from(q.subquery())
    )

    projects = db.execute(
        q.order_by(Project.created_at.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()

    return {
        "data": [
            {
                "id": str(project.id),
                "public_id": project.public_id,
                "project_name": project.project_name,
                "state": project.state,
                "district": project.district,
                "status": project.status,
                "current_stage": project.current_stage,
            }
            for project in projects
        ],
        "page": page,
        "limit": limit,
        "total": total,
        "message": "Success",
    }


@router.get("/{project_id}", response_model=ProjectOut)
def detail(
    project_id: str,
    user=Depends(require_permission("PROJECT_READ")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)
    return project_output(project)


@router.put("/{project_id}", response_model=ProjectOut)
def update(
    project_id: str,
    body: ProjectUpdate,
    request: Request,
    user=Depends(require_permission("PROJECT_UPDATE")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)

    if project.status in (
        "APPROVED",
        "ACTIVE",
        "COMPLETED",
        "ARCHIVED",
    ):
        raise HTTPException(
            status_code=409,
            detail="Project cannot be modified in its current status",
        )

    if not project_scope(project, user):
        raise HTTPException(
            status_code=403,
            detail="Project outside authorized scope",
        )

    for key, value in body.model_dump(exclude_unset=True).items():
        setattr(project, key, value)

    audit(
        db,
        user,
        "PROJECT_UPDATE",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()
    db.refresh(project)

    return project_output(project)


@router.post("/{project_id}/submit")
def submit(
    project_id: str,
    request: Request,
    user=Depends(require_permission("PROJECT_SUBMIT")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)

    if project.status != "DRAFT":
        raise HTTPException(
            status_code=409,
            detail="Invalid status transition",
        )

    project.status = "SUBMITTED"

    audit(
        db,
        user,
        "PROJECT_SUBMIT",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()

    return {
        "data": {"status": project.status},
        "message": "Success",
    }


@router.post("/{project_id}/approve")
def approve(
    project_id: str,
    request: Request,
    user=Depends(require_permission("PROJECT_APPROVE")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)

    if project.status != "SUBMITTED":
        raise HTTPException(
            status_code=409,
            detail="Invalid status transition",
        )

    if (
        user.role.name == "PROJECT_DATA_OPERATOR"
        and project.assigned_user_id == user.id
    ):
        raise HTTPException(
            status_code=403,
            detail="Business rule prevents approval",
        )

    project.status = "APPROVED"

    audit(
        db,
        user,
        "PROJECT_APPROVE",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()

    return {
        "data": {"status": project.status},
        "message": "Success",
    }


@router.post("/{project_id}/reject")
def reject(
    project_id: str,
    request: Request,
    user=Depends(require_permission("PROJECT_REJECT")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)

    if project.status != "SUBMITTED":
        raise HTTPException(
            status_code=409,
            detail="Invalid status transition",
        )

    project.status = "DRAFT"

    audit(
        db,
        user,
        "PROJECT_REJECT",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()

    return {
        "data": {"status": project.status},
        "message": "Success",
    }


@router.post("/{project_id}/assign")
def assign(
    project_id: str,
    user_id: UUID,
    request: Request,
    user=Depends(require_permission("PROJECT_ASSIGN")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)
    target = db.get(User, user_id)

    if not target:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    if not target.is_active:
        raise HTTPException(
            status_code=400,
            detail="Target user is inactive",
        )

    allowed_roles = {
        "PROJECT_OFFICER",
        "PROJECT_DATA_OPERATOR",
        "DISTRICT_OFFICER",
        "DISTRICT_ANALYST",
    }

    if target.role.name not in allowed_roles:
        raise HTTPException(
            status_code=400,
            detail="User role cannot be assigned to a project",
        )

    if (
        project.organization_id
        and target.organization_id
        and project.organization_id != target.organization_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Target user belongs to a different organization",
        )

    if (
        project.state_id
        and target.state_id
        and project.state_id != target.state_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Target user belongs to a different state scope",
        )

    if (
        project.district_id
        and target.district_id
        and project.district_id != target.district_id
    ):
        raise HTTPException(
            status_code=403,
            detail="Target user belongs to a different district scope",
        )

    project.assigned_user_id = target.id

    audit(
        db,
        user,
        "PROJECT_ASSIGN",
        "PROJECT",
        project.id,
        request.state.request_id,
        {"assignee": str(target.id)},
    )

    db.commit()

    return {
        "data": {
            "assigned_user_id": str(target.id),
        },
        "message": "Success",
    }


@router.delete("/{project_id}")
def archive(
    project_id: str,
    request: Request,
    user=Depends(require_permission("PROJECT_ARCHIVE")),
    db: Session = Depends(get_db),
):
    project = get_project(db, project_id, user)

    project.is_archived = True
    project.status = "ARCHIVED"

    audit(
        db,
        user,
        "PROJECT_ARCHIVE",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()

    return {
        "data": {"status": project.status},
        "message": "Success",
    }


@router.post("/{project_id}/restore")
def restore(
    project_id: str,
    request: Request,
    user=Depends(require_permission("PROJECT_RESTORE")),
    db: Session = Depends(get_db),
):
    project = get_project(
        db,
        project_id,
        user,
        include_archived=True,
    )

    if not project.is_archived:
        raise HTTPException(
            status_code=409,
            detail="Project is not archived",
        )

    project.is_archived = False
    project.status = "DRAFT"

    audit(
        db,
        user,
        "PROJECT_RESTORE",
        "PROJECT",
        project.id,
        request.state.request_id,
    )

    db.commit()

    return {
        "data": {"status": project.status},
        "message": "Success",
    }