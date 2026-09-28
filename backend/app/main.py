from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.database.database import init_db
from app.services.ml_service import MLServiceUnavailable, ml_service
from app.routes import auth, users, projects, predictions, explanations, simulation, recommendations, dashboard, gis, alerts, interventions, data_import, admin, audit, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # IMPORTANT: never make backend startup depend on the ML service.
    # Render can cold-start ML independently; the API must remain healthy.
    if settings.ENVIRONMENT != "test":
        init_db()
    yield


app = FastAPI(title="BhoomiMitra API", version="1.0.0", docs_url="/docs", redoc_url="/redoc", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
)


@app.middleware("http")
async def request_context(request: Request, call_next):
    import time
    import uuid

    rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
    request.state.request_id = rid
    started = time.perf_counter()
    response = await call_next(request)
    response.headers["X-Request-ID"] = rid
    response.headers["X-Process-Time"] = f"{time.perf_counter() - started:.6f}"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


@app.exception_handler(Exception)
async def unhandled(request: Request, exc: Exception):
    import logging

    logging.getLogger(__name__).exception("Unhandled request error", exc_info=exc)
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": "INTERNAL_ERROR",
                "message": "An internal error occurred",
                "request_id": getattr(request.state, "request_id", None),
            }
        },
    )


for router in [auth.router, users.router, projects.router, predictions.router, explanations.router, simulation.router, recommendations.router, dashboard.router, gis.router, alerts.router, interventions.router, data_import.router, admin.router, audit.router, reports.router]:
    app.include_router(router)


@app.get("/health", tags=["Administration"])
def health():
    """Cheap liveness endpoint for Render. It must not depend on ML or the database."""
    return {"data": {"status": "ok", "ml": "deferred"}, "message": "Success"}


@app.get("/ready", tags=["Administration"])
def ready():
    """Explicit readiness/warm-up check. Unlike /health, this can wake/load ML."""
    try:
        ml = ml_service.check_ready()
        return {"data": {"status": "ready", "ml": ml}, "message": "Success"}
    except MLServiceUnavailable as exc:
        return JSONResponse(
            status_code=503,
            content={"data": {"status": "starting", "ml": "unavailable"}, "message": str(exc)},
        )
