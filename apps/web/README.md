# Hyperfuel Visit Analytics — Web Dashboard

React analytics console for leadership (station traffic, offer placement) and engineering drill-down (per-user timelines).

## Stack

- React 18 + TypeScript + Vite
- Material UI (MUI) + Tailwind (layout utilities)
- TanStack Query (data fetching with AbortSignal — no leaked requests)
- Proxies `/api` → `http://localhost:8000`

## Development

From the **repo root** (recommended):

```bash
# See root README for full one-time setup (venv, .env, installs)
npm run dev          # starts API :8000 + web :5173
```

Or web only (API must already be running on :8000):

```bash
cd apps/web
yarn install         # or npm install
yarn dev
```

Open http://localhost:5173 — redirects to `/stations`.

## Pages

| Route | Description |
|-------|-------------|
| `/stations` | **Home** — stations ranked by visits and time spent; expand row for amenities; click station or amenity for detail report |
| `/entities/:entityId` | Per-place report — KPIs, visitor table with visit history |
| `/users` | User list — search, sort, KPI summary cards |
| `/users/:userId` | User drill-down — **Visits** tab (arrivals/departures), **Location updates** tab, **Tracked places** tab; row click opens technical detail drawer |

The app reads data only through the FastAPI `/api` proxy — no browser Supabase client. A banner appears when the API is on in-memory storage.
