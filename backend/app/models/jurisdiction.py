import uuid
from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.database.base import Base
class Jurisdiction(Base):
    __tablename__="jurisdictions"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4)
    name:Mapped[str]=mapped_column(String(150))
    level:Mapped[str]=mapped_column(String(20),index=True)
    parent_id:Mapped[uuid.UUID|None]=mapped_column(ForeignKey("jurisdictions.id",ondelete="SET NULL"),nullable=True)
    parent=relationship("Jurisdiction",remote_side=[id])
