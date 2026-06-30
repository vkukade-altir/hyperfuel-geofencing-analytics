---
name: visit-analytics-supabase
description: >-
  Hyperfuel Visit Analytics + Supabase — project facts, file map, env, schema expectations,
  user-supabase MCP (apply_migration, execute_sql, list_tables, advisors), and doc links.
  Use for any task touching database schema, migrations, backend repositories, or API data flow.
---

# Visit Analytics + Supabase

## When this skill applies

- Changing or debugging anything that reads/writes geofencing analytics data (pings, events, presence sessions, entities, users).
- Adding features that need new tables, indexes, or migrations.
- Inspecting live schema, running diagnostics, or applying DDL via Supabase MCP.

## Architecture (important)

- **Web app does NOT use a browser Supabase client.** React reads data via the **FastAPI proxy** at `/api` (Vite dev proxy → `http://localhost:8000`).
- **Backend** (`apps/api`) owns all Supabase access through repository backends — primarily `supabase_backend.py`; `memory_backend.py` when `USE_MEMORY_STORE=true`.
- **Migrations** live in `apps/api/migrations/*.sql` — repo source of truth for schema changes.

## Essential URLs (keep current)

- **Supabase docs (root):** https://supabase.com/docs
- **Python client reference:** https://supabase.com/docs/reference/python/introduction
- **Database linter / advisors:** https://supabase.com/docs/guides/database/database-linter
- **PostgreSQL functions:** https://supabase.com/docs/guides/database/functions

### Supabase MCP in this project (do not assume it is off)

Cursor may expose Supabase via **`user-supabase`** (see workspace MCP descriptors under `mcps/user-supabase/tools/`).

**Before calling any MCP tool:** read that tool's JSON schema (required fields, names).

**DDL / migrations — prefer MCP when the user has enabled Supabase MCP:**

- **`apply_migration`** — `{ "name": "snake_case_name", "query": "<full SQL>" }` — applies migration to the **linked** remote project. Repo files under `apps/api/migrations/*.sql` should stay the source of truth; paste the same SQL into `apply_migration` when applying remotely, or rely on CLI `db push` if the user prefers.
- **`list_migrations`** — see what ran on the remote DB.

**Other high-value tools:**

- `list_tables` (verbose) — live schema, RLS flags, columns, FKs.
- `execute_sql` — ad-hoc queries; use for diagnostics; DDL only when intentional.
- `search_docs` — Supabase docs search (prefer over guessing API behavior).
- `get_advisors` — security + performance lints for the linked project.
- `get_logs` — API/postgres logs when debugging ingest or query failures.

**Do not tell the user the agent "cannot" apply migrations** if Supabase MCP is enabled and logged in — check skills + MCP availability first. If MCP is unavailable in a session, fall back to: edit migration files in repo + user runs SQL via Dashboard or CLI.

## Environment

### Backend (`apps/api/.env`)

Copy from `apps/api/.env.example`. Key variables:

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server-only; never expose to web) |
| `USE_MEMORY_STORE` | `true` = in-memory backend; dashboard shows no persisted data |
| `API_HOST` / `API_PORT` | FastAPI bind (default `0.0.0.0:8000`) |
| `DEFAULT_STATION_RADIUS_METERS` | Default geofence radius |

Never commit real secrets; `.env` is local.

### Web (`apps/web`)

- No Supabase keys in the browser.
- Vite dev server proxies `/api` → `http://localhost:8000` (see `apps/web/vite.config.ts`).

## Code map

| Area | Files |
|------|-------|
| FastAPI entry | `apps/api/app/main.py` |
| Config | `apps/api/app/config.py` |
| Supabase repository | `apps/api/app/repositories/supabase_backend.py` |
| In-memory repository | `apps/api/app/repositories/memory_backend.py` |
| Geofence engine | `apps/api/app/services/geofence_engine.py` |
| Ingest service | `apps/api/app/services/ingest_service.py` |
| Analytics services | `apps/api/app/services/analytics_service.py`, `entity_analytics_service.py` |
| API routes | `apps/api/app/api/v1/routes/` (`analytics.py`, ingest, health, geofence_config) |
| Migrations | `apps/api/migrations/*.sql` |
| Web API client | `apps/web/src/api/client.ts` — all fetches to `/api/...` |
| React Query hooks | `apps/web/src/api/hooks.ts` |
| Response types | `apps/web/src/api/types.ts`, `entityAnalyticsTypes.ts` |

**Core tables (geofencing analytics):** `location_pings`, `geo_events`, `presence_sessions`, `user_geo_state`, `entities`, `geo_users` — see migrations and `docs/geofencing-analytics-platform-spec.md` for authoritative schema and processing rules.

## Data-critical reminders

1. **`user_geo_state` is live state**, not a log — corrupt it once and every subsequent event for that user is wrong.
2. **Idempotency is sacred** — duplicate `client_ping_id` must never cause a second state transition.
3. **`source_ping_id` must always be set** on every `geo_event` row.
4. **Forced amenity EXIT on station EXIT** — non-negotiable; skipping leaves ghost amenity sessions open.
5. **Geofence engine** in `geofence_engine.py` must match Section 6.4 of the spec exactly.

## Quick MCP checklist before merging DB-related PRs

- [ ] `list_tables` verbose — columns match code expectations in `supabase_backend.py`.
- [ ] `get_advisors` security + performance — address WARN; track INFO.
- [ ] Migration file added under `apps/api/migrations/` with descriptive timestamp prefix.
- [ ] Backend tests pass with both memory and (when available) Supabase backends.
