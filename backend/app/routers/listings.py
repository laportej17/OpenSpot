from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.database import get_session
from app.models import Listing, ListingCreate

router = APIRouter(prefix='/listings', tags=['listings'])


@router.get('', response_model=list[Listing])
def read_listings(session: Session = Depends(get_session)):
    return session.exec(select(Listing)).all()


@router.get('/{listing_id}', response_model=Listing)
def read_listing(listing_id: int, session: Session = Depends(get_session)):
    listing = session.get(Listing, listing_id)
    if not listing:
        raise HTTPException(status_code=404, detail='Listing not found')
    return listing


@router.post('', response_model=Listing, status_code=201)
def create_listing(payload: ListingCreate, session: Session = Depends(get_session)):
    listing = Listing.model_validate(payload)
    session.add(listing)
    session.commit()
    session.refresh(listing)
    return listing
