from fastapi import (
    APIRouter,
    Depends,
    HTTPException
)

from sqlalchemy.orm import Session

from app.database.db import get_db

from app.models.company import Company
from app.models.user import User

from app.schemas.company import (
    CompanyCreate,
    CompanyResponse
)

from app.utils.dependencies import (
    get_current_user
)

router = APIRouter(
    prefix="/company",
    tags=["Company"]
)


# Create Company Profile
@router.post(
    "/",
    response_model=CompanyResponse
)
def create_company(
    company: CompanyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    existing_company = db.query(
        Company
    ).filter(
        Company.user_id == current_user.id
    ).first()

    if existing_company:
        raise HTTPException(
            status_code=400,
            detail="Company profile already exists"
        )

    new_company = Company(
        user_id=current_user.id,
        company_name=company.company_name,
        description=company.description,
        website=company.website,
        location=company.location
    )

    db.add(new_company)
    db.commit()
    db.refresh(new_company)

    return new_company


# Get My Company Profile
@router.get(
    "/me",
    response_model=CompanyResponse
)
def get_company_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    company = db.query(
        Company
    ).filter(
        Company.user_id == current_user.id
    ).first()

    if not company:
        raise HTTPException(
            status_code=404,
            detail="Company profile not found"
        )

    return company