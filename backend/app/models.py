from typing import Optional
from sqlalchemy import JSON
from sqlmodel import Field, SQLModel, Column


# ── Users ────────────────────────────────────────────────────────────────────

class UserBase(SQLModel):
    name: str
    email: str


class User(UserBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hashed_password: str


class UserCreate(UserBase):
    password: str


class UserLogin(SQLModel):
    email: str
    password: str


class UserRead(UserBase):
    id: int


class UserUpdate(SQLModel):
    """Used by PUT /auth/me — all fields optional."""
    name: Optional[str] = None
    email: Optional[str] = None


# ── Listings ─────────────────────────────────────────────────────────────────

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


class ListingCreate(SQLModel):
    """Owner id is injected from the JWT — not accepted from the request body."""
    title: str
    description: str
    category: str
    city: str
    address: str
    price_per_day: float
    capacity: int
    size_sqft: int
    amenities: Optional[list] = None
    image_url: str


class ListingUpdate(SQLModel):
    """All fields optional for partial updates via PUT."""
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    price_per_day: Optional[float] = None
    capacity: Optional[int] = None
    size_sqft: Optional[int] = None
    amenities: Optional[list] = None
    image_url: Optional[str] = None


# ── Bookings ──────────────────────────────────────────────────────────────────

VALID_STATUSES = {"pending", "approved", "declined", "cancelled"}


class BookingBase(SQLModel):
    listing_id: int
    user_id: int
    start_date: str
    end_date: str
    purpose: str


class Booking(BookingBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    status: str = Field(default="pending")


class BookingCreate(SQLModel):
    """User id is injected from the JWT — not accepted from the request body."""
    listing_id: int
    start_date: str
    end_date: str
    purpose: str


class BookingRead(BookingBase):
    """Booking response enriched with the booker's display name and email."""
    id: int
    status: str
    booker_name: Optional[str] = None
    booker_email: Optional[str] = None