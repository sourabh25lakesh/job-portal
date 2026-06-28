import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from starlette.middleware.sessions import SessionMiddleware

from sqlalchemy import inspect, text

from app.database.db import Base, engine

load_dotenv()

from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.candidate_profile import CandidateProfile
from app.models.recruiter import RecruiterProfile
from app.models.contact import ContactMessage
from app.models.interview_request import InterviewRequest


from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.applications import router as applications_router
from app.api.candidate_profile import router as candidate_profile_router
from app.api.resume import router as resume_router
from app.api.contact import router as contact_router
from app.api.password_reset import router as password_reset_router
from app.api.admin import router as admin_router
from app.api.recruiters import router as recruiters_router


Base.metadata.create_all(bind=engine)


def ensure_job_approval_columns():
    inspector = inspect(engine)
    job_columns = {
        column["name"]
        for column in inspector.get_columns("jobs")
    }

    with engine.begin() as connection:
        if "approval_status" in job_columns and "status" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "RENAME COLUMN approval_status TO status"
                )
            )
            job_columns.remove("approval_status")
            job_columns.add("status")

        if "status" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "ADD COLUMN status VARCHAR(50) "
                    "NOT NULL DEFAULT 'pending'"
                )
            )
            job_columns.add("status")

        if "rejection_reason" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "ADD COLUMN rejection_reason TEXT NULL"
                )
            )

        if "skills" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "ADD COLUMN skills TEXT NULL"
                )
            )

        if "created_at" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "ADD COLUMN created_at DATETIME "
                    "NOT NULL DEFAULT CURRENT_TIMESTAMP"
                )
            )

        if "updated_at" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "ADD COLUMN updated_at DATETIME "
                    "NOT NULL DEFAULT CURRENT_TIMESTAMP "
                    "ON UPDATE CURRENT_TIMESTAMP"
                )
            )

        if "is_deleted" not in job_columns:
            connection.execute(
                text(
                    "ALTER TABLE jobs "
                    "ADD COLUMN is_deleted BOOLEAN "
                    "NOT NULL DEFAULT FALSE"
                )
            )

        connection.execute(
            text(
                "UPDATE jobs "
                "SET status = 'pending' "
                "WHERE status IS NULL OR status = ''"
            )
        )

        connection.execute(
            text(
                "UPDATE jobs "
                "SET is_deleted = FALSE "
                "WHERE is_deleted IS NULL"
            )
        )


ensure_job_approval_columns()


app = FastAPI(
    title="Job Portal Backend",
    version="1.0.0"
)


app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv(
        "SESSION_SECRET_KEY",
        "job-portal-google-session-secret"
    )
)


FRONTEND_URLS = os.getenv(
    "FRONTEND_URLS",
    "http://localhost:5173,http://127.0.0.1:5173"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=FRONTEND_URLS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

UPLOAD_DIR = os.path.join(BASE_DIR, "uploads")

os.makedirs(
    UPLOAD_DIR,
    exist_ok=True
)

app.mount(
    "/uploads",
    StaticFiles(directory=UPLOAD_DIR),
    name="uploads"
)


app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(candidate_profile_router)
app.include_router(resume_router)
app.include_router(contact_router)
app.include_router(password_reset_router)
app.include_router(admin_router)
app.include_router(recruiters_router)


@app.get("/")
def root():
    return {
        "message": "Job Portal API is running successfully"
    }
