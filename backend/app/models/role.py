import uuid
from sqlalchemy import String, ForeignKey, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.base import Base
role_permissions=Table("role_permissions",Base.metadata,Column("role_id",ForeignKey("roles.id",ondelete="CASCADE"),primary_key=True),Column("permission_id",ForeignKey("permissions.id",ondelete="CASCADE"),primary_key=True))
class Role(Base):
    __tablename__="roles"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4)
    name:Mapped[str]=mapped_column(String(50),unique=True,index=True)
    permissions=relationship("Permission",secondary=role_permissions,lazy="selectin")
