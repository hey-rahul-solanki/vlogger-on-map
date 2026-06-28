# Vlog-Powered Travel Discovery Map

A free-friendly MVP that turns travel vlogs into a destination-first discovery map. It is positioned as a social-proof travel discovery app, not a generic trip planner.

## Stack

- Frontend: React, TypeScript, Vite, MapLibre GL JS
- Backend: FastAPI, Pydantic
- Data: seeded in-memory dataset for MVP, shaped for Supabase/Postgres later
- AI/geocoding: integration seams documented for Gemini and MapTiler/OpenStreetMap

## Run Locally

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:

```bash
cd frontend
pnpm install
pnpm dev
```

Open `http://localhost:5173`.

## Environment

Frontend:

```bash
VITE_API_BASE_URL=http://localhost:8000
```

Backend:

```bash
ADMIN_INGEST_TOKEN=change-me
ALLOWED_ORIGINS=http://localhost:5173
```

## MVP Notes

- The app starts with curated destinations and video evidence.
- Every visible place has at least one video source.
- Low-confidence extracted places are labeled instead of presented as confirmed.
- The admin ingest endpoint is a stub that records intent without calling YouTube, Gemini, or geocoding APIs yet.

