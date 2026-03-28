from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user
from app.models import User, UserCreate, UserRead, UserLogin, UserUpdate
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(tags=["auth"])


# ── Register ──────────────────────────────────────────────────────────────────

@router.post("/auth/register", response_model=UserRead, status_code=201)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password),
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user


# ── Login ─────────────────────────────────────────────────────────────────────

@router.post("/auth/login")
def login(payload: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(
        {"sub": str(user.id), "name": user.name, "email": user.email}
    )
    return {
        "access_token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }


# ── Me (get + update) ─────────────────────────────────────────────────────────

@router.get("/auth/me", response_model=UserRead)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/auth/me", response_model=UserRead)
def update_me(
    payload: UserUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if payload.email and payload.email != current_user.email:
        conflict = session.exec(
            select(User).where(User.email == payload.email)
        ).first()
        if conflict:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email
    if payload.name:
        current_user.name = payload.name
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return current_user


# ── Public user lookup (hosts need to see booker names) ───────────────────────

@router.get("/users/{user_id}", response_model=UserRead)
def get_user(user_id: int, session: Session = Depends(get_session)):
    user = session.get(User, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user