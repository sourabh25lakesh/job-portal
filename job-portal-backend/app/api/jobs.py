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
        user_id=current_user.id
    )

    db.add(new_job)
    db.commit()
    db.refresh(new_job)

    return new_job


# ================= MY JOBS WITH APPLICATIONS =================
# IMPORTANT: Keep before "/{job_id}"
@router.get("/my-jobs")
def get_my_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["company", "recruiter", "admin"])
    )
):
    query = db.query(Job)

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
                "status": application.status,
                "resume_viewed": application.resume_viewed,
                "created_at": application.created_at,
                "updated_at": application.updated_at,
                "candidate": {
                    "id": application.user.id,
                    "name": application.user.name,
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
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "location": job.location,
            "salary": job.salary,
            "description": job.description,
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
    query = db.query(Job)

    if search:
        search_value = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Job.title.ilike(search_value),
                Job.company_name.ilike(search_value),
                Job.location.ilike(search_value),
                Job.description.ilike(search_value)
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

    return (
        query
        .order_by(Job.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ================= GET SINGLE JOB =================
@router.get("/{job_id}", response_model=JobResponse)
def get_single_job(
    job_id: int,
    db: Session = Depends(get_db)
):
    job = db.query(Job).filter(Job.id == job_id).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    return job


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
    job = db.query(Job).filter(Job.id == job_id).first()

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

    db.commit()
    db.refresh(job)

    return job


# ================= DELETE JOB =================
@router.delete("/{job_id}")
def delete_job(
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
            detail="Job not found"
        )

    if job.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    db.delete(job)
    db.commit()

    return {
        "message": "Job deleted successfully"
    }