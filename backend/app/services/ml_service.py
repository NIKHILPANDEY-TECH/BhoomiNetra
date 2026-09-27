import httpx

from app.core.config import settings


class MLService:
    def __init__(self):
        self.metadata = None

    def _url(self, path):
        return f"{settings.ML_SERVICE_URL.rstrip('/')}{path}"

    def load(self):
        response = httpx.get(self._url("/health"), timeout=settings.ML_SERVICE_TIMEOUT)
        response.raise_for_status()
        self.metadata = response.json()

    def build_features(self, project):
        affected = max(int(project.affected_families or 0), 1)
        planned = max(int(project.planned_duration_days or 1), 1)
        elapsed = max(int(project.observed_elapsed_days or 0), 0)
        stage_avg = max(float(project.historical_stage_avg_days or 1), 1)
        compensation = max(float(project.compensation_progress or 0), 0)
        rr_progress = max(float(project.rr_progress or 0), 0)
        pending = max(int(project.pending_approvals or 0), 0)
        disputes = max(int(project.legal_disputes or 0), 0)
        rr_completed = int(round(affected * rr_progress / 100.0))
        return {
            "state": project.state,
            "district": project.district,
            "project_type": project.project_type,
            "current_stage": project.current_stage,
            "land_area": float(project.land_area or 0),
            "affected_families": affected,
            "pending_approvals": pending,
            "legal_disputes": disputes,
            "ownership_conflicts": min(disputes, max(0, int(round(affected * 0.02)))),
            "documentation_completion_pct": max(0.0, min(100.0, 100.0 - pending * 4.0)),
            "approval_completion_pct": max(0.0, min(100.0, 100.0 - pending * 5.0)),
            "compensation_total": float(affected * 100000),
            "compensation_progress": compensation,
            "compensation_delay_days": max(0.0, (100.0 - compensation) * 0.5),
            "rr_total_families": affected,
            "rr_completed_families": rr_completed,
            "rr_pending_families": max(0, affected - rr_completed),
            "rr_progress": rr_progress,
            "days_current_stage": max(int(project.days_current_stage or 0), 0),
            "historical_stage_avg_days": stage_avg,
            "historical_delay_rate": float(project.historical_delay_rate or 0),
            "previous_project_delay_rate": float(project.historical_delay_rate or 0),
            "department_avg_processing_days": stage_avg,
            "planned_duration_days": planned,
            "observed_elapsed_days": elapsed,
            "remaining_planned_days": max(planned - elapsed, 0),
            "elapsed_vs_planned_ratio": elapsed / planned,
            "stage_overrun_ratio": max(float(project.stage_overrun_ratio or 0), 0),
        }

    def predict(self, features):
        response = httpx.post(self._url("/predict"), json={"features": features}, timeout=settings.ML_SERVICE_TIMEOUT)
        response.raise_for_status()
        return response.json()

    def explain(self, features):
        response = httpx.post(self._url("/explain"), json={"features": features}, timeout=settings.ML_SERVICE_TIMEOUT)
        response.raise_for_status()
        return response.json()["factors"]

    def predict_delay(self, features):
        return float(self.predict(features)["risk_probability"])

    def predict_delay_days(self, features):
        return float(self.predict(features)["predicted_delay_days"])

    def get_model_metadata(self):
        if self.metadata is None:
            self.load()
        return self.metadata or {"model_version": "unknown"}


ml_service = MLService()
