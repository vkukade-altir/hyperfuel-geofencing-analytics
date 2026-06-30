# Hyperfuel Geofencing Analytics — Web Dashboard

React analytics console for inspecting geofencing data per user.

## Stack

- React 18 + TypeScript + Vite
- TanStack Query (data fetching with AbortSignal — no leaked requests)
- Tailwind CSS
- Proxies `/api` → `http://localhost:8000`

## Development

From the **repo root**:

```bash
npm install          # installs concurrently
cd apps/web && npm install
cd ../api && pip install -e ".[dev]"

npm run dev          # starts API :8000 + web :5173
```

Open http://localhost:5173

## Pages

| Route | Description |
|-------|-------------|
| `/` | **Users table** — search, sort, filter by min pings, click row to drill in |
| `/users/:userId` | **Pings** tab — all location pings, click row for GPS/details. **Events** tab — all ENTER/EXIT events, click row for full event drill-down (source ping, session, entity). |
