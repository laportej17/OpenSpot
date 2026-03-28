from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from app.database import get_session
from app.models import User, UserCreate, UserRead, UserLogin
from app.auth import hash_password, verify_password, create_access_token

router = APIRouter(prefix='/auth', tags=['auth'])

@router.post('/register', response_model=UserRead, status_code=201)
def register(payload: UserCreate, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == payload.email)).first()
    if existing:
        raise HTTPException(status_code=400, detail='Email already registered')
    user = User(
        name=payload.name,
        email=payload.email,
        hashed_password=hash_password(payload.password)
    )
    session.add(user)
    session.commit()
    session.refresh(user)
    return user

@router.post('/login')
def login(payload: UserLogin, session: Session = Depends(get_session)):
    user = session.exec(select(User).where(User.email == payload.email)).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail='Invalid email or password')
    token = create_access_token({"sub": str(user.id), "name": user.name, "email": user.email})
    return {"access_token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}