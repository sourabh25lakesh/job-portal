from pydantic import BaseModel


class CompanyCreate(BaseModel):

    company_name: str
    description: str
    website: str
    location: str


class CompanyResponse(CompanyCreate):

    id: int
    user_id: int

    class Config:
        from_attributes = True