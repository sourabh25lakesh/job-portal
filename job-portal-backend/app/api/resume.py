import os
import shutil

from fastapi import (
    APIRouter,
    Depends,
    UploadFile,
    File,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.candidate_profile import CandidateProfile
from app.models.user import User

from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UPLOAD_ROOT = os.path.join(BASE_DIR, "uploads")
UPLOAD_DIR = os.path.join(UPLOAD_ROOT, "resumes")

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


def get_or_create_candidate_profile(
    db: Session,
    current_user: User,
):
    profile = db.query(
        CandidateProfile
    ).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if profile:
        return profile

    profile = CandidateProfile(
        user_id=current_user.id,
        bio="",
        skills="",
        experience="",
        education="",
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


# Upload Resume
@router.post("/upload")
def upload_resume(
    resume: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # Check File Type
    allowed_extensions = [
        ".pdf",
        ".doc",
        ".docx"
    ]

    file_extension = os.path.splitext(
        resume.filename
    )[1].lower()

    if file_extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Only PDF/DOC/DOCX allowed"
        )

    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can upload resumes"
        )

    profile = get_or_create_candidate_profile(
        db=db,
        current_user=current_user
    )

    # Create File Name
    safe_filename = os.path.basename(resume.filename)

    file_name = f"user_{current_user.id}_{safe_filename}"

    file_path = os.path.join(UPLOAD_DIR, file_name)

    # Save File
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            resume.file,
            buffer
        )

    # Save Path in Database
    profile.resume_path = f"uploads/resumes/{file_name}"

    db.commit()
    db.refresh(profile)

    return {
        "message": "Resume uploaded successfully",
        "resume_path": profile.resume_path,
        "profile": profile
    }
