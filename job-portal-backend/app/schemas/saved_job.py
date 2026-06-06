from pydantic import BaseModel


class SavedJobCreate(BaseModel):

    job_id: int


class SavedJobResponse(BaseModel):

    id: int
    user_id: int
    job_id: int

    class Config:
        from_attributes = True