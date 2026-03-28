from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user
from app.models import Booking, BookingCreate, BookingRead, User

router = APIRouter(prefix="/bookings", tags=["bookings"])


def _enrich(booking: Booking, session: Session) -> BookingRead:
    """Attach the booker's name and email to a booking row."""
    user = session.get(User, booking.user_id)
    return BookingRead(
        **booking.model_dump(),
        booker_name=user.name if user else None,
        booker_email=user.email if user else None,
    )


def _has_conflict(
    session: Session,
    listing_id: int,
    start_date: str,
    end_date: str,
    exclude_id: Optional[int] = None,
) -> bool:
    """
    Returns True when there is already an approved booking that overlaps
    [start_date, end_date) for the given listing.
    Dates are stored as ISO strings (YYYY-MM-DD); lexicographic comparison works.
    """
    query = select(Booking).where(
        Booking.listing_id == listing_id,
        Booking.status == "approved",
        Booking.start_date < end_date,
        Booking.end_date > start_date,
    )
    if exclude_id is not None:
        query = query.where(Booking.id != exclude_id)
    return session.exec(query).first() is not None


# ── Read bookings ─────────────────────────────────────────────────────────────

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


# ── Create booking (auth required, user_id from JWT) ──────────────────────────

@router.post("", response_model=BookingRead, status_code=201)
def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if payload.start_date >= payload.end_date:
        raise HTTPException(
            status_code=400,
            detail="start_date must be before end_date",
        )
    if _has_conflict(session, payload.listing_id, payload.start_date, payload.end_date):
        raise HTTPException(
            status_code=409,
            detail="This space is already booked for those dates",
        )
    booking = Booking(
        **payload.model_dump(),
        user_id=current_user.id,
        status="pending",
    )
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return _enrich(booking, session)


# ── Update status (approve / decline — listing owner only) ────────────────────

@router.patch("/{booking_id}/status", response_model=BookingRead)
def update_booking_status(
    booking_id: int,
    status: str,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    from app.models import Listing
    listing = session.get(Listing, booking.listing_id)
    if not listing or listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="Only the listing owner can approve or decline")

    if status not in ("approved", "declined"):
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'declined'")

    if status == "approved" and _has_conflict(
        session, booking.listing_id, booking.start_date, booking.end_date, exclude_id=booking_id
    ):
        raise HTTPException(
            status_code=409,
            detail="Another booking was already approved for those dates",
        )

    booking.status = status
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return _enrich(booking, session)


# ── Cancel (renter cancels their own pending booking) ─────────────────────────

@router.patch("/{booking_id}/cancel", response_model=BookingRead)
def cancel_booking(
    booking_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    booking = session.get(Booking, booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only cancel your own bookings")
    if booking.status not in ("pending", "approved"):
        raise HTTPException(
            status_code=400,
            detail=f"Cannot cancel a booking with status '{booking.status}'",
        )
    booking.status = "cancelled"
    session.add(booking)
    session.commit()
    session.refresh(booking)
    return _enrich(booking, session)