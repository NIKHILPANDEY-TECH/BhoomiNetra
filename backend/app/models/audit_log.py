import uuid
from datetime import datetime
from sqlalchemy import ForeignKey,String,DateTime,JSON
from sqlalchemy.orm import Mapped,mapped_column
from app.database.base import Base
class AuditLog(Base):
    __tablename__="audit_logs"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4); user_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("users.id"),nullable=True,index=True); action:Mapped[str]=mapped_column(String(60),index=True); resource_type:Mapped[str]=mapped_column(String(60)); resource_id:Mapped[str|None]=mapped_column(String(100),nullable=True); timestamp:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow,index=True); request_id:Mapped[str|None]=mapped_column(String(100),nullable=True); metadata_json:Mapped[dict]=mapped_column(JSON,default=dict)
