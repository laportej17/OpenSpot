from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.deps import get_current_user
from app.models import Listing, ListingCreate, ListingUpdate, User

router = APIRouter(prefix="/listings", tags=["listings"])


# ── Browse (with optional server-side filters) ────────────────────────────────

@router.get("", response_model=list[Listing])
def read_listings(
    category: Optional[str] = None,
    city: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    session: Session = Depends(get_session),
):
    query = select(Listing)
    if category:
        query = query.where(Listing.category == category)
    if city:
        # case-insensitive partial match
        query = query.where(Listing.city.ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(Listing.price_per_day >= min_price)
    if max_price is not None:
        query = query.where(Listing.price_per_day <= max_price)
    return session.exec(query).all()


# ── Single listing ────────────────────────────────────────────────────────────

@router.get("/{listing_id}", response_model=Listing)
def read_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


# ── Create (auth required — owner_id comes from JWT) ──────────────────────────

@router.post("", response_model=Listing, status_code=201)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    listing = Listing(**payload.model_dump(), owner_id=current_user.id)
    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing


# ── Update (owner only) ───────────────────────────────────────────────────────

@router.put("/{listing_id}", response_model=Listing)
def update_listing(
    listing_id: int,
    payload: ListingUpdate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this listing")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(listing, key, value)

    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing


# ── Delete (owner only) ───────────────────────────────────────────────────────

@router.delete("/{listing_id}", status_code=204)
def delete_listing(
    listing_id: int,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    if listing.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You don't own this listing")

    session.delete(listing)
    session.commit()