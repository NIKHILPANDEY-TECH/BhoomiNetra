from datetime import timedelta
from fastapi import APIRouter,Depends,HTTPException,Request
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.database import get_db
from app.models.user import User
from app.models.jurisdiction import Jurisdiction
from app.schemas.auth import *
from app.core.security import verify_password,create_access_token,create_refresh_token,decode_token
from app.core.config import settings
from app.core.dependencies import get_current_user
from app.services.audit_service import audit
router=APIRouter(prefix="/api/auth",tags=["Authentication"])
@router.post("/login",response_model=TokenResponse)
def login(body:LoginRequest,request:Request,db:Session=Depends(get_db)):
    # Keep compatibility with the original email-based login form while
    # allowing the API's canonical username field.
    u = db.query(User).filter(
        or_(
            User.username == body.username,
            User.email == body.username,
        )
    ).first()
    if not u or not u.is_active or not verify_password(body.password,u.password_hash): raise HTTPException(401,"Invalid credentials")
    audit(db,u,"LOGIN","USER",u.id,request.state.request_id); db.commit(); return TokenResponse(access_token=create_access_token(str(u.id)),refresh_token=create_refresh_token(str(u.id)))
@router.post("/demo-login",response_model=TokenResponse)
def demo(body:DemoLoginRequest,request:Request,db:Session=Depends(get_db)):
    if settings.ENVIRONMENT=="production" and not settings.DEMO_MODE: raise HTTPException(403,"Demo login disabled")
    mapping={"national_admin":"national.admin","state_officer":"mp.state","district_officer":"bhopal.district","project_officer":"project.officer","data_operator":"data.operator","local_citizen":"citizen.demo"}
    u=db.query(User).filter(User.username==mapping.get(body.role,"")).first()
    if not u or not u.is_active: raise HTTPException(403,"Demo account unavailable")
    audit(db,u,"LOGIN","USER",u.id,request.state.request_id,{"mode":"demo"}); db.commit(); return TokenResponse(access_token=create_access_token(str(u.id)),refresh_token=create_refresh_token(str(u.id)))
@router.post("/refresh",response_model=TokenResponse)
def refresh(body:RefreshRequest,db:Session=Depends(get_db)):
    try: p=decode_token(body.refresh_token); assert p.get("type")=="refresh"; u=db.get(User,p["sub"]); assert u and u.is_active
    except Exception: raise HTTPException(401,"Invalid refresh token")
    return TokenResponse(access_token=create_access_token(str(u.id)),refresh_token=create_refresh_token(str(u.id)))
@router.post("/logout")
def logout(request:Request,user=Depends(get_current_user),db:Session=Depends(get_db)):
    audit(db,user,"LOGOUT","USER",user.id,request.state.request_id); db.commit(); return {"data":{},"message":"Success"}
@router.get("/me", response_model=UserMe)
def me(user=Depends(get_current_user), db: Session = Depends(get_db)):
    state = db.get(Jurisdiction, user.state_id) if user.state_id else None
    district = db.get(Jurisdiction, user.district_id) if user.district_id else None
    division = db.get(Jurisdiction, user.division_id) if user.division_id else None
    return UserMe(
        id=str(user.id),
        username=user.username,
        role=user.role.name,
        permissions=[p.name for p in user.role.permissions],
        state=state.name if state else None,
        district=district.name if district else None,
        division=division.name if division else None,
    )
