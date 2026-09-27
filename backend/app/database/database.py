from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
engine=create_engine(settings.DATABASE_URL, pool_pre_ping=True, pool_size=10, max_overflow=20)
SessionLocal=sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)
def get_db():
    db=SessionLocal()
    try: yield db
    finally: db.close()
def init_db():
    from app.database.base import Base
    import app.models.user, app.models.role, app.models.permission, app.models.organization, app.models.jurisdiction, app.models.project, app.models.prediction, app.models.risk_history, app.models.recommendation, app.models.intervention, app.models.alert, app.models.audit_log
    Base.metadata.create_all(bind=engine)
