from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import create_db_and_tables, run_migrations, engine
from app.routers import bookings, listings, users
from app.seed import seed_listings
from sqlmodel import Session

app = FastAPI(title='OpenSpot API')

app.add_middleware(
    CORSMiddleware,
    allow_origins=['http://localhost:5173', 'http://127.0.0.1:5173'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.on_event('startup')
def on_startup() -> None:
    create_db_and_tables()
    run_migrations()  # add this line
    with Session(engine) as session:
        seed_listings(session)

@app.get('/')
def read_root():
    return {'message': 'OpenSpot API is running'}

app.include_router(listings.router)
app.include_router(bookings.router)
app.include_router(users.router)