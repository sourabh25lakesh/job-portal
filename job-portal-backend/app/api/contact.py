from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.contact import ContactMessage

from app.schemas.contact import (
    ContactCreate,
    ContactResponse
)

router = APIRouter(
    prefix="/contact",
    tags=["Contact"]
)


# ================= CREATE CONTACT MESSAGE =================
@router.post(
    "/",
    response_model=ContactResponse
)
def create_contact_message(
    contact_data: ContactCreate,
    db: Session = Depends(get_db)
):

    new_message = ContactMessage(
        name=contact_data.name,
        email=contact_data.email,
        subject=contact_data.subject,
        message=contact_data.message
    )

    db.add(new_message)

    db.commit()

    db.refresh(new_message)

    return new_message


# ================= GET ALL CONTACT MESSAGES =================
@router.get(
    "/",
    response_model=list[ContactResponse]
)
def get_contact_messages(
    db: Session = Depends(get_db)
):

    messages = db.query(
        ContactMessage
    ).order_by(
        ContactMessage.id.desc()
    ).all()

    return messages


# ================= GET SINGLE CONTACT MESSAGE =================
@router.get(
    "/{message_id}",
    response_model=ContactResponse
)
def get_contact_message_by_id(
    message_id: int,
    db: Session = Depends(get_db)
):

    message = db.query(
        ContactMessage
    ).filter(
        ContactMessage.id == message_id
    ).first()

    if not message:

        raise HTTPException(
            status_code=404,
            detail="Contact message not found"
        )

    return message