import uuid
from datetime import datetime
from sqlalchemy import String, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.database.base import Base
class User(Base):
    __tablename__="users"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4)
    username:Mapped[str]=mapped_column(String(120),unique=True,index=True)
    email:Mapped[str|None]=mapped_column(String(255),unique=True,index=True)
    password_hash:Mapped[str]=mapped_column(String(255))
    is_active:Mapped[bool]=mapped_column(Boolean,default=True,index=True)
    role_id:Mapped[uuid.UUID]=mapped_column(ForeignKey("roles.id"),index=True)
    organization_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("organizations.id"),nullable=True,index=True)
    state_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id"),nullable=True,index=True)
    division_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id"),nullable=True,index=True)
    district_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id"),nullable=True,index=True)
    created_at:Mapped[datetime]=mapped_column(DateTime(timezone=True),default=datetime.utcnow)
    role=relationship("Role",lazy="joined")
