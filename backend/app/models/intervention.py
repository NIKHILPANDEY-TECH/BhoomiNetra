import uuid
from datetime import datetime
from sqlalchemy import ForeignKey,String,DateTime
from sqlalchemy.orm import Mapped,mapped_column
from app.database.base import Base
class Intervention(Base):
    __tablename__="interventions"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4); project_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("projects.id",ondelete="CASCADE"),index=True); user_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("users.id")); action:Mapped[str]=mapped_column(String(500)); notes:Mapped[str|None]=mapped_column(String(2000),nullable=True); status:Mapped[str]=mapped_column(String(30),default="OPEN"); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow); updated_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow,onupdate=datetime.utcnow)
