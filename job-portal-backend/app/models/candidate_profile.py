from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.database.db import Base


class CandidateProfile(Base):
    __tablename__ = "candidate_profiles"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    bio = Column(
        String(500),
        nullable=True
    )

    skills = Column(
        String(500),
        nullable=True
    )

    experience = Column(
        String(500),
        nullable=True
    )

    education = Column(
        String(500),
        nullable=True
    )

    resume_path = Column(
        String(255),
        nullable=True
    )

    user = relationship(
        "User",
        back_populates="candidate_profile"
    )