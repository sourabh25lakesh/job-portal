from datetime import datetime

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    ConfigDict
)


# ================= BASE CONTACT SCHEMA =================
class ContactBase(BaseModel):

    name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        example="Sourabh"
    )

    email: EmailStr

    subject: str = Field(
        ...,
        min_length=3,
        max_length=200,
        example="Job Related Query"
    )

    message: str = Field(
        ...,
        min_length=10,
        example="I want to know more about job applications."
    )


# ================= CREATE CONTACT =================
class ContactCreate(ContactBase):
    pass


# ================= CONTACT RESPONSE =================
class ContactResponse(ContactBase):

    id: int

    created_at: datetime

    model_config = ConfigDict(
        from_attributes=True
    )