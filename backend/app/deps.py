from fastapi import Depends, HTTPException, status
from sqlmodel import Session

from app.auth import get_token_payload
from app.database import get_session
from app.models import User


def get_current_user(
    payload: dict = Depends(get_token_payload),
    session: Session = Depends(get_session),
) -> User:
    """
    FastAPI dependency that resolves the JWT payload to a real User row.
    Use as:  current_user: User = Depends(get_current_user)
    """
    try:
        user_id = int(payload["sub"])
    except (KeyError, ValueError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Bad token payload")

    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    return user