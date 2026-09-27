from fastapi import APIRouter,Depends
from app.database.database import get_db
from app.routes.projects import get_project
from app.core.dependencies import require_permission
from app.routes.predictions import features
from app.services.shap_service import shap_service
router=APIRouter(prefix="/api/projects",tags=["Explainability"])
@router.get("/{project_id}/explanation")
def explanation(project_id:str,user=Depends(require_permission("SHAP_VIEW")),db=Depends(get_db)):
    p=get_project(db,project_id,user); return {"data":{"factors":shap_service.explain(features(p)),"note":"Factors contributing to the model prediction; SHAP contribution is not causal evidence."},"message":"Success"}
@router.get("/{project_id}/bottleneck")
def bottleneck(project_id:str,user=Depends(require_permission("PREDICTION_VIEW")),db=Depends(get_db)):
    from app.services.bottleneck_service import analyze
    p=get_project(db,project_id,user); return {"data":analyze(p),"message":"Success"}
@router.get("/{project_id}/propagation")
def propagation(project_id:str,user=Depends(require_permission("PREDICTION_VIEW")),db=Depends(get_db)):
    from app.services.propagation_service import estimate
    p=get_project(db,project_id,user); return {"data":{"estimates":estimate(p),"note":"Dependency-based model estimates, not proven causal effects."},"message":"Success"}
