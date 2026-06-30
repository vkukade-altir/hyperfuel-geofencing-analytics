# Hyperfuel Geofencing Analytics

Python FastAPI backend + React analytics dashboard for HF mobile geofencing ingest, server-side ENTER/EXIT computation, and data inspection.

See `docs/geofencing-analytics-platform-spec.md` for the full specification.

## Quick start (full stack)

```bash
# One-time setup
cd apps/api && cp .env.example .env && pip install -e ".[dev]"
cd ../web && npm install
cd ../.. && npm install

# Start API + web dashboard
npm run dev
```

- API: http://localhost:8000
- Dashboard: http://localhost:5173

Default local mode uses **in-memory storage** when `USE_MEMORY_STORE=true` or Supabase credentials are missing/placeholder. Set real credentials in `.env` and `USE_MEMORY_STORE=false` to read your Supabase data.

### Dashboard shows 0 users but Supabase has data?

The web app queries the **FastAPI API**, not Supabase directly. Fix `apps/api/.env`:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co      # from Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     # service_role key (not anon)
USE_MEMORY_STORE=false
```

Then restart `npm run dev`. The dashboard will show a warning banner if still on memory store.

## API only

```bash
cd apps/api
cp .env.example .env
pip install -e ".[dev]"
pytest tests -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/v1/ingest` | Entities + pings + optional events |
| GET | `/api/v1/geofence-config` | Station geofence circles |
| GET | `/api/v1/analytics/dashboard/summary` | Aggregate KPIs |
| GET | `/api/v1/analytics/users` | User list with counts |
| GET | `/api/v1/analytics/users/{user_id}/timeline` | Full user journey |
| GET | `/api/v1/analytics/entities` | Entity list |
| GET | `/api/v1/analytics/presence-sessions` | Dwell sessions |
