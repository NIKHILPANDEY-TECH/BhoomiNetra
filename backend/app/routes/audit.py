from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.models.audit_log import AuditLog

router = APIRouter(prefix="/api/audit", tags=["Audit"])


@router.get("")
def logs(
    page: int = Query(1, ge=1),
    limit: int = Query(25, ge=1, le=100),
    action: str | None = None,
    user=Depends(require_permission("AUDIT_VIEW")),
    db: Session = Depends(get_db),
):
    query = select(AuditLog)
    if action:
        query = query.where(AuditLog.action == action)
    total = db.query(AuditLog).count()
    rows = db.execute(
        query.order_by(AuditLog.timestamp.desc())
        .offset((page - 1) * limit)
        .limit(limit)
    ).scalars().all()
    return {
        "data": [
            {
                "id": str(row.id),
                "user_id": str(row.user_id) if row.user_id else None,
                "action": row.action,
                "resource_type": row.resource_type,
                "resource_id": row.resource_id,
                "timestamp": row.timestamp.isoformat(),
                "request_id": row.request_id,
                "metadata": row.metadata_json or {},
            }
            for row in rows
        ],
        "page": page,
        "limit": limit,
        "total": total,
        "message": "Success",
    }
