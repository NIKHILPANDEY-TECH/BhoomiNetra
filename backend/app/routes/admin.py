from fastapi import APIRouter,Depends
from app.core.dependencies import require_permission
from app.services.ml_service import ml_service
router=APIRouter(prefix="/api/admin",tags=["Administration"])
@router.get("/model/info")
def model_info(user=Depends(require_permission("MODEL_VIEW"))): return {"data":ml_service.get_model_metadata(),"message":"Success"}
