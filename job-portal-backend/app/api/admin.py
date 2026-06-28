import json

from datetime import datetime

from fastapi import (
    APIRouter,
    Body,
    Depends,
    HTTPException
)

from sqlalchemy import case, func
from sqlalchemy.orm import Session, joinedload

from app.database.db import get_db

from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.contact import ContactMessage
from app.models.interview_request import InterviewRequest

from app.schemas.job import JobModerationRequest, JobResponse
from app.schemas.interview import InterviewModerationRequest, InterviewRequestResponse

from app.utils.role_checker import require_role


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)


def month_labels(months_back=11):
    today = datetime.utcnow()
    labels = []

    for offset in range(months_back, -1, -1):
        month = today.month - offset
        year = today.year

        while month <= 0:
            month += 12
            year -= 1

        labels.append(f"{year}-{month:02d}")

    return labels


def monthly_count_map(db: Session, model, date_column, *filters):
    query = db.query(
        func.date_format(date_column, "%Y-%m").label("month"),
        func.count(model.id).label("total")
    )

    if filters:
        query = query.filter(*filters)

    rows = query.group_by("month").all()

    return {
        row.month: int(row.total or 0)
        for row in rows
        if row.month
    }


def serialize_admin_job(job: Job):
    recruiter = job.user
    skills = []

    if job.skills:
        try:
            parsed_skills = json.loads(job.skills)
            skills = parsed_skills if isinstance(parsed_skills, list) else []
        except json.JSONDecodeError:
            skills = [
                skill.strip()
                for skill in str(job.skills).split(",")
                if skill.strip()
            ]

    return {
        "id": job.id,
        "title": job.title,
        "company_name": job.company_name,
        "location": job.location,
        "salary": job.salary,
        "description": job.description,
        "skills": skills,
        "status": job.status or "pending",
        "rejection_reason": job.rejection_reason,
        "is_deleted": bool(getattr(job, "is_deleted", False)),
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "user_id": job.user_id,
        "recruiter": {
            "id": recruiter.id,
            "name": recruiter.name,
            "email": recruiter.email,
            "role": recruiter.role,
        } if recruiter else None,
    }


def job_approval_sort():
    return case(
        (Job.status == "pending", 0),
        (Job.status == "rejected", 1),
        else_=2
    )


# ================= ADMIN DASHBOARD =================
@router.get("/dashboard")
def admin_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    total_users = db.query(User).count()

    active_jobs_query = db.query(Job).filter(Job.is_deleted == False)
    total_jobs = active_jobs_query.count()
    pending_jobs = active_jobs_query.filter(Job.status == "pending").count()
    approved_jobs = active_jobs_query.filter(Job.status == "approved").count()
    rejected_jobs = active_jobs_query.filter(Job.status == "rejected").count()
    pending_interviews = db.query(InterviewRequest).filter(
        InterviewRequest.status == "pending"
    ).count()
    approved_interviews = db.query(InterviewRequest).filter(
        InterviewRequest.status == "approved"
    ).count()
    total_recruiters = db.query(User).filter(
        User.role.in_(["recruiter", "company"])
    ).count()
    total_candidates = db.query(User).filter(User.role == "candidate").count()

    total_applications = db.query(Application).count()

    total_messages = db.query(ContactMessage).count()

    latest_users = db.query(User).order_by(
        User.id.desc()
    ).limit(5).all()

    latest_jobs = db.query(Job).options(
        joinedload(Job.user)
    ).filter(
        Job.is_deleted == False
    ).order_by(
        job_approval_sort(),
        Job.id.desc()
    ).limit(10).all()

    latest_applications = db.query(Application).order_by(
        Application.id.desc()
    ).limit(5).all()

    latest_messages = db.query(ContactMessage).order_by(
        ContactMessage.id.desc()
    ).limit(5).all()

    latest_interviews = db.query(InterviewRequest).options(
        joinedload(InterviewRequest.job),
        joinedload(InterviewRequest.candidate),
        joinedload(InterviewRequest.recruiter),
    ).order_by(
        case((InterviewRequest.status == "pending", 0), else_=1),
        InterviewRequest.id.desc()
    ).limit(10).all()

    return {
        "total_users": total_users,
        "total_jobs": total_jobs,
        "pending_jobs": pending_jobs,
        "approved_jobs": approved_jobs,
        "rejected_jobs": rejected_jobs,
        "pending_interviews": pending_interviews,
        "approved_interviews": approved_interviews,
        "total_recruiters": total_recruiters,
        "total_candidates": total_candidates,
        "total_active_jobs": approved_jobs,
        "total_applications": total_applications,
        "total_messages": total_messages,
        "latest_users": latest_users,
        "latest_jobs": [
            serialize_admin_job(job)
            for job in latest_jobs
        ],
        "latest_applications": latest_applications,
        "latest_messages": latest_messages,
        "latest_interviews": [
            serialize_interview_request(request)
            for request in latest_interviews
        ],
    }


@router.get("/analytics")
def admin_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    active_jobs_query = db.query(Job).filter(Job.is_deleted == False)
    deleted_jobs = db.query(Job).filter(Job.is_deleted == True).count()

    pending_applications = db.query(Application).filter(
        Application.status.in_(["pending", "Pending", "applied", "Applied"])
    ).count()
    shortlisted_applications = db.query(Application).filter(
        Application.status.in_(["shortlisted", "Shortlisted"])
    ).count()
    rejected_applications = db.query(Application).filter(
        Application.status.in_(["rejected", "Rejected"])
    ).count()
    approved_interviews = db.query(InterviewRequest).filter(
        InterviewRequest.status == "approved"
    ).count()

    labels = month_labels()
    jobs_by_month = monthly_count_map(
        db,
        Job,
        Job.created_at,
        Job.is_deleted == False
    )
    applications_by_month = monthly_count_map(
        db,
        Application,
        Application.created_at
    )
    approved_interviews_by_month = monthly_count_map(
        db,
        InterviewRequest,
        InterviewRequest.updated_at,
        InterviewRequest.status == "approved"
    )

    return {
        "user_statistics": [
            {
                "name": "Candidates",
                "value": db.query(User).filter(User.role == "candidate").count(),
            },
            {
                "name": "Recruiters",
                "value": db.query(User).filter(
                    User.role.in_(["recruiter", "company"])
                ).count(),
            },
            {
                "name": "Admins",
                "value": db.query(User).filter(User.role == "admin").count(),
            },
        ],
        "job_statistics": [
            {
                "name": "Total Jobs",
                "value": active_jobs_query.count(),
            },
            {
                "name": "Pending",
                "value": active_jobs_query.filter(Job.status == "pending").count(),
            },
            {
                "name": "Approved",
                "value": active_jobs_query.filter(Job.status == "approved").count(),
            },
            {
                "name": "Rejected",
                "value": active_jobs_query.filter(Job.status == "rejected").count(),
            },
            {
                "name": "Deleted",
                "value": deleted_jobs,
            },
        ],
        "application_statistics": [
            {
                "name": "Total Applications",
                "value": db.query(Application).count(),
            },
            {
                "name": "Pending",
                "value": pending_applications,
            },
            {
                "name": "Shortlisted",
                "value": shortlisted_applications,
            },
            {
                "name": "Rejected",
                "value": rejected_applications,
            },
            {
                "name": "Approved Interviews",
                "value": approved_interviews,
            },
        ],
        "monthly_analytics": [
            {
                "month": label,
                "jobs": jobs_by_month.get(label, 0),
                "applications": applications_by_month.get(label, 0),
                "approved_interviews": approved_interviews_by_month.get(label, 0),
            }
            for label in labels
        ],
    }


def serialize_interview_request(request: InterviewRequest):
    return {
        "id": request.id,
        "application_id": request.application_id,
        "job_id": request.job_id,
        "recruiter_id": request.recruiter_id,
        "candidate_id": request.candidate_id,
        "status": request.status or "pending",
        "rejection_reason": request.rejection_reason,
        "created_at": request.created_at,
        "updated_at": request.updated_at,
        "job": {
            "id": request.job.id,
            "title": request.job.title,
            "company_name": request.job.company_name,
            "location": request.job.location,
        } if request.job else None,
        "candidate": {
            "id": request.candidate.id,
            "name": request.candidate.name,
            "email": request.candidate.email,
        } if request.candidate else None,
        "recruiter": {
            "id": request.recruiter.id,
            "name": request.recruiter.name,
            "email": request.recruiter.email,
        } if request.recruiter else None,
    }


@router.get("/interviews")
def get_all_interview_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    requests = db.query(InterviewRequest).options(
        joinedload(InterviewRequest.job),
        joinedload(InterviewRequest.candidate),
        joinedload(InterviewRequest.recruiter),
    ).order_by(
        case((InterviewRequest.status == "pending", 0), else_=1),
        InterviewRequest.id.desc()
    ).all()

    return [
        serialize_interview_request(request)
        for request in requests
    ]


@router.get("/interviews/pending")
def get_pending_interview_requests(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    requests = db.query(InterviewRequest).options(
        joinedload(InterviewRequest.job),
        joinedload(InterviewRequest.candidate),
        joinedload(InterviewRequest.recruiter),
    ).filter(
        InterviewRequest.status == "pending"
    ).order_by(InterviewRequest.created_at.asc()).all()

    return [
        serialize_interview_request(request)
        for request in requests
    ]


@router.patch(
    "/interviews/{interview_id}/approve",
    response_model=InterviewRequestResponse
)
def approve_interview_request(
    interview_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    request = db.query(InterviewRequest).filter(
        InterviewRequest.id == interview_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Interview request not found")

    request.status = "approved"
    request.rejection_reason = None
    db.commit()
    db.refresh(request)

    return request


@router.patch(
    "/interviews/{interview_id}/reject",
    response_model=InterviewRequestResponse
)
def reject_interview_request(
    interview_id: int,
    payload: InterviewModerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    reason = (payload.rejection_reason or "").strip()

    if not reason:
        raise HTTPException(status_code=422, detail="Rejection reason is required")

    request = db.query(InterviewRequest).filter(
        InterviewRequest.id == interview_id
    ).first()

    if not request:
        raise HTTPException(status_code=404, detail="Interview request not found")

    request.status = "rejected"
    request.rejection_reason = reason
    db.commit()
    db.refresh(request)

    return request


# ================= GET ALL USERS =================
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    users = db.query(User).order_by(
        User.id.desc()
    ).all()

    return users


# ================= GET ALL JOBS =================
@router.get("/jobs")
def get_all_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    jobs = db.query(Job).options(
        joinedload(Job.user)
    ).filter(
        Job.is_deleted == False
    ).order_by(
        job_approval_sort(),
        Job.id.desc()
    ).all()

    return [
        serialize_admin_job(job)
        for job in jobs
    ]


# ================= GET PENDING JOBS =================
@router.get("/jobs/pending")
def get_pending_jobs(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    jobs = db.query(Job).options(
        joinedload(Job.user)
    ).filter(
        Job.status == "pending",
        Job.is_deleted == False
    ).order_by(
        Job.created_at.asc()
    ).all()

    return [
        serialize_admin_job(job)
        for job in jobs
    ]


# ================= APPROVE JOB =================
@router.patch("/jobs/{job_id}/approve", response_model=JobResponse)
def approve_job(
    job_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
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

    job.status = "approved"
    job.rejection_reason = None

    db.commit()
    db.refresh(job)

    return job


# ================= REJECT JOB =================
@router.patch("/jobs/{job_id}/reject", response_model=JobResponse)
def reject_job(
    job_id: int,
    payload: JobModerationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    reason = (payload.rejection_reason or "").strip()

    if not reason:
        raise HTTPException(
            status_code=422,
            detail="Rejection reason is required"
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

    job.status = "rejected"
    job.rejection_reason = reason

    db.commit()
    db.refresh(job)

    return job


# ================= BACKWARD-COMPATIBLE APPROVAL ROUTE =================
@router.patch("/jobs/{job_id}/approval")
def update_job_approval(
    job_id: int,
    payload: dict = Body(default_factory=dict),
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    # Older frontend code used this route; keep it available while new UI uses
    # explicit approve/reject endpoints.
    status = str(payload.get("status", "")).strip().lower()
    reason = str(payload.get("rejection_reason") or "").strip()

    if status in ["reject", "rejected"] or reason:
        job = reject_job(
            job_id=job_id,
            payload=JobModerationRequest(rejection_reason=reason),
            db=db,
            current_user=current_user
        )
        return {
            "message": "Job rejected successfully",
            "job": job
        }

    if status not in ["", "approve", "approved"]:
        raise HTTPException(
            status_code=400,
            detail="Invalid approval status"
        )

    job = approve_job(
        job_id=job_id,
        db=db,
        current_user=current_user
    )

    return {
        "message": "Job approved successfully",
        "job": job
    }


# ================= GET ALL APPLICATIONS =================
@router.get("/applications")
def get_all_applications(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    applications = db.query(Application).order_by(
        Application.id.desc()
    ).all()

    return applications


# ================= GET ALL CONTACT MESSAGES =================
@router.get("/contact-messages")
def get_all_contact_messages(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    messages = db.query(ContactMessage).order_by(
        ContactMessage.id.desc()
    ).all()

    return messages


# ================= DELETE USER =================
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        require_role(["admin"])
    )
):
    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )

    if user.id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="You cannot delete your own admin account"
        )

    db.delete(user)

    db.commit()

    return {
        "message": "User deleted successfully"
    }
