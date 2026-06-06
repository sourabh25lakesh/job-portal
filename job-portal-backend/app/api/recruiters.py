from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_

from app.database.db import get_db

from app.models.recruiter import RecruiterProfile
from app.models.job import Job
from app.models.application import Application
from app.models.candidate_profile import CandidateProfile

from app.schemas.recruiter import (
    RecruiterCreate,
    RecruiterUpdate,
    RecruiterResponse
)

from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/recruiters",
    tags=["Recruiters"]
)


# ================= CREATE OR UPDATE RECRUITER PROFILE =================
@router.post("/profile", response_model=RecruiterResponse)
def create_recruiter_profile(
    data: RecruiterCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiter can create profile"
        )

    existing_profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id
    ).first()

    if existing_profile:
        existing_profile.company_name = data.company_name
        existing_profile.company_website = data.company_website
        existing_profile.company_location = data.company_location
        existing_profile.company_description = data.company_description

        db.commit()
        db.refresh(existing_profile)

        return existing_profile

    profile = RecruiterProfile(
        user_id=current_user.id,
        company_name=data.company_name,
        company_website=data.company_website,
        company_location=data.company_location,
        company_description=data.company_description
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


# ================= GET MY RECRUITER PROFILE =================
@router.get("/profile", response_model=RecruiterResponse)
def get_my_recruiter_profile(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiter can access profile"
        )

    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    return profile


# ================= UPDATE RECRUITER PROFILE =================
@router.put("/profile", response_model=RecruiterResponse)
def update_recruiter_profile(
    data: RecruiterUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiter can update profile"
        )

    profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Recruiter profile not found"
        )

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(profile, key, value)

    db.commit()
    db.refresh(profile)

    return profile


# ================= RECRUITER DASHBOARD =================
@router.get("/dashboard")
def recruiter_dashboard(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiter can access dashboard"
        )

    jobs_query = db.query(Job).options(
        joinedload(Job.applications)
    )

    if current_user.role != "admin":
        recruiter_profile = db.query(RecruiterProfile).filter(
            RecruiterProfile.user_id == current_user.id
        ).first()

        if recruiter_profile and recruiter_profile.company_name:
            jobs_query = jobs_query.filter(
                or_(
                    Job.user_id == current_user.id,
                    Job.company_name == recruiter_profile.company_name
                )
            )
        else:
            jobs_query = jobs_query.filter(
                Job.user_id == current_user.id
            )

    jobs = jobs_query.order_by(
        Job.id.desc()
    ).all()

    result = []

    total_applications = 0
    pending_applications = 0
    shortlisted_applications = 0
    rejected_applications = 0

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
            status = application.status or "Pending"

            total_applications += 1

            if status == "Pending":
                pending_applications += 1
            elif status == "Shortlisted":
                shortlisted_applications += 1
            elif status == "Rejected":
                rejected_applications += 1

            profile = db.query(CandidateProfile).filter(
                CandidateProfile.user_id == application.user_id
            ).first()

            application_list.append({
                "id": application.id,
                "user_id": application.user_id,
                "job_id": application.job_id,
                "status": status,
                "resume_viewed": application.resume_viewed or False,
                "created_at": application.created_at,
                "updated_at": application.updated_at,

                "candidate": {
                    "id": application.user.id if application.user else None,
                    "name": application.user.name if application.user else "Candidate",
                    "email": application.user.email if application.user else None,
                    "role": application.user.role if application.user else "candidate",
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
            "applications_count": len(application_list),
            "applications": application_list,
        })

    return {
        "total_jobs": len(jobs),
        "total_applications": total_applications,
        "pending_applications": pending_applications,
        "shortlisted_applications": shortlisted_applications,
        "rejected_applications": rejected_applications,
        "jobs": result
    }