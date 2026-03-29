# OpenSpot 
OpenSpot is a full-stack web appliction with a completely seperated frontend and backend. It's main purpose is to
find those with commercial spaces ready to rent, and connect people looking for those very own spaced.
This includes, Venues, Barns, Churches, Warehouses and so forth.
These allow people to rent these spaces for various different reasons, such as, Weddings, Parties, Storage, etc. 
In doing this, OpenSpot also benifits the environment, by utilizing the spaces we already have, this deters 
new buildings from being built, and let's us not waste any more of our precious environment.

- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLModel + SQLite

## Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
# Windows: .venv\Scripts\activate
#py -3.13 -m venv .venv  or pip install .
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Backend will run on `http://127.0.0.1:8000`.

## Run the frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://127.0.0.1:5173`.

## Notes

- The frontend points to `http://127.0.0.1:8000` by default.
- To change the API URL, create `frontend/.env` and add:

```bash
VITE_API_URL=http://127.0.0.1:8000
```

## Included pages

- Home page
- Browse listings
- Listing details
- Create listing
- Booking request form
