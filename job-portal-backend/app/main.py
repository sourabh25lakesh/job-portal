import os

from dotenv import load_dotenv

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from starlette.middleware.sessions import SessionMiddleware

from app.database.db import Base, engine


# ================= LOAD ENV =================
load_dotenv()


# ================= IMPORT MODELS =================
from app.models.user import User
from app.models.job import Job
from app.models.application import Application
from app.models.candidate_profile import CandidateProfile
from app.models.recruiter import RecruiterProfile
from app.models.contact import ContactMessage


# ================= IMPORT ROUTERS =================
from app.api.auth import router as auth_router
from app.api.jobs import router as jobs_router
from app.api.applications import router as applications_router
from app.api.candidate_profile import router as candidate_profile_router
from app.api.resume import router as resume_router
from app.api.contact import router as contact_router
from app.api.password_reset import router as password_reset_router
from app.api.admin import router as admin_router
from app.api.recruiters import router as recruiters_router


# ================= CREATE DATABASE TABLES =================
Base.metadata.create_all(bind=engine)


# ================= APP CONFIG =================
app = FastAPI(
    title="Job Portal Backend",
    version="1.0.0"
)


# ================= SESSION MIDDLEWARE =================
app.add_middleware(
    SessionMiddleware,
    secret_key=os.getenv(
        "SESSION_SECRET_KEY",
        "job-portal-google-session-secret"
    )
)


# ================= CORS =================
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


# ================= UPLOADS FOLDER =================
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


# ================= ROUTERS =================
app.include_router(auth_router)
app.include_router(jobs_router)
app.include_router(applications_router)
app.include_router(candidate_profile_router)
app.include_router(resume_router)
app.include_router(contact_router)
app.include_router(password_reset_router)
app.include_router(admin_router)
app.include_router(recruiters_router)


# ================= ROOT API =================
@app.get("/")
def root():
    return {
        "message": "Job Portal API is running successfully"
    }