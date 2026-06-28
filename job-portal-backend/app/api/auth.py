import os
import traceback

from dotenv import load_dotenv

from fastapi import APIRouter, Depends, HTTPException, Form, Request
from fastapi.responses import RedirectResponse
from sqlalchemy.orm import Session
from authlib.integrations.starlette_client import OAuth

from app.database.db import get_db
from app.models.candidate_profile import CandidateProfile
from app.models.user import User
from app.utils.hashing import hash_password, verify_password
from app.utils.jwt import create_access_token
from app.utils.dependencies import get_current_user

load_dotenv()

router = APIRouter(
    prefix="/auth",
    tags=["Auth"]
)

oauth = OAuth()

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")

if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
    print("WARNING: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET missing in .env")

oauth.register(
    name="google",
    client_id=os.getenv("GOOGLE_CLIENT_ID"),
    client_secret=os.getenv("GOOGLE_CLIENT_SECRET"),
    server_metadata_url="https://accounts.google.com/.well-known/openid-configuration",
    client_kwargs={
        "scope": "openid email profile"
    },
    timeout=30,
)

def ensure_candidate_profile(
    db: Session,
    user: User,
):
    if user.role != "candidate":
        return None

    profile = db.query(CandidateProfile).filter(
        CandidateProfile.user_id == user.id
    ).first()

    if profile:
        return profile

    profile = CandidateProfile(
        user_id=user.id,
        bio="",
        skills="",
        experience="",
        education="",
    )

    db.add(profile)
    db.commit()
    db.refresh(profile)

    return profile


def clean_name(
    name: str,
    email: str,
):
    value = str(name or "").strip()

    if not value or value.lower() in ["undefined", "null", "none"]:
        return email.split("@")[0]

    return value


def repair_user_name_if_needed(
    db: Session,
    user: User,
):
    clean_value = clean_name(
        user.name,
        user.email
    )

    if user.name != clean_value:
        user.name = clean_value
        db.commit()
        db.refresh(user)


@router.post("/register")
def register(
    name: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(...),
    db: Session = Depends(get_db)
):
    existing_user = db.query(User).filter(
        User.email == email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    new_user = User(
        name=clean_name(name, email),
        email=email,
        password=hash_password(password),
        role=str(role or "candidate").strip().lower()
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    ensure_candidate_profile(
        db=db,
        user=new_user
    )

    return {
        "message": "User registered successfully",
        "user": {
            "id": new_user.id,
            "name": new_user.name,
            "email": new_user.email,
            "role": new_user.role
        }
    }


@router.post("/login")
def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(
        User.email == username
    ).first()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if not verify_password(password, user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    repair_user_name_if_needed(
        db=db,
        user=user
    )

    ensure_candidate_profile(
        db=db,
        user=user
    )

    access_token = create_access_token(
        data={
            "sub": str(user.id),
            "email": user.email,
            "role": user.role
        }
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role
        }
    }


@router.get("/me")
def get_logged_in_user(
    current_user: User = Depends(get_current_user)
):
    return {
        "id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "role": current_user.role
    }


@router.get("/google/login")
async def google_login(request: Request):
    backend_url = os.getenv(
        "BACKEND_URL",
        "http://127.0.0.1:8000"
    ).rstrip("/")

    redirect_uri = f"{backend_url}/auth/google/callback"

    print("GOOGLE REDIRECT URI:", redirect_uri)

    return await oauth.google.authorize_redirect(
        request,
        redirect_uri
    )


@router.get("/google/callback")
async def google_callback(
    request: Request,
    db: Session = Depends(get_db)
):
    try:
        google_token = await oauth.google.authorize_access_token(
            request
        )

        user_info = google_token.get("userinfo")

        if not user_info:
            user_info = await oauth.google.userinfo(
                token=google_token
            )

        email = user_info.get("email")
        name = user_info.get("name")

        if not email:
            raise HTTPException(
                status_code=400,
                detail="Google email not found"
            )

        user = db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            user = User(
                name=clean_name(name, email),
                email=email,
                password=hash_password("google-login-user"),
                role="candidate"
            )

            db.add(user)
            db.commit()
            db.refresh(user)
        else:
            repair_user_name_if_needed(
                db=db,
                user=user
            )

        ensure_candidate_profile(
            db=db,
            user=user
        )

        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "email": user.email,
                "role": user.role
            }
        )

        frontend_url = os.getenv(
            "FRONTEND_URL",
            "http://localhost:5173"
        ).rstrip("/")

        return RedirectResponse(
            url=f"{frontend_url}/google-success?token={access_token}&role={user.role}"
        )

    except HTTPException:
        raise

    except Exception as error:
        print("=" * 70)
        print("GOOGLE AUTH ERROR TYPE:", type(error))
        print("GOOGLE AUTH ERROR REPR:", repr(error))
        print("GOOGLE AUTH ERROR STR:", str(error))
        traceback.print_exc()
        print("=" * 70)

        raise HTTPException(
            status_code=400,
            detail="Google authentication failed"
        )