from fastapi import Depends,HTTPException,status,Request
from fastapi.security import HTTPBearer,HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.core.security import decode_token
from app.models.user import User
security=HTTPBearer(auto_error=False)
def get_current_user(request:Request, creds:HTTPAuthorizationCredentials=Depends(security), db:Session=Depends(get_db)):
    if not creds: raise HTTPException(401,"Authentication required")
    try:
        p=decode_token(creds.credentials)
        if p.get("type")!="access": raise ValueError
        user=db.get(User,p["sub"])
    except Exception: user=None
    if not user or not user.is_active: raise HTTPException(401,"Invalid or inactive session")
    return user
def require_permission(permission):
    def dep(user=Depends(get_current_user)):
        if not any(p.name==permission for p in user.role.permissions): raise HTTPException(403,"Permission denied")
        return user
    return dep
def project_scope(project,user):
    role=user.role.name
    if role=="NATIONAL_ADMIN": return True
    if role in ("STATE_ADMIN","STATE_ANALYST"): return project.state_id==user.state_id
    if role in ("DIVISION_OFFICER",): return project.division_id==user.division_id
    if role in ("DISTRICT_OFFICER","DISTRICT_ANALYST"): return project.district_id==user.district_id
    if role=="PROJECT_OFFICER": return project.assigned_user_id==user.id
    return project.organization_id==user.organization_id
