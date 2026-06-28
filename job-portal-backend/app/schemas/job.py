from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class JobStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class JobBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=200)
    company_name: str = Field(..., min_length=2, max_length=200)
    location: str = Field(..., min_length=2, max_length=100)
    salary: Optional[str] = Field(default=None, max_length=100)
    description: str = Field(..., min_length=10)
    skills: list[str] = Field(default_factory=list, max_length=30)

    @field_validator(
        "title",
        "company_name",
        "location",
        "salary",
        "description",
        mode="before"
    )
    @classmethod
    def strip_text(cls, value):
        if value is None:
            return value

        return str(value).strip()

    @field_validator("skills", mode="before")
    @classmethod
    def normalize_skills(cls, value):
        if value is None:
            return []

        if isinstance(value, str):
            items = value.split(",")
        else:
            items = value

        cleaned = []
        seen = set()

        for item in items:
            skill = str(item or "").strip()
            key = skill.lower()

            if skill and key not in seen:
                cleaned.append(skill[:80])
                seen.add(key)

        return cleaned


class JobCreate(JobBase):
    pass


class JobUpdate(JobBase):
    status: Optional[JobStatus] = None
    rejection_reason: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("rejection_reason", mode="before")
    @classmethod
    def strip_rejection_reason(cls, value):
        if value is None:
            return value

        return str(value).strip()


class JobModerationRequest(BaseModel):
    rejection_reason: Optional[str] = Field(default=None, max_length=1000)

    @field_validator("rejection_reason", mode="before")
    @classmethod
    def strip_reason(cls, value):
        if value is None:
            return value

        return str(value).strip()


class JobResponse(JobBase):
    id: int
    user_id: int
    status: JobStatus = JobStatus.pending
    rejection_reason: Optional[str] = None
    is_deleted: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
