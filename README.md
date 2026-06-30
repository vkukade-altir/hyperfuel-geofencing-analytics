# Hyperfuel Geofencing Analytics

Python FastAPI backend + React Visit Analytics dashboard for HF mobile geofencing ingest, server-side ENTER/EXIT computation, and leadership-facing data inspection.

Full specification: [`docs/geofencing-analytics-platform-spec.md`](docs/geofencing-analytics-platform-spec.md)

## Repository structure

```
hyperfuel-geofencing-analytics/
├── apps/
│   ├── api/          # FastAPI — ingest, geofence engine, analytics APIs
│   └── web/          # React Visit Analytics dashboard (Vite + MUI)
├── docs/
│   └── geofencing-analytics-platform-spec.md
└── package.json      # Root scripts: dev (API + web), test
```

## Prerequisites

- Python 3.11+
- Node.js 18+ (yarn recommended for `apps/web`)

## Quick start (full stack)

```bash
# One-time setup
cd apps/api
python -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
cp .env.example .env
pip install -e ".[dev]"
cd ../web && yarn install   # or npm install
cd ../.. && npm install     # concurrently at repo root

# Start API + web dashboard
npm run dev
```

- API: http://localhost:8000
- Dashboard: http://localhost:5173 (home → Stations)

Default local mode uses **in-memory storage** when `USE_MEMORY_STORE=true` or Supabase credentials are missing/placeholder. Set real credentials in `.env` and `USE_MEMORY_STORE=false` to read your Supabase data.

### Dashboard shows 0 users but Supabase has data?

The web app queries the **FastAPI API**, not Supabase directly. Fix `apps/api/.env`:

```bash
SUPABASE_URL=https://YOUR_PROJECT.supabase.co      # from Supabase → Settings → API
SUPABASE_SERVICE_ROLE_KEY=eyJ...                     # service_role key (not anon)
USE_MEMORY_STORE=false
```

Then restart `npm run dev`. The dashboard will show a warning banner if still on memory store.

## npm scripts (repo root)

| Script | Description |
|--------|-------------|
| `npm run dev` | API :8000 + web :5173 |
| `npm run test` | Run API pytest suite |
| `npm run build:web` | Production build of dashboard |
| `npm run install:all` | pip install API + npm install web |

## API only

```bash
cd apps/api
python -m venv .venv && source .venv/bin/activate
cp .env.example .env
pip install -e ".[dev]"
pytest tests -q
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Database migrations

SQL migrations live in `apps/api/migrations/`. Apply to your Supabase project via Dashboard SQL editor, Supabase CLI, or MCP `apply_migration`.

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/v1/ingest` | Entities + pings + optional events |
| GET | `/api/v1/geofence-config?user_id=` | Station geofence circles for a user |
| GET | `/api/v1/analytics/dashboard/summary` | Aggregate KPIs (`from`, `to` optional) |
| GET | `/api/v1/analytics/users` | User list with activity counts |
| GET | `/api/v1/analytics/users/{user_id}/timeline` | Full user journey |
| GET | `/api/v1/analytics/entities` | Entity list (`user_id` optional) |
| GET | `/api/v1/analytics/presence-sessions` | Dwell sessions (filters: user, entity, dates, `open_only`) |
| GET | `/api/v1/analytics/stations/catalog` | Stations with nested amenities and visit stats |
| GET | `/api/v1/analytics/entities/{entity_id}/analytics` | Per-place visit stats and user breakdown |

## Web dashboard routes

| Route | Purpose |
|-------|---------|
| `/stations` | **Home** — station foot traffic, expandable amenity rows |
| `/entities/:entityId` | Per-station or per-amenity visit report |
| `/users` | App users, search, KPIs |
| `/users/:userId` | User drill-down: visits, location updates, tracked places |

See [`apps/web/README.md`](apps/web/README.md) for frontend stack details.
