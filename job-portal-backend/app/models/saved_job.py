from sqlalchemy import (
    Column,
    Integer,
    ForeignKey
)

from sqlalchemy.orm import relationship

from app.database.db import Base


class SavedJob(Base):

    __tablename__ = "saved_jobs"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id")
    )

    job_id = Column(
        Integer,
        ForeignKey("jobs.id")
    )

    user = relationship("User")

    job = relationship("Job")