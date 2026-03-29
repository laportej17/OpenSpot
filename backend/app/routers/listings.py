from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, SQLModel as _SQLModel, col

from app.database import get_session
from app.deps import get_current_user
from app.models import Listing, ListingCreate, ListingUpdate, User

router = APIRouter(prefix="/listings", tags=["listings"])


# ── Browse ────────────────────────────────────────────────────────────────────

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
        query = query.where(col(Listing.category) == category)
    if city:
        query = query.where(col(Listing.city).ilike(f"%{city}%"))
    if min_price is not None:
        query = query.where(col(Listing.price_per_day) >= min_price)
    if max_price is not None:
        query = query.where(col(Listing.price_per_day) <= max_price)
    return session.exec(query).all()


# ── Single listing ────────────────────────────────────────────────────────────

class ListingWithOwner(_SQLModel):
    id: int
    title: str
    description: str
    category: str
    city: str
    address: str
    price_per_day: float
    price_per_hour: Optional[float] = None
    capacity: int
    size_sqft: int
    amenities: Optional[list] = None
    image_url: str
    image_urls: Optional[list] = None
    owner_id: int
    owner_name: Optional[str] = None
    owner_email: Optional[str] = None


@router.get("/{listing_id}", response_model=ListingWithOwner)
def read_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail="Listing not found")
    owner = session.get(User, listing.owner_id)
    return ListingWithOwner(
        **listing.model_dump(),
        owner_name=owner.name if owner else None,
        owner_email=owner.email if owner else None,
    )


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("", response_model=Listing, status_code=201)
def create_listing(
    payload: ListingCreate,
    current_user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    if current_user.id is None:
        raise HTTPException(status_code=401, detail="Invalid user")
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