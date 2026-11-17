import hashlib
import os
import uuid
from datetime import datetime, timezone
from io import BytesIO

from cryptography.fernet import Fernet, InvalidToken
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, UploadFile
from fastapi.responses import StreamingResponse
from sqlalchemy import select, or_
from sqlalchemy.orm import Session, selectinload

from app.core.dependencies import get_current_user, require_permission
from app.core.permissions import Permission as PermissionCode
from app.database.database import get_db
from app.models.identity_verification import IdentityVerification
from app.models.permission import Permission
from app.models.role import Role
from app.models.user import User
from app.models.jurisdiction import Jurisdiction
from app.models.organization import Organization
from app.core.security import hash_password
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
                 "full_name": item.full_name, "phone": item.phone, "designation": item.designation,
                 "department": item.department, "state_id": str(item.state_id) if item.state_id else None,
                 "district_id": str(item.district_id) if item.district_id else None,
                 "division_id": str(item.division_id) if item.division_id else None,
                 "role": item.role.name, "is_active": item.is_active}
                for item in users
            ],
        },
        "message": "Success",
    }


@router.get("/user-directory-options")
def user_directory_options(
    user=Depends(require_permission("USER_VIEW")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    roles = db.execute(select(Role).order_by(Role.name)).scalars().all()
    jurisdictions = db.execute(select(Jurisdiction).order_by(Jurisdiction.level, Jurisdiction.name)).scalars().all()
    organizations = db.execute(select(Organization).order_by(Organization.name)).scalars().all()
    return {"data": {
        "roles": [{"name": role.name} for role in roles],
        "jurisdictions": [{"id": str(item.id), "name": item.name, "level": item.level,
                           "parent_id": str(item.parent_id) if item.parent_id else None}
                          for item in jurisdictions],
        "organizations": [{"id": str(item.id), "name": item.name} for item in organizations],
    }, "message": "Success"}


@router.post("/users")
def create_official_user(
    body: dict,
    request: Request,
    user=Depends(require_permission("USER_CREATE")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    required = {"username", "full_name", "role", "password"}
    missing = sorted(key for key in required if not str(body.get(key, "")).strip())
    if missing:
        raise HTTPException(status_code=422, detail=f"Required fields: {', '.join(missing)}")
    username = str(body["username"]).strip()
    email = str(body.get("email") or "").strip().lower() or None
    if len(username) > 120 or len(str(body["full_name"])) > 180:
        raise HTTPException(status_code=422, detail="Username or full name is too long")
    if len(str(body["password"])) < 12:
        raise HTTPException(status_code=422, detail="Temporary password must contain at least 12 characters")
    duplicate_query = select(User).where(User.username == username)
    if email:
        duplicate_query = select(User).where(or_(User.username == username, User.email == email))
    duplicate = db.execute(duplicate_query).scalars().first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Username or email already exists")
    role_name = str(body["role"]).strip().upper()
    if role_name == "NATIONAL_ADMIN":
        raise HTTPException(status_code=403, detail="Create additional National Admin accounts through a separately approved process")
    role = db.execute(select(Role).where(Role.name == role_name)).scalar_one_or_none()
    if not role:
        raise HTTPException(status_code=422, detail="Select a valid existing role")

    def optional_uuid(field):
        value = body.get(field)
        if not value:
            return None
        try:
            return uuid.UUID(str(value))
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=f"Invalid {field}") from exc

    state_id, division_id, district_id = (optional_uuid("state_id"), optional_uuid("division_id"), optional_uuid("district_id"))
    for item_id, expected_level, field in ((state_id, "STATE", "state_id"), (division_id, "DIVISION", "division_id"), (district_id, "DISTRICT", "district_id")):
        if item_id:
            item = db.get(Jurisdiction, item_id)
            if not item or item.level.upper() != expected_level:
                raise HTTPException(status_code=422, detail=f"{field} must reference a {expected_level.lower()} jurisdiction")
    if district_id and state_id:
        district = db.get(Jurisdiction, district_id)
        if district.parent_id != state_id:
            raise HTTPException(status_code=422, detail="Selected district does not belong to the selected state")
    if role_name in {"STATE_ADMIN", "STATE_ANALYST"} and not state_id:
        raise HTTPException(status_code=422, detail="A state assignment is required for this role")
    if role_name in {"DISTRICT_OFFICER", "DISTRICT_ANALYST"} and not district_id:
        raise HTTPException(status_code=422, detail="A district assignment is required for this role")

    organization_id = optional_uuid("organization_id")
    if organization_id and not db.get(Organization, organization_id):
        raise HTTPException(status_code=422, detail="Selected organization does not exist")
    new_user = User(
        username=username, email=email, password_hash=hash_password(str(body["password"])),
        full_name=str(body["full_name"]).strip(), phone=str(body.get("phone") or "").strip() or None,
        designation=str(body.get("designation") or "").strip() or None,
        department=str(body.get("department") or "").strip() or None,
        role_id=role.id, organization_id=organization_id, state_id=state_id,
        division_id=division_id, district_id=district_id, is_active=True,
    )
    db.add(new_user)
    db.flush()
    audit(db, user, "OFFICIAL_USER_CREATED", "USER", new_user.id, request.state.request_id,
          {"username": username, "role": role_name, "state_id": str(state_id) if state_id else None,
           "district_id": str(district_id) if district_id else None})
    db.commit()
    return {"data": {"id": str(new_user.id), "username": new_user.username, "role": role_name},
            "message": "Official account created successfully"}


@router.patch("/users/{user_id}")
def update_official_user(
    user_id: uuid.UUID,
    body: dict,
    request: Request,
    user=Depends(require_permission("USER_UPDATE")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.id == user.id:
        raise HTTPException(status_code=400, detail="Use a separate approved process to change your own administrator account")
    allowed_fields = {"full_name", "email", "phone", "designation", "department", "role", "state_id", "division_id", "district_id", "organization_id"}
    unknown = set(body) - allowed_fields
    if unknown:
        raise HTTPException(status_code=422, detail=f"Unsupported fields: {', '.join(sorted(unknown))}")
    if "role" in body:
        role_name = str(body["role"]).strip().upper()
        if role_name == "NATIONAL_ADMIN":
            raise HTTPException(status_code=403, detail="National Admin assignment requires separate approval")
        role = db.execute(select(Role).where(Role.name == role_name)).scalar_one_or_none()
        if not role:
            raise HTTPException(status_code=422, detail="Select a valid existing role")
        target.role_id = role.id
    for field, maximum in (("full_name", 180), ("phone", 30), ("designation", 120), ("department", 160)):
        if field in body:
            value = str(body[field] or "").strip() or None
            if value and len(value) > maximum:
                raise HTTPException(status_code=422, detail=f"{field} is too long")
            setattr(target, field, value)
    if "email" in body:
        email = str(body["email"] or "").strip().lower() or None
        if email and db.execute(select(User).where(User.email == email, User.id != target.id)).first():
            raise HTTPException(status_code=409, detail="Email already belongs to another account")
        target.email = email
    for field in ("state_id", "division_id", "district_id", "organization_id"):
        if field in body:
            value = body[field]
            try:
                parsed = uuid.UUID(str(value)) if value else None
            except ValueError as exc:
                raise HTTPException(status_code=422, detail=f"Invalid {field}") from exc
            model = Organization if field == "organization_id" else Jurisdiction
            if parsed and not db.get(model, parsed):
                raise HTTPException(status_code=422, detail=f"Selected {field} does not exist")
            setattr(target, field, parsed)
    audit(db, user, "OFFICIAL_USER_UPDATED", "USER", target.id, request.state.request_id,
          {"changed_fields": sorted(body.keys())})
    db.commit()
    return {"data": {"id": str(target.id), "username": target.username}, "message": "Official account updated"}


@router.post("/users/{user_id}/reset-password")
def reset_official_password(
    user_id: uuid.UUID,
    body: dict,
    request: Request,
    user=Depends(require_permission("USER_UPDATE")),
    db: Session = Depends(get_db),
):
    _national_admin(user)
    target = db.get(User, user_id)
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    password = str(body.get("temporary_password") or "")
    if len(password) < 12:
        raise HTTPException(status_code=422, detail="Temporary password must contain at least 12 characters")
    target.password_hash = hash_password(password)
    audit(db, user, "OFFICIAL_USER_PASSWORD_RESET", "USER", target.id, request.state.request_id,
          {"username": target.username})
    db.commit()
    return {"data": {"id": str(target.id)}, "message": "Temporary password updated"}


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
