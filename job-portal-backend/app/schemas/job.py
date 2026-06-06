from pydantic import BaseModel


class JobCreate(BaseModel):
    title: str
    company_name: str
    location: str
    salary: str
    description: str


class JobUpdate(BaseModel):
    title: str
    company_name: str
    location: str
    salary: str
    description: str


class JobResponse(JobCreate):
    id: int
    user_id: int

    class Config:
        from_attributes = True