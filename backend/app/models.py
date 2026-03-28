from typing import Optional
from sqlalchemy import JSON
from sqlmodel import Field, SQLModel, Column

class ListingBase(SQLModel):
    title: str
    description: str
    category: str
    city: str
    address: str
    price_per_day: float
    capacity: int
    size_sqft: int
    amenities: Optional[list] = Field(default=None, sa_column=Column(JSON))
    image_url: str
    owner_id: int

class Listing(ListingBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

class ListingCreate(ListingBase):
    pass

class BookingBase(SQLModel):
    listing_id: int
    user_id: int
    start_date: str
    end_date: str
    purpose: str

class Booking(BookingBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default='pending')

class BookingCreate(BookingBase):
    pass