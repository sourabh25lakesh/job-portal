import json

from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Query
)

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from typing import Optional

from app.database.db import get_db

from app.models.job import Job
from app.models.user import User
from app.models.application import Application
from app.models.candidate_profile import CandidateProfile

from app.schemas.job import (
    JobCreate,
    JobUpdate,
    JobResponse
)

from app.utils.role_checker import require_role


router = APIRouter(
    prefix="/jobs",
    tags=["Jobs"]
)


def normalize_text(value):
    if not value:
        return ""

    if hasattr(value, "value"):
        value = value.value

    return str(value).strip().lower()


def normalize_status(status):
    value = normalize_text(status)

    if value in ["shortlisted", "shortlist"]:
        return "shortlisted"

    if value in ["rejected", "reject"]:
        return "rejected"

    return "pending"


def status_label(status):
    clean_status = normalize_status(status)

    if clean_status == "shortlisted":
        return "Shortlisted"

    if clean_status == "rejected":
        return "Rejected"

    return "Pending"


def normalize_job_status(status):
    value = normalize_text(status)

    if value in ["approved", "approve"]:
        return "approved"

    if value in ["rejected", "reject"]:
        return "rejected"

    return "pending"


def normalize_skills(skills):
    if not skills:
        return []

    if isinstance(skills, str):
        try:
            parsed = json.loads(skills)
            items = parsed if isinstance(parsed, list) else skills.split(",")
        except json.JSONDecodeError:
            items = skills.split(",")
    else:
        items = skills

    cleaned = []
    seen = set()

    for item in items:
        skill = str(item or "").strip()
        key = skill.lower()

        if skill and key not in seen:
            cleaned.append(skill[:80])
            seen.add(key)

    return cleaned


def dump_skills(skills):
    return json.dumps(normalize_skills(skills))


def serialize_job(job):
    return {
        "id": job.id,
        "title": job.title,
        "company_name": job.company_name,
        "location": job.location,
        "salary": job.salary,
        "description": job.description,
        "skills": normalize_skills(job.skills),
        "status": normalize_job_status(job.status),
        "rejection_reason": job.rejection_reason,
        "is_deleted": bool(getattr(job, "is_deleted", False)),
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "user_id": job.user_id,
    }


def display_user_name(user):
    if not user:
        return "Candidate"

    name = str(user.name or "").strip()

    if name and name.lower() not in ["undefined", "null", "none"]:
        return name

    if user.email:
        return user.email.split("@")[0]

    return "Candidate"


# ================= CREATE JOB =================
@router.post("/", response_model=JobResponse)
def create_job(
    job: JobCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    new_job = Job(
        title=job.title,
        company_name=job.company_name,
        location=job.location,
        salary=job.salary,
        description=job.description,
        skills=dump_skills(job.skills),
        # Admin-created jobs are reviewed through the same explicit workflow.
        status="pending",
        rejection_reason=None,
        user_id=current_user.id
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return serialize_job(new_job)


# ================= MY JOBS WITH APPLICATIONS =================
# IMPORTANT: Keep before "/{job_id}"
@router.get("/my-jobs")
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    query = db.query(Job).filter(Job.is_deleted == False)

    if current_user.role != "admin":
        query = query.filter(Job.user_id == current_user.id)

    jobs = query.order_by(Job.id.desc()).all()

    result = []

    for job in jobs:
        applications = db.query(Application).options(
            joinedload(Application.user),
            joinedload(Application.job)
        ).filter(
            Application.job_id == job.id
        ).order_by(
            Application.id.desc()
        ).all()

        application_list = []

        for application in applications:
            profile = db.query(CandidateProfile).filter(
                CandidateProfile.user_id == application.user_id
            ).first()

            application_list.append({
                "id": application.id,
                "user_id": application.user_id,
                "job_id": application.job_id,
                "status": normalize_status(application.status),
                "status_label": status_label(application.status),
                "resume_viewed": application.resume_viewed,
                "created_at": application.created_at,
                "updated_at": application.updated_at,
                "candidate": {
                    "id": application.user.id,
                    "name": display_user_name(application.user),
                    "email": application.user.email,
                    "role": application.user.role,
                },
                "profile": {
                    "bio": profile.bio if profile else None,
                    "skills": profile.skills if profile else None,
                    "experience": profile.experience if profile else None,
                    "education": profile.education if profile else None,
                    "resume_path": profile.resume_path if profile else None,
                }
            })

        result.append({
            **serialize_job(job),
            "user_id": job.user_id,
            "applications_count": len(application_list),
            "applications": application_list,
        })

    return result


# ================= GET ALL JOBS =================
@router.get("/", response_model=list[JobResponse])
def get_jobs(
    search: Optional[str] = Query(default=None),
    title: Optional[str] = Query(default=None),
    location: Optional[str] = Query(default=None),
    company_name: Optional[str] = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=10, ge=1, le=100),
    db: Session = Depends(get_db)
):
    query = db.query(Job).filter(
        Job.status == "approved",
        Job.is_deleted == False
    )

    if search:
        search_value = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_value),
                Job.company_name.ilike(search_value),
                Job.location.ilike(search_value),
                Job.description.ilike(search_value),
                Job.skills.ilike(search_value)
            )
        )

    if title:
        query = query.filter(Job.title.ilike(f"%{title.strip()}%"))

    if location:
        query = query.filter(Job.location.ilike(f"%{location.strip()}%"))

    if company_name:
        query = query.filter(
            Job.company_name.ilike(f"%{company_name.strip()}%")
        )

    jobs = (
        query
        .order_by(Job.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

    return [
        serialize_job(job)
        for job in jobs
    ]


# ================= GET SINGLE JOB =================
@router.get("/{job_id}", response_model=JobResponse)
def get_single_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.status == "approved",
        Job.is_deleted == False
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return serialize_job(job)


# ================= UPDATE JOB =================
@router.put("/{job_id}", response_model=JobResponse)
def update_job(
    job_id: int,
    updated_job: JobUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.is_deleted == False
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    job.title = updated_job.title
    job.company_name = updated_job.company_name
    job.location = updated_job.location
    job.salary = updated_job.salary
    job.description = updated_job.description
    job.skills = dump_skills(updated_job.skills)

    if current_user.role == "admin":
        if updated_job.status:
            job.status = normalize_job_status(updated_job.status)

            if job.status == "rejected":
                job.rejection_reason = (
                    updated_job.rejection_reason or
                    job.rejection_reason or
                    "Rejected by admin"
                )
            else:
                job.rejection_reason = None
    else:
        # Recruiters can directly edit their own jobs without sending the job
        # back to admin approval. The existing moderation status is preserved.
        job.status = normalize_job_status(job.status)

    db.commit()
    db.refresh(job)

    return serialize_job(job)


@router.get("/my-jobs/deleted")
def get_my_deleted_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    query = db.query(Job).filter(Job.is_deleted == True)

    if current_user.role != "admin":
        query = query.filter(Job.user_id == current_user.id)

    jobs = query.order_by(Job.updated_at.desc(), Job.id.desc()).all()

    return [
        serialize_job(job)
        for job in jobs
    ]


@router.patch("/{job_id}/restore", response_model=JobResponse)
def restore_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Deleted job not found"
        )

    if job.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only restore jobs created by you"
        )

    if not job.is_deleted:
        return serialize_job(job)

    job.is_deleted = False
    db.commit()
    db.refresh(job)

    return serialize_job(job)


# ================= DELETE JOB =================
@router.delete("/{job_id}")
def delete_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    job = db.query(Job).filter(
        Job.id == job_id,
        Job.is_deleted == False
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="You can only delete jobs created by you"
        )

    job.is_deleted = True
    db.commit()
    db.refresh(job)

    return {
        "message": "Job moved to deleted jobs successfully",
        "job": serialize_job(job)
    }
