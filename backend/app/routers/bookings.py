from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user
from app.models import Booking, BookingCreate, BookingRead, User, VALID_BOOKING_TYPES

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _enrich(booking: Booking, session: Session) -> BookingRead:
    user = session.get(User, booking.user_id)
    return BookingRead(
        **booking.model_dump(),
        booker_name=user.name if user else None,
        booker_email=user.email if user else None,
    )


def _has_daily_conflict(
    session: Session,
    listing_id: int,
    start_date: str,
    end_date: str,
    exclude_id: Optional[int] = None,
) -> bool:
    """True if an approved daily booking overlaps [start_date, end_date)."""
    query = select(Booking).where(
        Booking.listing_id == listing_id,
        Booking.status == "approved",
        Booking.booking_type == "daily",
        Booking.start_date < end_date,
        Booking.end_date > start_date,
    )
    if exclude_id is not None:
        query = query.where(Booking.id != exclude_id)
    return session.exec(query).first() is not None


def _has_hourly_conflict(
    session: Session,
    listing_id: int,
    date: str,
    start_time: str,
    end_time: str,
    exclude_id: Optional[int] = None,
) -> bool:
    """True if an approved hourly booking on the same date overlaps [start_time, end_time)."""
    query = select(Booking).where(
        Booking.listing_id == listing_id,
        Booking.status == "approved",
        Booking.booking_type == "hourly",
        Booking.start_date == date,
        Booking.start_time < end_time,
        Booking.end_time > start_time,
    )
    if exclude_id is not None:
        query = query.where(Booking.id != exclude_id)
    return session.exec(query).first() is not None


def _validate_payload(payload: BookingCreate) -> None:
    if payload.booking_type not in VALID_BOOKING_TYPES:
        raise HTTPException(400, detail=f"booking_type must be one of {sorted(VALID_BOOKING_TYPES)}")

    if payload.booking_type == "daily":
        if payload.start_date >= payload.end_date:
            raise HTTPException(400, detail="start_date must be before end_date")

    elif payload.booking_type == "hourly":
        if payload.start_date != payload.end_date:
            raise HTTPException(400, detail="start_date and end_date must be the same day for hourly bookings")
        if not payload.start_time or not payload.end_time:
            raise HTTPException(400, detail="start_time and end_time are required for hourly bookings")
        if payload.start_time >= payload.end_time:
            raise HTTPException(400, detail="start_time must be before end_time")


# ── Read ──────────────────────────────────────────────────────────────────────

@router.get("", response_model=list[BookingRead])
def read_bookings(
    user_id: Optional[int] = None,
    listing_id: Optional[int] = None,
    session: Session = Depends(get_session),
):
    query = select(Booking)
    if user_id is not None:
        query = query.where(Booking.user_id == user_id)
    if listing_id is not None:
        query = query.where(Booking.listing_id == listing_id)
    return [_enrich(b, session) for b in session.exec(query).all()]


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=BookingRead, status_code=201)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    _validate_payload(payload)

    if payload.booking_type == "daily":
        if _has_daily_conflict(session, payload.listing_id, payload.start_date, payload.end_date):
            raise HTTPException(409, detail="This space is already booked for those dates")
    else:
        if _has_hourly_conflict(session, payload.listing_id, payload.start_date, payload.start_time, payload.end_time):
            raise HTTPException(409, detail="This space is already booked during those hours")

    booking = Booking(**payload.model_dump(), user_id=current_user.id, status="pending")
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return _enrich(booking, session)


# ── Approve / Decline ─────────────────────────────────────────────────────────

@router.patch("/{booking_id}/status", response_model=BookingRead)
def update_booking_status(
    booking_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, detail="Booking not found")

    from app.models import Listing
    listing = session.get(Listing, booking.listing_id)
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(403, detail="Only the listing owner can approve or decline")

    if status not in ("approved", "declined"):
        raise HTTPException(400, detail="Status must be 'approved' or 'declined'")

    if status == "approved":
        if booking.booking_type == "daily" and _has_daily_conflict(
            session, booking.listing_id, booking.start_date, booking.end_date, exclude_id=booking_id
        ):
            raise HTTPException(409, detail="Another booking was already approved for those dates")

        elif booking.booking_type == "hourly" and _has_hourly_conflict(
            session, booking.listing_id, booking.start_date,
            booking.start_time, booking.end_time, exclude_id=booking_id
        ):
            raise HTTPException(409, detail="Another booking was already approved during those hours")

    booking.status = status
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return _enrich(booking, session)


# ── Cancel ────────────────────────────────────────────────────────────────────

@router.patch("/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(403, detail="You can only cancel your own bookings")
    if booking.status not in ("pending", "approved"):
        raise HTTPException(400, detail=f"Cannot cancel a booking with status '{booking.status}'")

    booking.status = "cancelled"
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return _enrich(booking, session)