from fastapi import APIRouter,Depends,HTTPException
from sqlalchemy import select
from app.database.database import get_db
from app.models.user import User
from app.models.role import Role
from app.schemas.user import *
from app.core.dependencies import require_permission
from app.core.security import hash_password
router=APIRouter(prefix="/api/users",tags=["Users"])
@router.get("")
def users(user=Depends(require_permission("USER_VIEW")),db=Depends(get_db)):
 rows=db.execute(select(User)).scalars().all(); return {"data":[{"id":str(x.id),"username":x.username,"email":x.email,"role":x.role.name,"is_active":x.is_active} for x in rows],"message":"Success"}
@router.post("")
def create(body:UserCreate,user=Depends(require_permission("USER_CREATE")),db=Depends(get_db)):
 role=db.execute(select(Role).where(Role.name==body.role)).scalar_one_or_none()
 if not role: raise HTTPException(400,"Role not found")
 u=User(username=body.username,email=body.email,password_hash=hash_password(body.password),role_id=role.id,organization_id=body.organization_id,state_id=body.state_id,division_id=body.division_id,district_id=body.district_id); db.add(u); db.commit(); return {"data":{"id":str(u.id)},"message":"Success"}
