from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Request
from geoalchemy2.elements import WKTElement
from sqlalchemy import Integer, cast, func, select, or_, asc, desc
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
    limit: int = Query(50, ge=1, le=100),
    state: str | None = None,
    district: str | None = None,
    project_type: str | None = None,
    current_stage: str | None = None,
    status: str | None = None,
    risk_band: str | None = None,
    search: str | None = None,
    sort_by: str = Query("created_at"),
    sort_order: str = Query("desc"),
    user=Depends(require_permission("PROJECT_READ")),
    db: Session = Depends(get_db),
):
    """Return one page of projects with database-side filtering and sorting."""
    allowed_sort_fields = {
        "created_at": Project.created_at,
        "project_name": Project.project_name,
        "state": Project.state,
        "district": Project.district,
        "status": Project.status,
        "current_stage": Project.current_stage,
        "risk_probability": None,
        "predicted_delay_days": None,
    }
    if sort_by not in allowed_sort_fields:
        raise HTTPException(status_code=422, detail="Unsupported sort field")
    if sort_order.lower() not in ("asc", "desc"):
        raise HTTPException(status_code=422, detail="sort_order must be asc or desc")

    latest_prediction = (
        select(
            Prediction.project_id.label("project_id"),
            Prediction.risk_probability.label("risk_probability"),
            Prediction.risk_band.label("risk_band"),
            Prediction.predicted_delay_days.label("predicted_delay_days"),
            func.row_number()
            .over(
                partition_by=Prediction.project_id,
                order_by=Prediction.created_at.desc(),
            )
            .label("row_number"),
        ).subquery()
    )

    q = select(Project).where(Project.is_archived.is_(False))
    q = visible(q, user).outerjoin(
        latest_prediction,
        (latest_prediction.c.project_id == Project.id)
        & (latest_prediction.c.row_number == 1),
    )

    if state:
        q = q.where(Project.state.ilike(f"%{state.strip()}%"))
    if district:
        q = q.where(Project.district.ilike(f"%{district.strip()}%"))
    if project_type:
        q = q.where(Project.project_type == project_type)
    if current_stage:
        q = q.where(Project.current_stage.ilike(f"%{current_stage.strip()}%"))
    if status:
        q = q.where(Project.status == status)
    if search:
        term = f"%{search.strip()}%"
        q = q.where(or_(Project.project_name.ilike(term), Project.public_id.ilike(term)))
    if risk_band:
        if risk_band.upper() == "UNSCORED":
            q = q.where(latest_prediction.c.project_id.is_(None))
        else:
            q = q.where(latest_prediction.c.risk_band == risk_band.upper())

    total = db.scalar(select(func.count()).select_from(q.order_by(None).subquery())) or 0
    sort_column = allowed_sort_fields[sort_by]
    if sort_by == "risk_probability":
        sort_column = latest_prediction.c.risk_probability
    elif sort_by == "predicted_delay_days":
        sort_column = latest_prediction.c.predicted_delay_days
    sort_expression = asc(sort_column) if sort_order.lower() == "asc" else desc(sort_column)

    projects = db.execute(
        q.order_by(sort_expression.nullslast(), Project.public_id.asc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()

    page_ids = [project.id for project in projects]
    prediction_rows = []
    if page_ids:
        prediction_rows = db.execute(
            select(
                latest_prediction.c.project_id,
                latest_prediction.c.risk_probability,
                latest_prediction.c.risk_band,
                latest_prediction.c.predicted_delay_days,
            ).where(
                latest_prediction.c.row_number == 1,
                latest_prediction.c.project_id.in_(page_ids),
            )
        ).all()
    prediction_by_project = {row.project_id: row for row in prediction_rows}

    data = []
    for project in projects:
        prediction = prediction_by_project.get(project.id)
        data.append({
            "id": str(project.id),
            "public_id": project.public_id,
            "project_name": project.project_name,
            "state": project.state,
            "district": project.district,
            "project_type": project.project_type,
            "status": project.status,
            "current_stage": project.current_stage,
            "risk_probability": float(prediction.risk_probability) if prediction and prediction.risk_probability is not None else None,
            "risk_band": prediction.risk_band if prediction else "UNSCORED",
            "predicted_delay_days": float(prediction.predicted_delay_days) if prediction and prediction.predicted_delay_days is not None else None,
        })

    return {
        "data": data,
        "page": page,
        "limit": limit,
        "total": total,
        "total_pages": (total + limit - 1) // limit,
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
