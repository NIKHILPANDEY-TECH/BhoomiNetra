import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped,mapped_column
from app.database.base import Base
class Organization(Base):
    __tablename__="organizations"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,default=uuid.uuid4)
    name:Mapped[str]=mapped_column(String(200),unique=True)
