from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.saved_job import (
    SavedJob
)

from app.models.job import Job
from app.models.user import User

from app.schemas.saved_job import (
    SavedJobCreate,
    SavedJobResponse
)

from app.utils.role_checker import (
    require_role
)

router = APIRouter(
    prefix="/saved-jobs",
    tags=["Saved Jobs"]
)


# Save Job
@router.post(
    "/",
    response_model=SavedJobResponse
)
def save_job(
    saved_job: SavedJobCreate,
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_role(["candidate"])
    )
):

    # Check Job Exists
    job = db.query(Job).filter(
        Job.id == saved_job.job_id,
        Job.is_deleted == False
    ).first()

    if not job:
        raise HTTPException(
            status_code=404,
            detail="Job not found"
        )

    if job.status != "approved":
        raise HTTPException(
            status_code=403,
            detail="This job is not available to save yet"
        )

    # Check Already Saved
    existing_saved_job = db.query(
        SavedJob
    ).filter(
        SavedJob.user_id == current_user.id,
        SavedJob.job_id == saved_job.job_id
    ).first()

    if existing_saved_job:
        raise HTTPException(
            status_code=400,
            detail="Job already saved"
        )

    new_saved_job = SavedJob(
        user_id=current_user.id,
        job_id=saved_job.job_id
    )

    db.add(new_saved_job)

    db.commit()

    db.refresh(new_saved_job)

    return new_saved_job


# Get Saved Jobs
@router.get(
    "/",
    response_model=list[SavedJobResponse]
)
def get_saved_jobs(
    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_role(["candidate"])
    )
):

    saved_jobs = db.query(
        SavedJob
    ).join(
        Job,
        SavedJob.job_id == Job.id
    ).filter(
        Job.status == "approved",
        Job.is_deleted == False,
        SavedJob.user_id == current_user.id
    ).all()

    return saved_jobs
