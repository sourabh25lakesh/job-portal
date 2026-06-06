from sqlalchemy import Column, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.db import Base


class RecruiterProfile(Base):
    __tablename__ = "recruiter_profiles"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        unique=True,
        nullable=False
    )

    company_name = Column(String(200), nullable=False)

    company_website = Column(String(255), nullable=True)

    company_location = Column(String(200), nullable=True)

    company_description = Column(Text, nullable=True)

    user = relationship(
        "User",
        back_populates="recruiter_profile"
    )