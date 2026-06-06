from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    Body,
    Query,
)

from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func

from app.database.db import get_db

from app.models.application import Application
from app.models.job import Job
from app.models.user import User
from app.models.candidate_profile import CandidateProfile
from app.models.recruiter import RecruiterProfile

from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/applications",
    tags=["Applications"]
)


# ================= HELPERS =================

def normalize_text(value):
    if not value:
        return ""

    return str(value).strip().lower()


def normalize_status(status):
    value = normalize_text(status)

    if value in ["shortlisted", "shortlist"]:
        return "shortlisted"

    if value in ["rejected", "reject"]:
        return "rejected"

    return "pending"


def can_manage_job(job: Job, current_user: User, db: Session):
    if not job:
        return False

    if current_user.role == "admin":
        return True

    if job.user_id == current_user.id:
        return True

    recruiter_profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id
    ).first()

    recruiter_company = normalize_text(
        recruiter_profile.company_name if recruiter_profile else None
    )

    job_company = normalize_text(job.company_name)

    if recruiter_company and job_company and recruiter_company == job_company:
        return True

    return False


def serialize_application(application: Application, profile: CandidateProfile | None = None):
    candidate = application.user
    job = application.job
    clean_status = normalize_status(application.status)

    return {
        "id": application.id,
        "application_id": application.id,
        "user_id": application.user_id,
        "job_id": application.job_id,
        "status": clean_status,
        "status_label": clean_status.capitalize(),
        "resume_viewed": bool(application.resume_viewed),
        "created_at": application.created_at,
        "updated_at": getattr(application, "updated_at", None),

        "job": {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "location": job.location,
            "salary": job.salary,
            "description": job.description,
            "user_id": job.user_id,
        } if job else None,

        "candidate": {
            "id": candidate.id,
            "name": candidate.name,
            "email": candidate.email,
            "role": candidate.role,
        } if candidate else {
            "id": None,
            "name": "Candidate",
            "email": None,
            "role": "candidate",
        },

        "profile": {
            "bio": profile.bio if profile else None,
            "skills": profile.skills if profile else None,
            "experience": profile.experience if profile else None,
            "education": profile.education if profile else None,
            "resume_path": profile.resume_path if profile else None,
        }
    }


def update_status_logic(application_id: int, status: str, db: Session, current_user: User):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can update application status"
        )

    clean_status = normalize_status(status)

    if clean_status not in ["pending", "shortlisted", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid status. Use pending, shortlisted, or rejected"
        )

    application = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.job)
    ).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    if not can_manage_job(application.job, current_user, db):
        raise HTTPException(
            status_code=403,
            detail="You can update only your own job applications"
        )

    application.status = clean_status

    db.commit()
    db.refresh(application)

    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == application.user_id
    ).first()

    return {
        "message": f"Application marked as {clean_status}",
        "application": serialize_application(
            application=application,
            profile=profile
        )
    }


# ================= CANDIDATE: MY APPLICATIONS =================

@router.get("/my-applications")
def my_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can view own applications"
        )

    applications = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.user)
    ).filter(
        Application.user_id == current_user.id
    ).order_by(
        Application.id.desc()
    ).all()

    result = []

    for application in applications:
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.user_id == application.user_id
        ).first()

        result.append(
            serialize_application(
                application=application,
                profile=profile
            )
        )

    return result


# ================= RECRUITER: ALL APPLICANTS =================

@router.get("/recruiter/applicants")
def get_recruiter_applicants(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can view applicants"
        )

    recruiter_profile = db.query(RecruiterProfile).filter(
        RecruiterProfile.user_id == current_user.id
    ).first()

    query = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.job)
    ).join(
        Job,
        Application.job_id == Job.id
    )

    if current_user.role != "admin":
        conditions = [
            Job.user_id == current_user.id
        ]

        if recruiter_profile and recruiter_profile.company_name:
            company_name = normalize_text(recruiter_profile.company_name)

            conditions.append(
                func.lower(func.trim(Job.company_name)) == company_name
            )

        query = query.filter(or_(*conditions))

    applications = query.order_by(
        Application.id.desc()
    ).all()

    result = []

    for application in applications:
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.user_id == application.user_id
        ).first()

        result.append(
            serialize_application(
                application=application,
                profile=profile
            )
        )

    return result


# ================= RECRUITER: APPLICATIONS FOR ONE JOB =================

@router.get("/job/{job_id}")
def get_job_applications(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can view job applications"
        )

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if not can_manage_job(job, current_user, db):
        raise HTTPException(
            status_code=403,
            detail="You can view applications only for your own jobs"
        )

    applications = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.job)
    ).filter(
        Application.job_id == job_id
    ).order_by(
        Application.id.desc()
    ).all()

    result = []

    for application in applications:
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.user_id == application.user_id
        ).first()

        result.append(
            serialize_application(
                application=application,
                profile=profile
            )
        )

    return result


# ================= CANDIDATE: APPLY JOB =================

@router.post("/{job_id}")
def apply_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can apply for jobs"
        )

    job = db.query(Job).filter(
        Job.id == job_id
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    existing_application = db.query(Application).filter(
        Application.job_id == job_id,
        Application.user_id == current_user.id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=400,
            detail="You already applied for this job"
        )

    new_application = Application(
        user_id=current_user.id,
        job_id=job_id,
        status="pending",
        resume_viewed=False
    )

    db.add(new_application)
    db.commit()
    db.refresh(new_application)

    return {
        "message": "Job applied successfully",
        "application": serialize_application(
            application=new_application,
            profile=None
        )
    }


# ================= RECRUITER: VIEW RESUME =================

@router.put("/{application_id}/view-resume")
def view_candidate_resume(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can view candidate resume"
        )

    application = db.query(Application).options(
        joinedload(Application.job),
        joinedload(Application.user)
    ).filter(
        Application.id == application_id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    if not can_manage_job(application.job, current_user, db):
        raise HTTPException(
            status_code=403,
            detail="You can view resume only for your own job applications"
        )

    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == application.user_id
    ).first()

    if not profile or not profile.resume_path:
        raise HTTPException(
            status_code=404,
            detail="Candidate resume not uploaded"
        )

    application.resume_viewed = True

    db.commit()
    db.refresh(application)

    return {
        "message": "Resume viewed successfully",
        "resume_path": profile.resume_path,
        "application": serialize_application(
            application=application,
            profile=profile
        )
    }


@router.get("/{application_id}/resume")
def get_candidate_resume(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return view_candidate_resume(
        application_id=application_id,
        db=db,
        current_user=current_user
    )


# ================= RECRUITER: UPDATE APPLICATION STATUS =================

@router.put("/{application_id}/status")
def update_application_status_put(
    application_id: int,
    status_body: dict | None = Body(None),
    status_query: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    status = status_query

    if not status and status_body:
        status = status_body.get("status")

    if not status:
        raise HTTPException(
            status_code=400,
            detail="Status is required"
        )

    return update_status_logic(
        application_id=application_id,
        status=status,
        db=db,
        current_user=current_user
    )


@router.patch("/{application_id}/status")
def update_application_status_patch(
    application_id: int,
    status_body: dict | None = Body(None),
    status_query: str | None = Query(None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    status = status_query

    if not status and status_body:
        status = status_body.get("status")

    if not status:
        raise HTTPException(
            status_code=400,
            detail="Status is required"
        )

    return update_status_logic(
        application_id=application_id,
        status=status,
        db=db,
        current_user=current_user
    )


# ================= CANDIDATE: DELETE OWN APPLICATION =================

@router.delete("/{application_id}")
def delete_application(
    application_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can delete own application"
        )

    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()

    if not application:
        raise HTTPException(
            status_code=404,
            detail="Application not found"
        )

    db.delete(application)
    db.commit()

    return {
        "message": "Application deleted successfully"
    }