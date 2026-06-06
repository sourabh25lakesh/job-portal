from pydantic import BaseModel
from typing import Optional


class RecruiterCreate(BaseModel):
    company_name: str
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_description: Optional[str] = None


class RecruiterUpdate(BaseModel):
    company_name: Optional[str] = None
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_description: Optional[str] = None


class RecruiterResponse(BaseModel):
    id: int
    user_id: int
    company_name: str
    company_website: Optional[str] = None
    company_location: Optional[str] = None
    company_description: Optional[str] = None

    class Config:
        from_attributes = True