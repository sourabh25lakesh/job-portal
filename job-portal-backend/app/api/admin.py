from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.contact import ContactMessage

from app.utils.role_checker import require_role


router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
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

    total_jobs = db.query(Job).count()

    total_applications = db.query(Application).count()

    total_messages = db.query(ContactMessage).count()

    latest_users = db.query(User).order_by(
        User.id.desc()
    ).limit(5).all()

    latest_jobs = db.query(Job).order_by(
        Job.id.desc()
    ).limit(5).all()

    latest_applications = db.query(Application).order_by(
        Application.id.desc()
    ).limit(5).all()

    latest_messages = db.query(ContactMessage).order_by(
        ContactMessage.id.desc()
    ).limit(5).all()

    return {
        "total_users": total_users,
        "total_jobs": total_jobs,
        "total_applications": total_applications,
        "total_messages": total_messages,
        "latest_users": latest_users,
        "latest_jobs": latest_jobs,
        "latest_applications": latest_applications,
        "latest_messages": latest_messages,
    }


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
    jobs = db.query(Job).order_by(
        Job.id.desc()
    ).all()

    return jobs


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