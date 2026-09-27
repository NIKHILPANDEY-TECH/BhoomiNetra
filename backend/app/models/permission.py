import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped,mapped_column,relationship
from app.database.base import Base
class Permission(Base):
    __tablename__="permissions"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4)
    name:Mapped[str]=mapped_column(String(80),unique=True,index=True)
