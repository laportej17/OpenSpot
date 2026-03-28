from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from app.database import get_session
from app.models import Booking, BookingCreate
from typing import Optional

router = APIRouter(prefix='/bookings', tags=['bookings'])

@router.get('', response_model=list[Booking])
def read_bookings(user_id: Optional[int] = Query(default=None), session: Session = Depends(get_session)):
    query = select(Booking)
    if user_id is not None:
        query = query.where(Booking.user_id == user_id)
    return session.exec(query).all()

@router.post('', response_model=Booking, status_code=201)
def create_booking(payload: BookingCreate, session: Session = Depends(get_session)):
    booking = Booking.model_validate(payload)
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking

@router.patch('/{booking_id}/status', response_model=Booking)
def update_booking_status(booking_id: int, status: str, session: Session = Depends(get_session)):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail='Booking not found')
    if status not in ('approved', 'declined'):
        raise HTTPException(status_code=400, detail='Status must be approved or declined')
    booking.status = status
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return booking