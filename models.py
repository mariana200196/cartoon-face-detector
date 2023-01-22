from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, LargeBinary
from sqlalchemy.orm import relationship

from database import Base


class Portait(Base):
    __tablename__ = "portraits"

    id = Column(Integer, primary_key=True, index=True)
    film = Column(String, unique=True, index=True)
    gender = Column(String)
    image = Column(Boolean, default=True)
