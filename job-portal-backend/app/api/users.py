from fastapi import APIRouter, Depends

# FIXED IMPORT
from app.utils.dependencies import get_current_user

from app.models.user import User

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


# =========================
# CURRENT LOGGED-IN USER
# =========================
@router.get("/me")
def read_users_me(

    current_user: User = Depends(
        get_current_user
    )

):

    return {

        "id": current_user.id,

        "name": current_user.name,

        "email": current_user.email,

        "role": current_user.role,
    }