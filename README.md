# OpenSpot MVP

A basic hackathon-ready full-stack starter for OpenSpot:
- **Frontend:** React + Vite
- **Backend:** FastAPI + SQLModel + SQLite

## Run the backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
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
