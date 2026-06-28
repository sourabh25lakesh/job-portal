from fastapi import Depends, HTTPException
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.database.db import get_db
from app.models.user import User

from app.core.config import (
    SECRET_KEY,
    ALGORITHM
)

from app.core.security import oauth2_scheme


def get_current_user(

    token: str = Depends(oauth2_scheme),

    db: Session = Depends(get_db)

):

    credentials_exception = HTTPException(

        status_code=401,

        detail="Could not validate credentials"
    )

    try:

        payload = jwt.decode(

            token,

            SECRET_KEY,

            algorithms=[ALGORITHM]

        )

        user_value = payload.get("sub")

        if user_value is None:

            raise credentials_exception

    except JWTError:

        raise credentials_exception

    
    if str(user_value).isdigit():

        user = db.query(User).filter(
            User.id == int(user_value)
        ).first()

    else:

        user = db.query(User).filter(
            User.email == user_value
        ).first()

    if user is None:

        raise credentials_exception

    return user