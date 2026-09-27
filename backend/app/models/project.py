import uuid
from datetime import datetime,date
from sqlalchemy import String, Integer, Float, Date, DateTime, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import Mapped,mapped_column,relationship
from geoalchemy2 import Geography
from app.database.base import Base
class Project(Base):
    __tablename__="projects"
    __table_args__=(CheckConstraint("land_area >= 0"),CheckConstraint("affected_families >= 0"),CheckConstraint("pending_approvals >= 0"),CheckConstraint("legal_disputes >= 0"),CheckConstraint("compensation_progress BETWEEN 0 AND 100"),CheckConstraint("rr_progress BETWEEN 0 AND 100"),CheckConstraint("days_current_stage >= 0"),CheckConstraint("historical_stage_avg_days >= 0"),CheckConstraint("historical_delay_rate BETWEEN 0 AND 1"),CheckConstraint("planned_duration_days > 0"),CheckConstraint("observed_elapsed_days >= 0"),Index("ix_projects_location","location",postgresql_using="gist"))
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4)
    public_id:Mapped[str]=mapped_column(String(20),unique=True,index=True)
    project_name:Mapped[str]=mapped_column(String(255))
    state:Mapped[str]=mapped_column(String(100),index=True); district:Mapped[str]=mapped_column(String(100),index=True); project_type:Mapped[str]=mapped_column(String(100),index=True)
    land_area:Mapped[float]=mapped_column(Float); affected_families:Mapped[int]=mapped_column(Integer); pending_approvals:Mapped[int]=mapped_column(Integer); legal_disputes:Mapped[int]=mapped_column(Integer)
    compensation_pending:Mapped[int]=mapped_column(Integer,default=0); compensation_progress:Mapped[float]=mapped_column(Float); rr_progress:Mapped[float]=mapped_column(Float)
    current_stage:Mapped[str]=mapped_column(String(100),index=True); stage_index:Mapped[int]=mapped_column(Integer); days_current_stage:Mapped[int]=mapped_column(Integer); historical_stage_avg_days:Mapped[float]=mapped_column(Float); historical_delay_rate:Mapped[float]=mapped_column(Float); planned_duration_days:Mapped[int]=mapped_column(Integer); observed_elapsed_days:Mapped[int]=mapped_column(Integer); stage_overrun_ratio:Mapped[float]=mapped_column(Float)
    project_start_date:Mapped[date]; planned_completion_date:Mapped[date]
    status:Mapped[str]=mapped_column(String(30),default="DRAFT",index=True); location:Mapped[object]=mapped_column(Geography(geometry_type="POINT",srid=4326),nullable=True)
    assigned_user_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("users.id"),nullable=True,index=True); organization_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("organizations.id"),nullable=True,index=True)
    state_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id"),nullable=True,index=True); division_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id"),nullable=True,index=True); district_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id"),nullable=True,index=True)
    is_archived:Mapped[bool]=mapped_column(default=False,index=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow,onupdate=datetime.utcnow)
