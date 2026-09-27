import uuid
from datetime import datetime
from sqlalchemy import ForeignKey,Float,String,DateTime
from sqlalchemy.orm import Mapped,mapped_column
from app.database.base import Base
class RiskHistory(Base):
    __tablename__="risk_history"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4); project_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("projects.id",ondelete="CASCADE"),index=True); risk_probability:Mapped[float]=mapped_column(Float); predicted_delay_days:Mapped[float]=mapped_column(Float); model_version:Mapped[str]=mapped_column(String(100)); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow,index=True)
