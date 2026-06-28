from fastapi import (
    Depends,
    HTTPException
)

from app.models.user import User

from app.utils.dependencies import (
    get_current_user
)


def require_role(
    allowed_roles: list
):

    def role_checker(
        current_user = Depends(
            get_current_user
        )
    ):

        user_role = current_user.role.lower()

        allowed_roles_lower = [
            role.lower()
            for role in allowed_roles
        ]

        if user_role not in allowed_roles_lower:

            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return current_user

    return role_checker