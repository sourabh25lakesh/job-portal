from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class InterviewStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class InterviewModerationRequest(BaseModel):
    rejection_reason: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("rejection_reason", mode="before")
    @classmethod
    def strip_reason(cls, value):
        if value is None:
            return value

        return str(value).strip()


class InterviewRequestResponse(BaseModel):
    id: int
    application_id: int
    job_id: int
    recruiter_id: int
    candidate_id: int
    status: InterviewStatus
    rejection_reason: Optional[str] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
