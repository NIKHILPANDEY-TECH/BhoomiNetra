from fastapi import APIRouter,Depends,Request
from sqlalchemy import select
from app.database.database import get_db
from app.models.intervention import Intervention
from app.routes.projects import get_project
from app.core.dependencies import require_permission
from app.services.audit_service import audit
router=APIRouter(prefix="/api/projects",tags=["Interventions"])
@router.post("/{project_id}/interventions")
def create(project_id:str,body:dict,request:Request,user=Depends(require_permission("INTERVENTION_CREATE")),db=Depends(get_db)):
 p=get_project(db,project_id,user); i=Intervention(project_id=p.id,user_id=user.id,action=body.get("action","")[:500],notes=body.get("notes"),status=body.get("status","OPEN")); db.add(i); db.flush(); audit(db,user,"INTERVENTION_CREATE","INTERVENTION",i.id,request.state.request_id); db.commit(); return {"data":{"id":str(i.id),"status":i.status},"message":"Success"}
@router.get("/{project_id}/interventions")
def list_(project_id:str,user=Depends(require_permission("INTERVENTION_CREATE")),db=Depends(get_db)):
 p=get_project(db,project_id,user); rows=db.execute(select(Intervention).where(Intervention.project_id==p.id).order_by(Intervention.created_at.desc())).scalars().all(); return {"data":[{"id":str(i.id),"action":i.action,"notes":i.notes,"status":i.status,"created_at":i.created_at.isoformat()} for i in rows],"message":"Success"}
