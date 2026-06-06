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
from app.models.user import User
from app.models.candidate_profile import CandidateProfile

from app.utils.dependencies import get_current_user


router = APIRouter(
    prefix="/resume",
    tags=["Resume"]
)


# Create Upload Folder Automatically
UPLOAD_DIR = "uploads/resumes"

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)


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

    # Find Profile
    profile = db.query(
        CandidateProfile
    ).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not profile:
        raise HTTPException(
            status_code=404,
            detail="Create profile first"
        )

    # Create File Name
    file_name = (
        f"user_{current_user.id}_{resume.filename}"
    )

    file_path = (
        f"{UPLOAD_DIR}/{file_name}"
    )

    # Save File
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(
            resume.file,
            buffer
        )

    # Save Path in Database
    profile.resume_path = file_path

    db.commit()
    db.refresh(profile)

    return {
        "message": "Resume uploaded successfully",
        "resume_path": file_path
    }