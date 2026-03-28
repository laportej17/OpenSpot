from fastapi import APIRouter, Depends
from sqlmodel import Session, select

from app.database import get_session
from app.models import Booking, BookingCreate

router = APIRouter(prefix='/bookings', tags=['bookings'])


@router.get('', response_model=list[Booking])
def read_bookings(session: Session = Depends(get_session)):
    return session.exec(select(Booking)).all()


@router.post('', response_model=Booking, status_code=201)
def create_booking(payload: BookingCreate, session: Session = Depends(get_session)):
    booking = Booking.model_validate(payload)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking
