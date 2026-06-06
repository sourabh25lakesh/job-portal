from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from passlib.context import CryptContext

from app.database.db import get_db

from app.models.user import User

from app.schemas.password_reset import (
    ForgotPasswordRequest,
    ResetPasswordRequest
)

from app.utils.reset_token import (
    create_reset_token,
    verify_reset_token
)

from app.utils.email import send_email


# Password Hashing
pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# Router
router = APIRouter(
    prefix="/password",
    tags=["Password Reset"]
)


# =========================================
# Forgot Password
# =========================================
@router.post("/forgot")
async def forgot_password(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db)
):

    # Find user
    user = db.query(User).filter(
        User.email == request.email
    ).first()

    # User not found
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Create token
    token = create_reset_token(
        user.email
    )

    # Reset Link
    reset_link = (
        f"http://localhost:8000/password/reset?token={token}"
    )

    # Email Body
    email_body = f"""
    <h2>Password Reset</h2>

    <p>Hello {user.name if hasattr(user, 'name') else 'User'},</p>

    <p>
        Click the button below to reset your password:
    </p>

    <a href="{reset_link}"
       style="
            background-color:#2563eb;
            color:white;
            padding:10px 20px;
            text-decoration:none;
            border-radius:5px;
       ">
       Reset Password
    </a>

    <p>
        This link will expire soon.
    </p>

    <br>

    <p>
        Job Portal Team
    </p>
    """

    # Send Email
    await send_email(
        subject="Reset Password",
        email_to=user.email,
        body=email_body
    )

    return {
        "success": True,
        "message": "Password reset email sent successfully"
    }


# =========================================
# Reset Password
# =========================================
@router.post("/reset")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db)
):

    # Verify token
    email = verify_reset_token(
        request.token
    )

    # Invalid token
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired token"
        )

    # Find user
    user = db.query(User).filter(
        User.email == email
    ).first()

    # User not found
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    # Hash new password
    hashed_password = pwd_context.hash(
        request.new_password
    )

    # Update password
    user.password = hashed_password

    # Save changes
    db.commit()

    # Refresh user
    db.refresh(user)

    return {
        "success": True,
        "message": "Password reset successful"
    }