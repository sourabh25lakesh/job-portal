from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.user import User
from app.models.candidate_profile import CandidateProfile

from app.schemas.candidate_profile import (
    CandidateProfileCreate,
)

from app.utils.dependencies import (
    get_current_user,
)

router = APIRouter(
    prefix="/candidate-profile",
    tags=["Candidate Profile"]
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


# =========================
# CREATE OR UPDATE PROFILE
# =========================
@router.post("/")
def create_profile(

    profile: CandidateProfileCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    existing_profile = db.query(
        CandidateProfile
    ).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if existing_profile:

        existing_profile.bio = profile.bio
        existing_profile.skills = profile.skills
        existing_profile.experience = profile.experience
        existing_profile.education = profile.education

        db.commit()

        db.refresh(existing_profile)

        return {
            "message": "Profile updated successfully",
            "profile": existing_profile
        }

    new_profile = CandidateProfile(

        user_id=current_user.id,

        bio=profile.bio,

        skills=profile.skills,

        experience=profile.experience,

        education=profile.education,
    )

    db.add(new_profile)

    db.commit()

    db.refresh(new_profile)

    return {
        "message": "Profile created successfully",
        "profile": new_profile
    }


# =========================
# GET MY PROFILE
# =========================
@router.get("/me")
def get_my_profile(

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    if current_user.role != "candidate":
        raise HTTPException(
            status_code=403,
            detail="Only candidates can access candidate profile"
        )

    profile = get_or_create_candidate_profile(
        db=db,
        current_user=current_user
    )

    return profile


# =========================
# UPDATE MY PROFILE
# =========================
@router.put("/me")
def update_my_profile(

    profile: CandidateProfileCreate,

    db: Session = Depends(get_db),

    current_user: User = Depends(get_current_user)

):

    existing_profile = db.query(
        CandidateProfile
    ).filter(
        CandidateProfile.user_id == current_user.id
    ).first()

    if not existing_profile:

        new_profile = CandidateProfile(

            user_id=current_user.id,

            bio=profile.bio,

            skills=profile.skills,

            experience=profile.experience,

            education=profile.education,
        )

        db.add(new_profile)

        db.commit()

        db.refresh(new_profile)

        return {
            "message": "Profile created successfully",
            "profile": new_profile
        }

    existing_profile.bio = profile.bio
    existing_profile.skills = profile.skills
    existing_profile.experience = profile.experience
    existing_profile.education = profile.education

    db.commit()

    db.refresh(existing_profile)

    return {
        "message": "Profile updated successfully",
        "profile": existing_profile
    }
