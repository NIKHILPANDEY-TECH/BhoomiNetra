import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from app.database.database import SessionLocal, init_db
from app.models import User, Role, Permission, Organization, Jurisdiction
from app.core.security import hash_password
from app.core.permissions import Permission as PermissionEnum

init_db(); db=SessionLocal()
all_permissions=[p.value for p in PermissionEnum]
for name in all_permissions:
    if not db.query(Permission).filter_by(name=name).first(): db.add(Permission(name=name))
db.flush()
perm={p.name:p for p in db.query(Permission).all()}
role_map={
 "NATIONAL_ADMIN":all_permissions,
 "NATIONAL_ANALYST":["PROJECT_READ","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","REPORT_VIEW","MODEL_VIEW","AUDIT_VIEW"],
 "STATE_ADMIN":["PROJECT_READ","PROJECT_CREATE","PROJECT_UPDATE","PROJECT_SUBMIT","PROJECT_APPROVE","PROJECT_REJECT","PROJECT_ARCHIVE","PROJECT_RESTORE","PROJECT_ASSIGN","PREDICTION_RUN","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","INTERVENTION_CREATE","REPORT_VIEW","AUDIT_VIEW"],
 "STATE_ANALYST":["PROJECT_READ","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","REPORT_VIEW"],
 "DIVISION_OFFICER":["PROJECT_READ","PROJECT_UPDATE","PROJECT_SUBMIT","PROJECT_APPROVE","PROJECT_REJECT","PROJECT_ASSIGN","PREDICTION_RUN","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","INTERVENTION_CREATE","REPORT_VIEW"],
 "DISTRICT_OFFICER":["PROJECT_READ","PROJECT_UPDATE","PROJECT_SUBMIT","PROJECT_APPROVE","PROJECT_REJECT","PROJECT_ASSIGN","PREDICTION_RUN","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","INTERVENTION_CREATE","REPORT_VIEW"],
 "DISTRICT_ANALYST":["PROJECT_READ","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","REPORT_VIEW"],
 "PROJECT_OFFICER":["PROJECT_READ","PROJECT_UPDATE","PROJECT_SUBMIT","PREDICTION_RUN","PREDICTION_VIEW","SHAP_VIEW","SIMULATION_RUN","RECOMMENDATION_VIEW","INTERVENTION_CREATE"],
 "PROJECT_DATA_OPERATOR":["PROJECT_READ","PROJECT_CREATE","PROJECT_UPDATE","PROJECT_SUBMIT","PREDICTION_VIEW","DATA_IMPORT"],
 "SYSTEM_SECURITY_ADMIN":["USER_VIEW","USER_CREATE","USER_UPDATE","USER_DISABLE","ROLE_MANAGE","PERMISSION_MANAGE","AUDIT_VIEW","SECURITY_VIEW","MODEL_VIEW"]}
for name, names in role_map.items():
    role=db.query(Role).filter_by(name=name).first() or Role(name=name)
    db.add(role); db.flush(); role.permissions=[perm[n] for n in names]
org=db.query(Organization).filter_by(name="BhoomiMitra Demo Organization").first() or Organization(name="BhoomiMitra Demo Organization"); db.add(org); db.flush()
state=db.query(Jurisdiction).filter_by(name="Madhya Pradesh",level="STATE").first() or Jurisdiction(name="Madhya Pradesh",level="STATE"); db.add(state); db.flush()
district=db.query(Jurisdiction).filter_by(name="Bhopal",level="DISTRICT").first() or Jurisdiction(name="Bhopal",level="DISTRICT",parent_id=state.id); db.add(district); db.flush()
users=[("national.admin","NATIONAL_ADMIN","DEMO_PASSWORD_NATIONAL",None,None),("mp.state","STATE_ADMIN","DEMO_PASSWORD_STATE",state.id,None),("bhopal.district","DISTRICT_OFFICER","DEMO_PASSWORD_DISTRICT",state.id,district.id),("project.officer","PROJECT_OFFICER","DEMO_PASSWORD_PROJECT",state.id,district.id),("data.operator","PROJECT_DATA_OPERATOR","DEMO_PASSWORD_DATA",state.id,district.id)]
roles={r.name:r for r in db.query(Role).all()}
for username, role, envkey, state_id, district_id in users:
    password = os.environ.get(envkey, "ChangeMe-123!")
    u = db.query(User).filter_by(username=username).first()

    if not u:
        u = User(
            username=username,
            password_hash=hash_password(password),
            role_id=roles[role].id,
            organization_id=org.id,
            state_id=state_id,
            district_id=district_id
        )
        db.add(u)
    else:
        u.password_hash = hash_password(password)
        u.role_id = roles[role].id
        u.organization_id = org.id
        u.state_id = state_id
        u.district_id = district_id

db.commit()
db.close()