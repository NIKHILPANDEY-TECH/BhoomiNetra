import time
from typing import Any

import httpx

from app.core.config import settings


class MLServiceUnavailable(RuntimeError):
    """The ML service is temporarily unavailable or waking from a cold start."""


class MLService:
    def __init__(self):
        self.metadata: dict[str, Any] | None = None

    def _url(self, path: str) -> str:
        return f"{settings.ML_SERVICE_URL.rstrip('/')}{path}"

    def _request(self, method: str, path: str, *, json: dict | None = None) -> httpx.Response:
        """Call ML with bounded retries for Render cold starts/transient 502/503/504s."""
        attempts = max(1, int(settings.ML_SERVICE_RETRIES) + 1)
        last_error: Exception | None = None

        timeout = httpx.Timeout(
            connect=10.0,
            read=float(settings.ML_SERVICE_TIMEOUT),
            write=10.0,
            pool=10.0,
        )

        for attempt in range(attempts):
            try:
                response = httpx.request(
                    method,
                    self._url(path),
                    json=json,
                    timeout=timeout,
                )

                # Render can briefly return a gateway/service-unavailable response while
                # the ML web service is waking up. Retry those transient statuses.
                if response.status_code in (502, 503, 504):
                    last_error = MLServiceUnavailable(
                        f"ML service returned HTTP {response.status_code}"
                    )
                    if attempt < attempts - 1:
                        time.sleep(float(settings.ML_SERVICE_RETRY_DELAY) * (attempt + 1))
                        continue
                    raise last_error

                response.raise_for_status()
                return response

            except MLServiceUnavailable:
                if attempt >= attempts - 1:
                    raise
            except (httpx.ConnectError, httpx.ConnectTimeout, httpx.ReadTimeout,
                    httpx.WriteTimeout, httpx.PoolTimeout, httpx.RemoteProtocolError) as exc:
                last_error = exc
                if attempt < attempts - 1:
                    time.sleep(float(settings.ML_SERVICE_RETRY_DELAY) * (attempt + 1))
                    continue
                raise MLServiceUnavailable(
                    "ML service is temporarily unavailable or waking from a cold start"
                ) from exc
            except httpx.HTTPStatusError as exc:
                # Non-transient ML errors should reach the route as a normal service error.
                raise exc

        raise MLServiceUnavailable("ML service is temporarily unavailable") from last_error

    def load(self) -> dict[str, Any]:
        """Refresh metadata explicitly; never call this during backend startup."""
        response = self._request("GET", "/health")
        self.metadata = response.json()
        return self.metadata

    def check_ready(self) -> dict[str, Any]:
        """Explicit readiness probe. This may wake/load the ML service."""
        response = self._request("GET", "/ready")
        data = response.json()
        self.metadata = data
        return data

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
        response = self._request("POST", "/predict", json={"features": features})
        data = response.json()
        self.metadata = {"model_version": data.get("model_version", "unknown"), "status": "ok"}
        return data

    def explain(self, features):
        response = self._request("POST", "/explain", json={"features": features})
        return response.json()["factors"]

    def get_model_metadata(self):
        # /health is intentionally shallow and does not load the ML model.
        if self.metadata is None:
            try:
                self.load()
            except MLServiceUnavailable:
                return {"model_version": "unavailable"}
        return self.metadata or {"model_version": "unknown"}


ml_service = MLService()
