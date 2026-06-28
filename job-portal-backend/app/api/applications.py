import json

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
from app.models.interview_request import InterviewRequest

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

    if value in ["pending", "applied"]:
        return "pending"

    return ""


def serialize_status(status):
    return normalize_status(status) or "pending"


def normalize_interview_status(status):
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

    return [
        str(skill).strip()
        for skill in items
        if str(skill or "").strip()
    ]


def serialize_interview_request(request: InterviewRequest | None):
    if not request:
        return None

    return {
        "id": request.id,
        "application_id": request.application_id,
        "job_id": request.job_id,
        "recruiter_id": request.recruiter_id,
        "candidate_id": request.candidate_id,
        "status": normalize_interview_status(request.status),
        "rejection_reason": request.rejection_reason,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
    }


def display_user_name(user: User | None):
    if not user:
        return "Candidate"

    name = str(user.name or "").strip()

    if name and name.lower() not in ["undefined", "null", "none"]:
        return name

    if user.email:
        return user.email.split("@")[0]

    return "Candidate"


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
    clean_status = serialize_status(application.status)
    interview_request = db_interview_request = getattr(
        application,
        "interview_request",
        None
    )

    if db_interview_request is None:
        db_interview_request = None

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
            "skills": normalize_skills(job.skills),
            "status": job.status,
            "rejection_reason": job.rejection_reason,
            "user_id": job.user_id,
        } if job else None,

        "candidate": {
            "id": candidate.id,
            "name": display_user_name(candidate),
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
        },
        "interview_request": serialize_interview_request(db_interview_request)
    }


def get_or_create_interview_request(db: Session, application: Application):
    existing_request = db.query(InterviewRequest).filter(
        InterviewRequest.application_id == application.id
    ).first()

    if existing_request:
        if existing_request.status != "approved":
            existing_request.status = "pending"
            existing_request.rejection_reason = None

        return existing_request

    request = InterviewRequest(
        application_id=application.id,
        job_id=application.job_id,
        recruiter_id=application.job.user_id,
        candidate_id=application.user_id,
        status="pending",
    )

    db.add(request)

    return request


def get_or_create_candidate_profile(
    db: Session,
    user_id: int,
):
    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == user_id
    ).first()

    if profile:
        return profile

    profile = CandidateProfile(
        user_id=user_id,
        bio="",
        skills="",
        experience="",
        education="",
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


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

    if clean_status == "shortlisted":
        get_or_create_interview_request(
            db=db,
            application=application
        )
    else:
        interview_request = db.query(InterviewRequest).filter(
            InterviewRequest.application_id == application.id
        ).first()

        if interview_request and interview_request.status != "rejected":
            interview_request.status = "rejected"
            interview_request.rejection_reason = (
                "Removed from shortlist"
                if clean_status == "pending"
                else "Application rejected"
            )

    db.commit()
    db.refresh(application)
    application.interview_request = db.query(InterviewRequest).filter(
        InterviewRequest.application_id == application.id
    ).first()

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


@router.get("/recruiter/shortlisted")
def get_shortlisted_candidates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role not in ["recruiter", "company", "admin"]:
        raise HTTPException(
            status_code=403,
            detail="Only recruiters can view shortlisted candidates"
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
    ).filter(
        Application.status == "shortlisted",
        Job.is_deleted == False
    )

    if current_user.role != "admin":
        conditions = [Job.user_id == current_user.id]

        if recruiter_profile and recruiter_profile.company_name:
            company_name = normalize_text(recruiter_profile.company_name)
            conditions.append(
                func.lower(func.trim(Job.company_name)) == company_name
            )

        query = query.filter(or_(*conditions))

    applications = query.order_by(Application.updated_at.desc()).all()
    result = []

    for application in applications:
        application.interview_request = db.query(InterviewRequest).filter(
            InterviewRequest.application_id == application.id
        ).first()
        profile = db.query(CandidateProfile).filter(
            CandidateProfile.user_id == application.user_id
        ).first()
        result.append(serialize_application(application, profile))

    return result


@router.get("/interviews")
def get_my_interviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(InterviewRequest).options(
        joinedload(InterviewRequest.job),
        joinedload(InterviewRequest.application),
        joinedload(InterviewRequest.candidate),
        joinedload(InterviewRequest.recruiter),
    ).join(
        Job,
        InterviewRequest.job_id == Job.id
    ).filter(
        Job.is_deleted == False
    )

    if current_user.role == "candidate":
        query = query.filter(
            InterviewRequest.candidate_id == current_user.id,
            InterviewRequest.status == "approved"
        )
    elif current_user.role in ["recruiter", "company"]:
        query = query.filter(
            InterviewRequest.recruiter_id == current_user.id,
            InterviewRequest.status == "approved"
        )
    elif current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Access denied")

    return [
        {
            **serialize_interview_request(request),
            "job": {
                "id": request.job.id,
                "title": request.job.title,
                "company_name": request.job.company_name,
                "skills": normalize_skills(request.job.skills),
            } if request.job else None,
            "candidate": {
                "id": request.candidate.id,
                "name": display_user_name(request.candidate),
                "email": request.candidate.email,
            } if request.candidate else None,
            "recruiter": {
                "id": request.recruiter.id,
                "name": display_user_name(request.recruiter),
                "email": request.recruiter.email,
            } if request.recruiter else None,
        }
        for request in query.order_by(InterviewRequest.updated_at.desc()).all()
    ]


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
    ).join(
        Job,
        Application.job_id == Job.id
    ).filter(
        Application.user_id == current_user.id,
        Job.is_deleted == False
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
    ).filter(
        Job.is_deleted == False
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
        Job.id == job_id,
        Job.is_deleted == False
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

    if job.status != "approved":
        raise HTTPException(
            status_code=403,
            detail="This job is not open for applications yet"
        )

    existing_application = db.query(Application).filter(
        Application.job_id == job_id,
        Application.user_id == current_user.id
    ).first()

    if existing_application:
        raise HTTPException(
            status_code=409,
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

    profile = get_or_create_candidate_profile(
        db=db,
        user_id=current_user.id
    )

    new_application = db.query(Application).options(
        joinedload(Application.user),
        joinedload(Application.job)
    ).filter(
        Application.id == new_application.id
    ).first()

    return {
        "message": "Job applied successfully",
        "application": serialize_application(
            application=new_application,
            profile=profile
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
import json
