from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import users, listings, bookings

app = FastAPI()

# ✅ FIXED CORS CONFIG
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://openspot-1.onrender.com",  # your frontend URL
        "http://localhost:5173",            # local dev
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(users.router)
app.include_router(listings.router)
app.include_router(bookings.router)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

@app.get("/")
def root():
    return {"message": "OpenSpot API is running"}