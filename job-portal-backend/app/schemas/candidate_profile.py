from pydantic import BaseModel


class CandidateProfileCreate(BaseModel):

    bio: str

    skills: str

    experience: str

    education: str


class CandidateProfileResponse(BaseModel):

    id: int

    user_id: int

    bio: str

    skills: str

    experience: str

    education: str

    resume_path: str | None

    class Config:

        from_attributes = True