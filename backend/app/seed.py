from sqlmodel import Session, select

from app.models import Listing

SEED_LISTINGS = [
    {
        'title': 'Rustic Barn Celebration Space',
        'description': 'A warm barn venue with string lights, open floor space, and parking for weddings or parties.',
        'category': 'event venue',
        'city': 'Hamilton',
        'address': '123 Meadow Lane',
        'price_per_day': 900,
        'capacity': 120,
        'size_sqft': 3200,
        'amenities': ['parking', 'chairs', 'lighting'],
        'image_url': 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
        'owner_id': 1,
    },
    {
        'title': 'Downtown Flex Office',
        'description': 'A modern office for team offsites, interviews, or short-term workspace needs.',
        'category': 'office',
        'city': 'Toronto',
        'address': '88 King Street West',
        'price_per_day': 250,
        'capacity': 20,
        'size_sqft': 900,
        'amenities': ['wifi', 'monitor', 'coffee'],
        'image_url': 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
        'owner_id': 1,
    },
    {
        'title': 'Climate-Controlled Storage Unit',
        'description': 'Secure indoor storage for business inventory, event decor, or temporary overflow.',
        'category': 'storage',
        'city': 'Mississauga',
        'address': '45 Warehouse Drive',
        'price_per_day': 80,
        'capacity': 1,
        'size_sqft': 250,
        'amenities': ['security', 'indoor access', 'loading bay'],
        'image_url': 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
        'owner_id': 1,
    },
]


def seed_listings(session: Session) -> None:
    existing = session.exec(select(Listing)).first()
    if existing:
        return

    for item in SEED_LISTINGS:
        session.add(Listing(**item))

    session.commit()
