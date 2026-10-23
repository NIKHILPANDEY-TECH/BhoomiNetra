"""Idempotently provision BhoomiNetra demo roles, permissions and users.

Run from the backend directory against the SAME DATABASE_URL used by the
running deployment:
    python -m scripts.create_demo_users

Passwords can be supplied with DEMO_PASSWORD_<ROLE> environment variables.
The local-citizen account defaults to the documented demo password only for
an explicitly enabled demo environment. Change it before public production use.
"""
from __future__ import annotations

import os
import sys
from pathlib import Path

# Support both `python scripts/create_demo_users.py` and
# `python -m scripts.create_demo_users` from the backend directory.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.core.permissions import Permission as PermissionEnum
from app.core.security import hash_password
from app.database.database import SessionLocal, init_db
from app.models import Jurisdiction, Organization, Permission, Role, User

ROLE_PERMISSIONS: dict[str, list[str] | None] = {
    "NATIONAL_ADMIN": None,  # None means every declared permission.
    "NATIONAL_ANALYST": ["PROJECT_READ", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "REPORT_VIEW", "MODEL_VIEW", "AUDIT_VIEW"],
    "STATE_ADMIN": ["PROJECT_READ", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_SUBMIT", "PROJECT_APPROVE", "PROJECT_REJECT", "PROJECT_ARCHIVE", "PROJECT_RESTORE", "PROJECT_ASSIGN", "PREDICTION_RUN", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "INTERVENTION_CREATE", "REPORT_VIEW", "AUDIT_VIEW"],
    "STATE_ANALYST": ["PROJECT_READ", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "REPORT_VIEW"],
    "DIVISION_OFFICER": ["PROJECT_READ", "PROJECT_UPDATE", "PROJECT_SUBMIT", "PROJECT_APPROVE", "PROJECT_REJECT", "PROJECT_ASSIGN", "PREDICTION_RUN", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "INTERVENTION_CREATE", "REPORT_VIEW"],
    "DISTRICT_OFFICER": ["PROJECT_READ", "PROJECT_UPDATE", "PROJECT_SUBMIT", "PROJECT_APPROVE", "PROJECT_REJECT", "PROJECT_ASSIGN", "PREDICTION_RUN", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "INTERVENTION_CREATE", "REPORT_VIEW"],
    "DISTRICT_ANALYST": ["PROJECT_READ", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "REPORT_VIEW"],
    "PROJECT_OFFICER": ["PROJECT_READ", "PROJECT_UPDATE", "PROJECT_SUBMIT", "PREDICTION_RUN", "PREDICTION_VIEW", "SHAP_VIEW", "SIMULATION_RUN", "RECOMMENDATION_VIEW", "INTERVENTION_CREATE"],
    "PROJECT_DATA_OPERATOR": ["PROJECT_READ", "PROJECT_CREATE", "PROJECT_UPDATE", "PROJECT_SUBMIT", "PREDICTION_VIEW", "DATA_IMPORT"],
    "SYSTEM_SECURITY_ADMIN": ["USER_VIEW", "USER_CREATE", "USER_UPDATE", "USER_DISABLE", "ROLE_MANAGE", "PERMISSION_MANAGE", "AUDIT_VIEW", "SECURITY_VIEW", "MODEL_VIEW"],
    "LOCAL_CITIZEN": ["CITIZEN_PROJECT_READ", "CITIZEN_REPORT_CREATE", "CITIZEN_REPORT_VIEW"],
}

# username, role, password environment variable, state, district
DEMO_USERS = [
    ("national.admin", "NATIONAL_ADMIN", "DEMO_PASSWORD_NATIONAL", None, None),
    ("mp.state", "STATE_ADMIN", "DEMO_PASSWORD_STATE", "Madhya Pradesh", None),
    ("bhopal.district", "DISTRICT_OFFICER", "DEMO_PASSWORD_DISTRICT", "Madhya Pradesh", "Bhopal"),
    ("project.officer", "PROJECT_OFFICER", "DEMO_PASSWORD_PROJECT", "Madhya Pradesh", "Bhopal"),
    ("data.operator", "PROJECT_DATA_OPERATOR", "DEMO_PASSWORD_DATA", "Madhya Pradesh", "Bhopal"),
    ("citizen.demo", "LOCAL_CITIZEN", "DEMO_PASSWORD_CITIZEN", "Madhya Pradesh", "Mandsaur"),
]


def get_or_create_jurisdiction(db, name: str, level: str, parent_id=None):
    item = db.query(Jurisdiction).filter_by(name=name, level=level).first()
    if item is None:
        item = Jurisdiction(name=name, level=level, parent_id=parent_id)
        db.add(item)
        db.flush()
    elif parent_id is not None and item.parent_id != parent_id:
        item.parent_id = parent_id
        db.flush()
    return item


def main() -> None:
    init_db()
    db = SessionLocal()
    try:
        # Create every enum permission first; role assignment below fails loudly
        # if the code refers to a permission that does not exist.
        for permission_enum in PermissionEnum:
            name = permission_enum.value
            if db.query(Permission).filter_by(name=name).first() is None:
                db.add(Permission(name=name))
        db.flush()
        permissions = {p.name: p for p in db.query(Permission).all()}

        for role_name, configured_names in ROLE_PERMISSIONS.items():
            names = [p.value for p in PermissionEnum] if configured_names is None else configured_names
            missing = sorted(set(names) - permissions.keys())
            if missing:
                raise RuntimeError(f"Role {role_name} references missing permissions: {missing}")
            role = db.query(Role).filter_by(name=role_name).first()
            if role is None:
                role = Role(name=role_name)
                db.add(role)
                db.flush()
            role.permissions = [permissions[name] for name in names]

        org_name = "BhoomiMitra Demo Organization"
        organization = db.query(Organization).filter_by(name=org_name).first()
        if organization is None:
            organization = Organization(name=org_name)
            db.add(organization)
            db.flush()

        state = get_or_create_jurisdiction(db, "Madhya Pradesh", "STATE")
        bhopal = get_or_create_jurisdiction(db, "Bhopal", "DISTRICT", state.id)
        mandsaur = get_or_create_jurisdiction(db, "Mandsaur", "DISTRICT", state.id)
        db.flush()
        roles = {r.name: r for r in db.query(Role).all()}

        for username, role_name, env_key, state_name, district_name in DEMO_USERS:
            user = db.query(User).filter_by(username=username).first()
            configured_password = os.getenv(env_key)
            if user is None:
                # Keep the documented citizen demo credential; staff defaults
                # remain compatible with the existing demo setup.
                password = configured_password or (
                    "CitizenDemo-2026!" if username == "citizen.demo" else "ChangeMe-123!"
                )
                user = User(
                    username=username,
                    password_hash=hash_password(password),
                    role_id=roles[role_name].id,
                    organization_id=organization.id,
                    state_id=state.id if state_name else None,
                    district_id=(mandsaur.id if district_name == "Mandsaur" else bhopal.id)
                    if district_name else None,
                )
                db.add(user)
            else:
                # Never reset existing staff passwords unless explicitly set in env.
                if configured_password or username == "citizen.demo":
                    password = configured_password or "CitizenDemo-2026!"
                    user.password_hash = hash_password(password)
                user.role_id = roles[role_name].id
                user.organization_id = organization.id
                user.state_id = state.id if state_name else None
                user.district_id = (mandsaur.id if district_name == "Mandsaur" else bhopal.id) if district_name else None

        db.commit()
        # Verify the two records that caused the reported failure are actually
        # present in the database this command connected to.
        citizen_role = db.query(Role).filter_by(name="LOCAL_CITIZEN").first()
        citizen_user = db.query(User).filter_by(username="citizen.demo").first()
        if citizen_role is None or citizen_user is None or citizen_user.role_id != citizen_role.id or not citizen_user.is_active:
            raise RuntimeError("Seed completed but LOCAL_CITIZEN/citizen.demo verification failed")
        print(f"Demo-user seed successful. Database: {db.get_bind().url.host}/{db.get_bind().url.database}")
        print(f"Verified role: {citizen_role.name}; user: {citizen_user.username}; active: {citizen_user.is_active}")
        print(f"Users present: {db.query(User).count()}; roles present: {db.query(Role).count()}; permissions present: {db.query(Permission).count()}")
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    main()
