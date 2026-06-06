from jose import jwt
from datetime import (
    datetime,
    timedelta
)

SECRET_KEY = "MYSECRETKEY"

ALGORITHM = "HS256"


def create_reset_token(
    email: str
):

    expire = datetime.utcnow() + timedelta(
        minutes=30
    )

    payload = {
        "sub": email,
        "exp": expire
    }

    token = jwt.encode(
        payload,
        SECRET_KEY,
        algorithm=ALGORITHM
    )

    return token


def verify_reset_token(
    token: str
):

    payload = jwt.decode(
        token,
        SECRET_KEY,
        algorithms=[ALGORITHM]
    )

    return payload["sub"]