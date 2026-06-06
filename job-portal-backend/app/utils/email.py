import os
import socket

from dotenv import load_dotenv

from fastapi_mail import (
    FastMail,
    MessageSchema,
    ConnectionConfig
)

from pydantic import EmailStr


load_dotenv()

# Force Python SMTP connection to prefer IPv4
_original_getaddrinfo = socket.getaddrinfo


def _getaddrinfo_ipv4_only(*args, **kwargs):
    results = _original_getaddrinfo(*args, **kwargs)

    ipv4_results = [
        result for result in results
        if result[0] == socket.AF_INET
    ]

    return ipv4_results or results


socket.getaddrinfo = _getaddrinfo_ipv4_only


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER", "smtp.gmail.com"),
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)


async def send_email(
    subject: str,
    email_to: EmailStr,
    body: str
):

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=body,
        subtype="html"
    )

    fm = FastMail(conf)

    await fm.send_message(message)