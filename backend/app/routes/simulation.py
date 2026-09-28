from fastapi import APIRouter, Depends, Request, HTTPException

from app.core.dependencies import require_permission
from app.database.database import get_db
from app.routes.predictions import features
from app.routes.projects import get_project
from app.services.audit_service import audit
from app.services.ml_service import MLServiceUnavailable
from app.services.simulation_service import simulate

router = APIRouter(prefix="/api/projects", tags=["Simulation"])
ALLOWED_CHANGES = {
    "pending_approvals",
    "legal_disputes",
    "compensation_progress",
    "rr_progress",
    "days_current_stage",
    "observed_elapsed_days",
    "stage_overrun_ratio",
}


@router.post("/{project_id}/simulate")
def simulation(project_id: str, body: dict, request: Request, user=Depends(require_permission("SIMULATION_RUN")), db=Depends(get_db)):
    project = get_project(db, project_id, user)
    changes = {k: v for k, v in body.get("changes", {}).items() if k in ALLOWED_CHANGES}
    try:
        result = simulate(features(project), changes)
    except (TypeError, ValueError) as exc:
        raise HTTPException(400, f"Invalid simulation values: {exc}") from exc
    except MLServiceUnavailable as exc:
        raise HTTPException(503, str(exc)) from exc
    audit(db, user, "SIMULATION_RUN", "PROJECT", project.id, request.state.request_id, {"changes": changes})
    db.commit()
    return {"data": result, "message": "Success"}
