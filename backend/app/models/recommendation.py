import uuid
from datetime import datetime
from sqlalchemy import ForeignKey,String,DateTime
from sqlalchemy.orm import Mapped,mapped_column
from app.database.base import Base
class Recommendation(Base):
    __tablename__="recommendations"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4); project_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("projects.id",ondelete="CASCADE"),index=True); recommendation:Mapped[str]=mapped_column(String(500)); priority:Mapped[str]=mapped_column(String(20)); reason:Mapped[str]=mapped_column(String(500)); source:Mapped[str]=mapped_column(String(100)); created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow)
