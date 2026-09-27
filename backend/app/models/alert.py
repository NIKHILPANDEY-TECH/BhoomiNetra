import uuid
from datetime import datetime
from sqlalchemy import ForeignKey,String,DateTime,Boolean
from sqlalchemy.orm import Mapped,mapped_column
from app.database.base import Base
class Alert(Base):
    __tablename__="alerts"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4); project_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("projects.id",ondelete="CASCADE"),index=True); type:Mapped[str]=mapped_column(String(40),index=True); message:Mapped[str]=mapped_column(String(500)); is_read:Mapped[bool]=mapped_column(Boolean,default=False,index=True); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow,index=True)
