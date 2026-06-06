from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.db import Base


class Company(Base):

    __tablename__ = "companies"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True
    )

    company_name = Column(
        String(200),
        nullable=False
    )

    description = Column(
        String(500)
    )

    website = Column(
        String(255)
    )

    location = Column(
        String(100)
    )

    user = relationship("User")