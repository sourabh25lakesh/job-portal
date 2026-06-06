from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime
)

from app.database.db import Base


class ContactMessage(Base):

    __tablename__ = "contact_messages"

    # ================= PRIMARY KEY =================
    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    # ================= USER NAME =================
    name = Column(
        String(100),
        nullable=False
    )

    # ================= USER EMAIL =================
    email = Column(
        String(150),
        nullable=False,
        index=True
    )

    # ================= SUBJECT =================
    subject = Column(
        String(200),
        nullable=False
    )

    # ================= MESSAGE =================
    message = Column(
        Text,
        nullable=False
    )

    # ================= CREATED DATE =================
    created_at = Column(
        DateTime,
        default=datetime.utcnow,
        nullable=False
    )

    # ================= STRING REPRESENTATION =================
    def __repr__(self):

        return (
            f"<ContactMessage id={self.id} "
            f"name='{self.name}' "
            f"email='{self.email}'>"
        )