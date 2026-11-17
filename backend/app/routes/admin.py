import hashlib
import os
import uuid
from datetime import datetime, timezone
from io import BytesIO

from cryptography.fernet import Fernet, InvalidToken
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user, require_permission
from app.core.permissions import Permission as PermissionCode
from app.database.database import get_db
from app.models.identity_verification import IdentityVerification
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.services.audit_service import audit
from app.services.ml_service import ml_service

router = APIRouter(prefix="/api/admin", tags=["Administration"])
MAX_ID_BYTES = 5 * 1024 * 1024
ALLOWED_DOCUMENT_TYPES = {"image/jpeg", "image/png", "application/pdf"}
ALLOWED_ID_TYPES = {"GOVERNMENT_ID", "OFFICIAL_EMPLOYEE_ID", "OTHER"}


def _national_admin(user):
    if user.role.name != "NATIONAL_ADMIN":
        raise HTTPException(status_code=403, detail="National administrator access only")
    return user


def _identity_cipher():
    key = os.getenv("IDENTITY_ENCRYPTION_KEY", "").strip()
    if not key:
        raise HTTPException(
            status_code=503,
            detail="Identity uploads are disabled until IDENTITY_ENCRYPTION_KEY is configured.",
        )
    try:
        return Fernet(key.encode("ascii"))
    except Exception as exc:
        raise HTTPException(status_code=503, detail="Identity encryption is not configured correctly.") from exc


@router.get("/model/info")
def model_info(user=Depends(require_permission("MODEL_VIEW"))):
    return {"data": ml_service.get_model_metadata(), "message": "Success"}


@router.get("/access-control")
def access_control(
    user=Depends(require_permission("ROLE_MANAGE")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    roles = db.execute(select(Role).options(selectinload(Role.permissions)).order_by(Role.name)).scalars().all()
    permissions = [p.value for p in PermissionCode]
    users = db.execute(select(User).options(selectinload(User.role)).order_by(User.username)).scalars().all()
    return {
        "data": {
            "permissions": permissions,
            "roles": [
                {"id": str(role.id), "name": role.name, "permissions": sorted(p.name for p in role.permissions)}
                for role in roles
            ],
            "users": [
                {"id": str(item.id), "username": item.username, "email": item.email,
                 "role": item.role.name, "is_active": item.is_active}
                for item in users
            ],
        },
        "message": "Success",
    }


@router.put("/roles/{role_id}/permissions")
def update_role_permissions(
    role_id: uuid.UUID,
    body: dict,
    request: Request,
    user=Depends(require_permission("ROLE_MANAGE")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    role = db.execute(
        select(Role).where(Role.id == role_id).options(selectinload(Role.permissions))
    ).scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    requested = body.get("permissions")
    if not isinstance(requested, list) or any(not isinstance(x, str) for x in requested):
        raise HTTPException(status_code=422, detail="permissions must be a list of permission names")
    allowed = {item.value for item in PermissionCode}
    unknown = sorted(set(requested) - allowed)
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unknown permissions: {', '.join(unknown)}")
    if role.name == "NATIONAL_ADMIN" and set(requested) != allowed:
        raise HTTPException(status_code=400, detail="The NATIONAL_ADMIN role must retain every permission to prevent lockout.")

    permission_rows = db.execute(select(Permission).where(Permission.name.in_(requested))).scalars().all()
    found = {p.name for p in permission_rows}
    missing = sorted(set(requested) - found)
    if missing:
        raise HTTPException(status_code=409, detail=f"Permission records missing from database: {', '.join(missing)}")

    role.permissions = permission_rows
    audit(db, user, "ROLE_PERMISSIONS_UPDATED", "ROLE", role.id, request.state.request_id,
          {"role": role.name, "permissions": sorted(requested)})
    db.commit()
    return {"data": {"role": role.name, "permissions": sorted(requested)}, "message": "Permissions updated"}


@router.patch("/users/{user_id}/status")
def update_user_status(
    user_id: uuid.UUID,
    body: dict,
    request: Request,
    user=Depends(require_permission("USER_DISABLE")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    active = body.get("is_active")
    if not isinstance(active, bool):
        raise HTTPException(status_code=422, detail="is_active must be a boolean")
    if target.id == user.id and not active:
        raise HTTPException(status_code=400, detail="You cannot disable your own account.")
    if target.role.name == "NATIONAL_ADMIN" and not active:
        admins = db.execute(select(User).join(Role).where(Role.name == "NATIONAL_ADMIN", User.is_active.is_(True))).scalars().all()
        if len(admins) <= 1:
            raise HTTPException(status_code=400, detail="At least one active national administrator must remain.")
    target.is_active = active
    audit(db, user, "USER_ENABLED" if active else "USER_DISABLED", "USER", target.id,
          request.state.request_id, {"username": target.username})
    db.commit()
    return {"data": {"id": str(target.id), "is_active": target.is_active}, "message": "User status updated"}


@router.post("/identity/upload")
async def upload_identity_document(
    request: Request,
    document_type: str = Form(...),
    file: UploadFile = File(...),
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if document_type not in ALLOWED_ID_TYPES:
        raise HTTPException(status_code=422, detail="Unsupported identity document type")
    if file.content_type not in ALLOWED_DOCUMENT_TYPES:
        raise HTTPException(status_code=415, detail="Upload a PDF, JPEG or PNG document")
    content = await file.read(MAX_ID_BYTES + 1)
    if not content or len(content) > MAX_ID_BYTES:
        raise HTTPException(status_code=413, detail="Document must be between 1 byte and 5 MB")
    cipher = _identity_cipher()
    encrypted = cipher.encrypt(content)
    record = IdentityVerification(
        user_id=user.id,
        document_type=document_type,
        original_filename=(file.filename or "identity-document")[:255],
        content_type=file.content_type,
        encrypted_document=encrypted,
        status="PENDING",
    )
    db.add(record)
    audit(db, user, "IDENTITY_DOCUMENT_SUBMITTED", "IDENTITY_VERIFICATION", record.id,
          request.state.request_id, {"document_type": document_type, "sha256": hashlib.sha256(content).hexdigest()})
    db.commit()
    return {"data": {"id": str(record.id), "status": record.status}, "message": "Identity document submitted for review"}


@router.get("/identity")
def list_identity_submissions(
    user=Depends(require_permission("SECURITY_VIEW")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    rows = db.execute(select(IdentityVerification).order_by(IdentityVerification.created_at.desc())).scalars().all()
    return {"data": [
        {"id": str(x.id), "user_id": str(x.user_id), "document_type": x.document_type,
         "filename": x.original_filename, "status": x.status, "review_note": x.review_note,
         "created_at": x.created_at.isoformat() if x.created_at else None}
        for x in rows
    ], "message": "Success"}


@router.get("/identity/{verification_id}/document")
def download_identity_document(
    verification_id: uuid.UUID,
    user=Depends(require_permission("SECURITY_VIEW")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    record = db.get(IdentityVerification, verification_id)
    if not record:
        raise HTTPException(status_code=404, detail="Identity submission not found")
    try:
        content = _identity_cipher().decrypt(record.encrypted_document)
    except InvalidToken as exc:
        raise HTTPException(status_code=500, detail="Stored identity document could not be decrypted") from exc
    safe_name = record.original_filename.replace('"', "").replace("\\", "_")
    return StreamingResponse(BytesIO(content), media_type=record.content_type,
                             headers={"Content-Disposition": f'attachment; filename="{safe_name}"'})


@router.patch("/identity/{verification_id}/review")
def review_identity_document(
    verification_id: uuid.UUID,
    body: dict,
    request: Request,
    user=Depends(require_permission("SECURITY_VIEW")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    record = db.get(IdentityVerification, verification_id)
    if not record:
        raise HTTPException(status_code=404, detail="Identity submission not found")
    status_value = body.get("status")
    if status_value not in {"VERIFIED", "REJECTED"}:
        raise HTTPException(status_code=422, detail="status must be VERIFIED or REJECTED")
    record.status = status_value
    record.review_note = str(body.get("review_note", ""))[:500] or None
    record.reviewed_by = user.id
    record.reviewed_at = datetime.now(timezone.utc)
    audit(db, user, "IDENTITY_DOCUMENT_REVIEWED", "IDENTITY_VERIFICATION", record.id,
          request.state.request_id, {"status": status_value})
    db.commit()
    return {"data": {"id": str(record.id), "status": record.status}, "message": "Review saved"}
