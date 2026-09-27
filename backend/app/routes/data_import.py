from fastapi import APIRouter,Depends,UploadFile,File,HTTPException
from app.core.dependencies import require_permission
router=APIRouter(prefix="/api/data",tags=["Data Administration"])
@router.post("/import")
async def import_data(file:UploadFile=File(...),user=Depends(require_permission("DATA_IMPORT"))):
    if not file.filename.lower().endswith((".csv",".xlsx",".xls")): raise HTTPException(400,"Only CSV and Excel files are supported")
    content=await file.read()
    if len(content)>20*1024*1024: raise HTTPException(413,"File too large")
    return {"data":{"status":"validated_upload","filename":file.filename,"bytes":len(content),"next_step":"approval_required"},"message":"File accepted for validation"}
