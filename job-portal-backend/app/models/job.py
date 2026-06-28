from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String, Text, ForeignKey
from sqlalchemy.orm import relationship

from app.database.db import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    title = Column(
        String(200),
        nullable=False,
        index=True
    )

    company_name = Column(
        String(200),
        nullable=False,
        index=True
    )

    location = Column(
        String(100),
        nullable=False,
        index=True
    )

    salary = Column(
        String(100),
        nullable=True
    )

    description = Column(
        Text,
        nullable=False
    )

    skills = Column(
        Text,
        nullable=True
    )

    # Jobs remain hidden from candidates until an admin approves them.
    status = Column(
        String(50),
        nullable=False,
        default="pending",
        index=True
    )

    rejection_reason = Column(
        Text,
        nullable=True
    )

    is_deleted = Column(
        Boolean,
        default=False,
        nullable=False,
        index=True
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True
    )

    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )

    user = relationship(
        "User",
        back_populates="jobs"
    )

    applications = relationship(
        "Application",
        back_populates="job",
        cascade="all, delete-orphan"
    )
