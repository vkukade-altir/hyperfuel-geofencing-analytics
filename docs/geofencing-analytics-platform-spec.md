# Hyperfuel Geofencing Analytics Platform — Technical Specification

**Version:** 1.2  
**Status:** Approved design (v1) — ingest + analytics dashboard implemented  
**Audience:** HF mobile engineers, backend engineers, analytics/web engineers  
**Last updated:** 2026-06-30

This document is the **source of truth** for the Hyperfuel geofencing analytics platform: a Python FastAPI + Supabase backend that receives location pings and optional OS geofence events from the HF mobile app, stores station/amenity geometry, computes ENTER/EXIT events server-side, and exposes data via the Visit Analytics web dashboard (`apps/web`).

---

## Table of contents

1. [Executive summary](#1-executive-summary)
2. [Goals and non-goals (v1)](#2-goals-and-non-goals-v1)
3. [Architecture overview](#3-architecture-overview)
4. [HF mobile app integration guide](#4-hf-mobile-app-integration-guide)
5. [API reference](#5-api-reference)
6. [Entry/exit calculation logic](#6-entryexit-calculation-logic)
7. [Supabase database schema](#7-supabase-database-schema)
8. [Web app and analytics APIs](#8-web-app-and-analytics-apis)
9. [Operational notes (local dev)](#9-operational-notes-local-dev)
10. [Glossary](#10-glossary)
11. [Backend codebase structure](#11-backend-codebase-structure-implementation-guide)

---

## 1. Executive summary

### 1.1 Problem

Hyperfuel leadership needs analytics on **which stations and amenities users visit** and **how long they stay**, to decide where to place offers before rolling out tap-and-pay via the Hyperfuel wallet. Field-testing geofencing end-to-end with thousands of dev users is impractical. We need a **dev-first observability and analytics backend** that:

- Receives location data from the HF app without requiring the production HF geofencing backend to be ready.
- Performs **server-side geofence math** so amenity ENTER/EXIT is consistent across iOS and Android.
- Stores every ping and every derived event for analytics and debugging.
- May later be promoted to production if the design proves sound.

### 1.2 Solution (v1)

A **single ingest API** that accepts:

1. **Entities** — stations and amenities (HF app is source of truth for geometry sync).
2. **Location pings** — periodic GPS fixes while user activity warrants tracking.
3. **Optional events** — OS-level station ENTER/EXIT from `react-native-geofencing` SDK (stored for observability; not required for server logic).

The server:

- Upserts entities into a unified `entities` table.
- On **each ping**, computes which stations/amenities contain the point.
- Compares to **last known inside-set per `user_id`** (set difference).
- Writes **ENTER/EXIT** events only when inside-status changes.
- Returns **geofence config** (station circles) for the app to register OS geofences.

**No login/signup** on this backend in v1. Identity is a client-supplied stable `user_id` (HF account ID when logged in, or persistent anonymous ID).

**No debounce, hysteresis, or consecutive-reading optimizations** in v1. One ping → one geometry check → events only on state change.

### 1.3 Key decisions (finalized)

| Topic | Decision |
|-------|----------|
| Station default geofence radius | **70 meters** |
| Entity storage | **Single `entities` table**; amenities have `parent_id` → station |
| Source of truth for station/amenity data | **HF mobile app** sends entities on ingest; server upserts |
| State key for ENTER/EXIT logic | **`user_id`** (not `device_id`) |
| Primary logic driver | **Pings** — set diff on every ping |
| App OS geofence events | **Optional** — stored but server validates via pings |
| Auth (v1) | **None** — trust `user_id` from client; optional `device_id` for debug |
| Deployment (v1) | **localhost** on same machine as HF app dev build |
| Web dashboard | **Implemented** — `apps/web` Visit Analytics SPA; read APIs in Section 8 |

### 1.4 Related systems

| System | Role |
|--------|------|
| **hf-mobile** | Sends entities, pings, optional events; registers OS geofences from API response |
| **react-native-geofencing SDK** | OS circular geofences for stations; `onGeofence` ENTER/EXIT; `getCurrentPosition` for polling |
| **HF CORE API** | Production station catalog (app may fetch and forward geometry to this platform) |
| **Supabase** | Postgres database for entities, pings, events, user geo state |
| **FastAPI backend** | Ingest, geofence engine, future analytics APIs |

---

## 2. Goals and non-goals (v1)

### 2.1 Goals

- Store **all location pings** with timestamps and basic GPS metadata.
- Derive **station and amenity ENTER/EXIT** from pings using simple inside/outside set comparison per `user_id`.
- Accept **station + amenity definitions** from the app and persist in one `entities` table.
- Return **geofence registration payload** (`identifier`, lat, lon, radius) for `addGeofences()`.
- Support **optional OS geofence events** from the device for observability and comparison.
- Enable **dwell time** analytics via pairing ENTER/EXIT into sessions (derived from events).
- Run on **localhost** for dev; HF app points to `http://localhost:<port>`.

### 2.2 Non-goals (v1)

- User login, signup, or JWT validation on this backend.
- Debounce (N consecutive inside readings), entry/exit buffer meters, accuracy gating.
- Server-side rejection/validation status on device events (store raw events only).
- Redis, PostGIS requirement (simple haversine distance for circles is sufficient v1).
- Polygon amenities (optional column exists; v1 may use circles only).
- Production deployment, RLS policies, data retention automation.
- Admin auth on analytics APIs (dashboard is internal-only, no login yet — Section 8.7).
- Replacing HF CORE API as catalog source long-term (app forwards data for now).

---

## 3. Architecture overview

### 3.1 Data flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         HF Mobile App (hf-mobile)                        │
├─────────────────────────────────────────────────────────────────────────┤
│  1. Fetch stations + amenities from HF CORE API (or local cache)       │
│  2. POST /api/v1/ingest  →  entities + pings + optional events           │
│  3. Receive geofence_config in response → BackgroundGeolocation          │
│     .addGeofences(stations with 70m radius)                              │
│  4. OS onGeofence (station ENTER/EXIT) → optional events in next ingest  │
│  5. While inside station: poll getCurrentPosition() every ~30s → pings   │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP (localhost)
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    FastAPI Geofencing Analytics Backend                  │
├─────────────────────────────────────────────────────────────────────────┤
│  Ingest handler:                                                         │
│    a. Upsert entities                                                    │
│    b. Store optional raw device events                                   │
│    c. For each ping: geofence engine (set diff per user_id)              │
│    d. Write geo_events + update user_geo_state                           │
│  Response: geofence_config for all active stations                       │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         Supabase (Postgres)                              │
│  entities | location_pings | geo_events | user_geo_state                 │
│  geofence_events_raw (optional device events)                            │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 Hybrid device + server model

| Layer | Station | Amenity |
|-------|---------|---------|
| **Device (OS)** | Circular geofence via SDK `addGeofences()` — battery-efficient ENTER/EXIT in background/killed state | **Not** registered as OS geofence |
| **Device (polling)** | Optional: 30s `getCurrentPosition` while "inside" per OS | **30s polling** while inside station |
| **Server** | Set diff on every ping → ENTER/EXIT | Set diff on every ping for amenities under inside stations |
| **Optional device events** | `onGeofence` ENTER/EXIT stored in `geofence_events_raw` | N/A |

The server **does not depend** on device events to compute EXIT. Pings alone drive state via set difference.

### 3.3 Identity model (v1)

- **`user_id`** (required on every request): HF `profile.userId` when logged in; otherwise a **stable anonymous ID** persisted in app storage (e.g. AsyncStorage key `geofence_user_id`).
- **`device_id`** (optional): for debugging which physical device sent a ping; **not** used for ENTER/EXIT state in v1.
- **Consistency rule:** All geofence code paths in the app must use the **same** `user_id`. Do not mix anonymous ID on one screen and real user ID on another.

### 3.4 Technology stack

| Component | Choice |
|-----------|--------|
| API framework | Python 3.11+ FastAPI |
| Database | Supabase (hosted Postgres) |
| DB access | supabase-py (service role key) |
| Reference architecture | operative-ai-main monorepo patterns (routes → services → repositories) |
| Local API URL | `http://localhost:8000` (default; configurable) |

---

## 4. HF mobile app integration guide

This section is for **HF mobile developers** integrating the geofencing analytics backend into `hf-mobile`.

### 4.1 Prerequisites

- HF app runs on a dev machine with the FastAPI backend running locally.
- Supabase project configured; backend has `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
- `react-native-geofencing` SDK integrated (already in hf-mobile via local fork).
- Location permissions: **Always** (iOS) / background location (Android) for reliable station geofencing.

### 4.2 Base URL configuration

**v1 deployment:** Backend runs on the **same machine** as the Metro bundler / simulator or connected device.

| Environment | Base URL | Notes |
|-------------|----------|-------|
| iOS Simulator | `http://localhost:8000` | Works directly |
| Android Emulator | `http://10.0.2.2:8000` | Emulator maps host localhost |
| Physical device (USB) | `http://<your-lan-ip>:8000` | Same Wi‑Fi as dev machine |
| Physical device | Not `localhost` on device | Device localhost is the phone itself |

Add to HF app config (e.g. env or constants):

```typescript
// Android emulator in dev maps host machine localhost to 10.0.2.2
export const GEOFENCE_ANALYTICS_BASE_URL =
  Platform.OS === 'android' && __DEV__
    ? 'http://10.0.2.2:8000' // Android emulator in dev
    : 'http://localhost:8000'; // iOS simulator, or configure for production

// Physical Android device on same Wi‑Fi: use your machine's LAN IP instead, e.g.:
// 'http://192.168.1.42:8000'
```

**Path prefix:** Versioned APIs are under `/api/v1`. Health check is intentionally unversioned at `/api/health` (see Section 5.2).

### 4.3 Integration checklist

#### Phase A — Bootstrap (app launch or Stations screen mount)

1. **Resolve `user_id`**
   - If `profile?.userId` from HF account → use it.
   - Else read/create stable anonymous ID in AsyncStorage (`geofence_user_id`).
   - Store in a single module; all geofence services import from here.

2. **Collect entities to send**
   - From HF CORE API station list/details, build entity payloads for every station the app knows about.
   - For each station, include all amenities with coordinates and radii (when available from HF API or seeded dev data).
   - Station `radius_meters`: use HF value if present, else default **70**.
   - Amenity `parent_id`: station's `id`.

3. **First ingest call (entities only or with empty pings)**
   - `POST /api/v1/ingest` with `user_id`, `entities`, empty `pings` array.
   - Parse response `data.geofence_config`.
   - Call SDK:
     ```typescript
     await BackgroundGeolocation.ready({ geofenceInitialTriggerEntry: true, geofenceProximityRadius: 1000, enableHeadless: true });
     await BackgroundGeolocation.addGeofences(geofence_config.map(s => ({
       identifier: s.identifier,
       latitude: s.latitude,
       longitude: s.longitude,
       radius: s.radius,
       notifyOnEntry: true,
       notifyOnExit: true,
     })));
     await BackgroundGeolocation.start();
     await BackgroundGeolocation.replayPendingGeofenceEvents();
     ```

4. **Register listeners before `AppRegistry`** (per SDK docs) in `index.js`:
   - `onGeofence` → queue optional station events for next ingest.
   - Android: `registerHeadlessTask` for killed-state geofence delivery.

#### Phase B — Ongoing operation

5. **On OS station ENTER (`onGeofence`, action `ENTER`)**
   - Mark local state: `insideStationIds.add(identifier)`.
   - Start **30-second polling timer** (`setInterval` or scheduled task).
   - Queue optional event: `{ entity_type: 'station', entity_id, action: 'ENTER', ... }`.
   - Optionally switch SDK to continuous tracking config on iOS (`CONFIG_CONTINUOUS_TRACKING`).

6. **On OS station EXIT (`onGeofence`, action `EXIT`)**
   - Remove station from `insideStationIds`.
   - Stop 30-second polling timer if no stations remain inside.
   - Queue optional event: `{ action: 'EXIT', ... }`.
   - Revert to battery-efficient SDK config on iOS.

7. **Every 30 seconds while inside at least one station**
   - `const fix = await BackgroundGeolocation.getCurrentPosition({ samples: 1, timeout: 30 });`
   - Build ping object with `client_ping_id: fix.uuid`, coords, `recorded_at: fix.timestamp`.
   - Add to local outbound queue.

8. **Batch upload (every 30–60s or when queue ≥ N items)**
   - `POST /api/v1/ingest` with:
     - `user_id`
     - `entities` (re-send on station list refresh, or only when changed — see 4.5)
     - `pings` (batch)
     - `events` (optional, from OS geofence queue)
     - `device_id` (optional)
   - On success: clear sent items from queue; update local geofence config if response differs.

9. **On failure**
   - Retain queue in AsyncStorage/MMKV.
   - Retry with backoff.
   - Use `client_ping_id` / `client_event_id` for idempotency (server ignores duplicates).

#### Phase C — Lifecycle

10. **App foreground resume**
    - `replayPendingGeofenceEvents()`.
    - Flush pending event queue via ingest.

11. **User login/logout**
    - On login: switch to `profile.userId`; **new user = new server state** (correct).
    - On logout: either stop geofencing or switch to new anonymous `user_id` (do not reuse previous user's ID).

12. **Consolidate geofence services**
    - hf-mobile currently has `locationService.ts` and `geofencePocLocationService.ts` both listening to `onGeofence`. **Merge into one service** before production integration to avoid duplicate events.

### 4.4 What to send on each payload type

#### Entities (stations + amenities)

Send whenever station catalog changes or on first launch. Minimum fields documented in Section 5.

#### Pings

Send every ~30s while user is inside a station (per OS geofence or local inside-set). Include:

- GPS coordinates and accuracy.
- `client_ping_id` from SDK `location.uuid` (unique per fix).
- `recorded_at` from device timestamp.

Optional context (recommended for observability, not required v1):

- `app_state`: `foreground` | `background`
- `delivery_mode`: `foreground` | `background` | `headless` | `replay`
- `battery_level`, `location_permission`, etc.

#### Optional events (OS geofence)

When `onGeofence` fires:

```json
{
  "entity_type": "station",
  "entity_id": "<geofence identifier>",
  "action": "ENTER" | "EXIT",
  "recorded_at": "<ISO8601>",
  "latitude": ...,
  "longitude": ...,
  "accuracy": ...,
  "client_event_id": "<sdk geofence event id or generated uuid>",
  "delivery_mode": "headless" | "foreground" | "replay",
  "was_terminated": false
}
```

Server stores these in `geofence_events_raw`. **ENTER/EXIT for analytics still come from ping set-diff** unless you later choose to trust device events.

### 4.5 Entity sync strategy

| Strategy | When to use |
|----------|-------------|
| **Full sync every ingest** | Simplest v1; small station count in dev |
| **Sync on app launch + pull-to-refresh** | Reduce payload size |
| **Sync when CORE API station list version changes** | Production-oriented |

Re-sending entities is safe: server upserts by `id`.

### 4.6 Platform-specific notes

#### iOS

- `onGeofence` works foreground, background, and often after kill (with Always permission).
- Use `onHeartbeat` + `getCurrentPosition` as alternative poll trigger when stationary inside station.
- `onLocation` available when moving inside station.

#### Android

- `onGeofence` works foreground, background, headless (killed app with `enableHeadless: true`).
- No continuous `onLocation`/`onHeartbeat` in current SDK build — **rely on 30s `getCurrentPosition` timer** while inside station.
- Emulator: use `10.0.2.2` for localhost.
- Register headless task in `index.js` before `AppRegistry.registerComponent`.

### 4.7 Recommended polling and geofence parameters

| Parameter | Value | Reason |
|-----------|-------|--------|
| Station OS geofence radius (server default) | **70 m** | Balance OS reliability vs precision |
| Poll interval inside station | **30 s** | Amenity tracking; matches product discussion |
| `geofenceProximityRadius` | 1000 m | SDK monitors nearest fences within 1 km |
| `geofenceInitialTriggerEntry` | true | Fire ENTER if already inside on register |
| Ingest batch interval | 30–60 s | Align with poll rate |

### 4.8 Error handling (app side)

| HTTP status | App behavior |
|-------------|--------------|
| 200 | Clear queue; apply `geofence_config` if changed |
| 400 | Log validation errors; fix payload |
| 5xx / network | Retain queue; retry |
| Timeout (15s suggested) | Retain queue; retry |

### 4.9 Testing locally

1. Start FastAPI: `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
2. Start HF app on simulator/emulator/device with correct base URL.
3. Walk/drive near a seeded station or use Xcode/Android location simulation.
4. Verify in Supabase: `location_pings`, `geo_events`, `user_geo_state` rows appear.
5. Use future analytics APIs or SQL to confirm ENTER/EXIT sequence.

### 4.10 Migration from current hf-mobile POC

| Current POC | New integration |
|-------------|-----------------|
| `BACKEND_BASE_URL` Cloudflare Java tunnel | `GEOFENCE_ANALYTICS_BASE_URL` localhost |
| `POST /api/location-events` `{ userId, lat, lng, eventType }` | `POST /api/v1/ingest` full payload |
| Hardcoded `STATIONS` in constants | Entities from CORE API + ingest response `geofence_config` |
| Anonymous `user_id` only on Stations tab | Unified `user_id` everywhere |
| No amenity tracking | Pings every 30s inside station; server computes amenity events |
| Dual geofence listeners | Single consolidated service |

---

## 5. API reference

### 5.1 Conventions

| Convention | Value |
|------------|-------|
| Base URL (local dev) | `http://localhost:8000` (see Section 4.2 for emulator/device) |
| API prefix | `/api/v1` |
| Content-Type | `application/json` |
| Auth (v1) | **None** — no Bearer token required |
| Response envelope | Uniform wrapper (operative-ai style) |

#### Standard response envelope

**Success:**

```json
{
  "success": true,
  "message": "Ingest processed successfully",
  "data": { ... },
  "error": null
}
```

**Error:**

```json
{
  "success": false,
  "message": "Validation failed",
  "data": null,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": "user_id is required"
  }
}
```

#### HTTP status codes

Follow **FastAPI defaults** (operative-ai pattern with global exception handlers):

| Code | Meaning |
|------|---------|
| 200 | Success (including partial idempotent replay) |
| 400 | Bad request (e.g. malformed JSON, custom `AppException` with status 400) |
| 422 | **Pydantic / request validation errors** (FastAPI default for invalid body shape or types) |
| 500 | Unhandled server error |

Do not override FastAPI's 422 for Pydantic validation unless you intentionally customize `register_exception_handlers`.

---

### 5.2 `GET /api/health`

Lightweight health check for app connectivity testing (replaces Java `/actuator/health` in POC).

**Path note:** This endpoint is **`/api/health`** (no `/v1` prefix). Versioned ingest and config APIs live under `/api/v1/...`. Unversioned health checks are intentional — load balancers and mobile reachability probes typically expect a stable path.

**Request:** No body. No query params.

**Response `data`:**

```json
{
  "status": "ok",
  "version": "1.0.0",
  "timestamp": "2026-06-24T12:00:00Z"
}
```

**HF app usage:** Call on Stations/Geofence screen mount to show backend reachability (same pattern as `checkBackendHealth()` in current `locationService.ts`).

---

### 5.3 `POST /api/v1/ingest` (primary endpoint)

**Single endpoint** for entity sync, location pings, and optional device geofence events. This is the **only write API** required for v1 mobile integration.

#### 5.3.1 Request headers

| Header | Required | Description |
|--------|----------|-------------|
| `Content-Type` | Yes | `application/json` |
| `X-Device-Id` | No | Optional physical device identifier for debugging. Not used for state logic. |

#### 5.3.2 Request body — top level

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `user_id` | string | **Yes** | Stable identifier for the person. HF `profile.userId` when logged in; otherwise persistent anonymous ID from app storage. **All ENTER/EXIT state is keyed on this field.** Recommended max length: 128 characters. |
| `device_id` | string | No | Optional device identifier (e.g. `DeviceInfo.getUniqueId()`). Stored on pings/events for observability only. |
| `entities` | array | No | List of station and amenity definitions to upsert. May be empty if only sending pings. Should be sent on launch and when catalog changes. |
| `pings` | array | No | List of location pings to store and process. May be empty if only syncing entities. |
| `events` | array | No | Optional OS geofence events from device. Stored in `geofence_events_raw`. Server **still** runs ping-based set-diff for canonical `geo_events`. |

**Processing order (server):**

1. Validate payload.
2. Upsert all `entities` — **stations first, then amenities** (two-pass or sort by `entity_type`). See Section 5.3.3.
3. Store all optional `events` in `geofence_events_raw`.
4. For each ping (sorted by `recorded_at`): save ping → run geofence engine → write `geo_events` + `presence_sessions` → update `user_geo_state`.
5. Build `geofence_config` from all active stations in DB.
6. Return response.

**Idempotency:**

- Pings: unique on `(user_id, client_ping_id)` — duplicate uploads are ignored (no double state transition).
- Events: unique on `(user_id, client_event_id)` — duplicates ignored.
- Entities: upsert by `id` — safe to re-send.

---

#### 5.3.3 `entities[]` — entity object

Unified model for stations and amenities. One row per entity in DB.

| Property | Type | Required | Applies to | Description |
|----------|------|----------|------------|-------------|
| `id` | string | **Yes** | Both | Primary key. Use HF `stationId` for stations; stable amenity ID for amenities (HF service ID or generated). Must be unique across all entities. |
| `entity_type` | string | **Yes** | Both | `"station"` or `"amenity"`. Enum enforced server-side. |
| `name` | string | **Yes** | Both | Human-readable name for analytics and debug UI. |
| `latitude` | number | **Yes** | Both | WGS84 decimal degrees. Center of circle or centroid for polygon. |
| `longitude` | number | **Yes** | Both | WGS84 decimal degrees. |
| `parent_id` | string | Conditional | Amenity: **required**. Station: must be `null` or omitted. | For amenities, the `id` of the parent station. Server uses this to query "all amenities of station X". |
| `radius_meters` | number | Conditional | Required for `geometry_type: circle` | Radius in meters. **Stations default to 70** if omitted on upsert. Amenities must provide explicit radius (typically smaller, e.g. 10–30m). |
| `geometry_type` | string | No | Both | `"circle"` (default) or `"polygon"`. v1 implementation may support circle only; polygon field reserved. |
| `polygon` | array | Conditional | Polygon only | GeoJSON-style array of `[longitude, latitude]` pairs, closed ring. Optional v1. |
| `amenity_type` | string | No | Amenity | HF lookup code e.g. `CSTORE`, `RESTAURANT` for analytics grouping. |
| `is_active` | boolean | No | Both | Default `true`. Soft-disable without deleting history. |
| `metadata` | object | No | Both | Arbitrary JSON (HF external IDs, brand, offers flags). Not used in geofence math. |

**Station example:**

```json
{
  "id": "STATION_001",
  "entity_type": "station",
  "name": "HITEC City EV Station",
  "latitude": 17.4474,
  "longitude": 78.381,
  "radius_meters": 70,
  "geometry_type": "circle",
  "parent_id": null,
  "metadata": { "hf_station_id": "STATION_001", "source": "core_api" }
}
```

**Amenity example:**

```json
{
  "id": "amenity_cafe_001",
  "entity_type": "amenity",
  "name": "Station Cafe",
  "latitude": 17.4480,
  "longitude": 78.3815,
  "radius_meters": 20,
  "geometry_type": "circle",
  "parent_id": "STATION_001",
  "amenity_type": "RESTAURANT",
  "metadata": { "service_id": "svc_123" }
}
```

**Validation rules:**

- `entity_type: station` → `parent_id` must be null.
- `entity_type: amenity` → `parent_id` must reference an existing or same-payload station `id`.
- `radius_meters` for stations: if missing, server sets **70**.
- `latitude` ∈ [-90, 90], `longitude` ∈ [-180, 180].
- `radius_meters` ≥ 1 for circles.

**Upsert ordering (implementation requirement):**

The `entities` table has `parent_id REFERENCES entities(id)`. If amenities appear before their parent station in the request array, a single-pass upsert can fail FK checks.

**Implementation must:**

1. Upsert all `entity_type = 'station'` rows first, then all `entity_type = 'amenity'` rows, **or**
2. Sort the payload (stations before amenities) before upsert, **or**
3. Use a two-pass upsert in `entity_service.upsert_all()`.

The app may send stations and amenities in any order; the server is responsible for correct ordering.

---

#### 5.3.4 `pings[]` — location ping object

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `client_ping_id` | string | **Yes** | Unique per GPS fix. Use SDK `location.uuid`. Used for idempotency: `(user_id, client_ping_id)`. |
| `recorded_at` | string | **Yes** | ISO-8601 timestamp when fix was captured on device (e.g. `2026-06-24T10:01:30.000Z`). Server processes pings in batch order sorted by this field. |
| `latitude` | number | **Yes** | WGS84 latitude of ping. |
| `longitude` | number | **Yes** | WGS84 longitude of ping. |
| `accuracy` | number | No | Horizontal accuracy in meters from GPS. Stored for analytics; **not used to filter v1**. |
| `altitude` | number | No | Meters above sea level if available. |
| `speed` | number | No | Speed in m/s if available. |
| `heading` | number | No | Bearing in degrees if available. |
| `is_moving` | boolean | No | From SDK `location.is_moving`. |
| `ping_reason` | string | No | Enum: `STATION_POLL` (default for 30s timer), `HEARTBEAT`, `GEOFENCE_EVENT`, `MANUAL`, `APP_LAUNCH`. Observability only in v1. |
| `context` | object | No | Optional device/SDK context (see below). |

**`context` object (optional, all fields optional):**

| Property | Type | Description |
|----------|------|-------------|
| `app_state` | string | `foreground`, `background`, `inactive` |
| `delivery_mode` | string | `foreground`, `background`, `headless`, `replay` |
| `battery_level` | integer | 0–100 |
| `battery_charging` | boolean | |
| `location_permission` | string | e.g. `always`, `when_in_use`, `denied` |
| `location_services_enabled` | boolean | Device GPS master toggle |
| `network_type` | string | `wifi`, `cellular`, `none` |
| `sdk_tracking_enabled` | boolean | From `getState().enabled` |
| `inside_station_ids` | array of string | Station IDs the app believes user is inside (from local OS geofence state). Observability; server recomputes from coordinates. |
| `extras` | object | Arbitrary client metadata |

**Ping example:**

```json
{
  "client_ping_id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "recorded_at": "2026-06-24T10:01:30.000Z",
  "latitude": 17.4475,
  "longitude": 78.3812,
  "accuracy": 12.5,
  "is_moving": false,
  "ping_reason": "STATION_POLL",
  "context": {
    "app_state": "background",
    "delivery_mode": "foreground",
    "battery_level": 78,
    "inside_station_ids": ["STATION_001"]
  }
}
```

---

#### 5.3.5 `events[]` — optional device geofence event

Events from OS `onGeofence` (and Android headless). **Optional.** Server stores but canonical analytics events come from ping set-diff.

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `client_event_id` | string | **Yes** | Unique per device event. SDK `geofenceEvent.id` or generated UUID. Idempotency key with `user_id`. |
| `entity_type` | string | **Yes** | v1: only `"station"` (OS geofences are station-level). |
| `entity_id` | string | **Yes** | Geofence `identifier` / station `id`. |
| `action` | string | **Yes** | `"ENTER"` or `"EXIT"`. |
| `recorded_at` | string | **Yes** | ISO-8601 when OS fired the event. |
| `latitude` | number | No | Location attached to geofence transition. |
| `longitude` | number | No | |
| `accuracy` | number | No | Horizontal accuracy in meters. |
| `delivery_mode` | string | No | `foreground`, `background`, `headless`, `replay` |
| `was_terminated` | boolean | No | `true` if app was not in foreground when event was captured. |
| `coordinates_adjusted` | boolean | No | iOS boundary snap normalization applied on device. |
| `extras` | object | No | Arbitrary metadata |

**Event example:**

```json
{
  "client_event_id": "native-geofence-id-xyz",
  "entity_type": "station",
  "entity_id": "STATION_001",
  "action": "ENTER",
  "recorded_at": "2026-06-24T10:00:55.000Z",
  "latitude": 17.4474,
  "longitude": 78.3810,
  "accuracy": 15.0,
  "delivery_mode": "headless",
  "was_terminated": true
}
```

---

#### 5.3.6 Response `data` object

| Property | Type | Description |
|----------|------|-------------|
| `geofence_config` | array | Station circles for `addGeofences()`. All active stations in DB after upsert. |
| `ingest_summary` | object | Counts for debugging (see below). |

**`geofence_config[]` item:**

| Property | Type | Description |
|----------|------|-------------|
| `identifier` | string | Same as station `id` — passed to SDK `addGeofence.identifier` |
| `latitude` | number | Station center latitude |
| `longitude` | number | Station center longitude |
| `radius` | number | Radius in meters (70 default) |

**`ingest_summary`:**

| Property | Type | Description |
|----------|------|-------------|
| `entities_upserted` | integer | Count of entities written |
| `pings_received` | integer | Count in request |
| `pings_stored` | integer | New pings (excludes idempotent duplicates) |
| `pings_duplicate` | integer | Skipped duplicates |
| `events_received` | integer | Optional events in request |
| `events_stored` | integer | New raw events stored |
| `geo_events_created` | object | `{ "station_enter": n, "station_exit": n, "amenity_enter": n, "amenity_exit": n }` |

**Full response example:**

```json
{
  "success": true,
  "message": "Ingest processed successfully",
  "data": {
    "geofence_config": [
      {
        "identifier": "STATION_001",
        "latitude": 17.4474,
        "longitude": 78.381,
        "radius": 70
      }
    ],
    "ingest_summary": {
      "entities_upserted": 4,
      "pings_received": 2,
      "pings_stored": 2,
      "pings_duplicate": 0,
      "events_received": 1,
      "events_stored": 1,
      "geo_events_created": {
        "station_enter": 1,
        "station_exit": 0,
        "amenity_enter": 1,
        "amenity_exit": 0
      }
    }
  },
  "error": null
}
```

---

#### 5.3.7 Full request example

```json
{
  "user_id": "hf_user_8827361",
  "device_id": "ios-simulator-abc",
  "entities": [
    {
      "id": "STATION_001",
      "entity_type": "station",
      "name": "HITEC City EV Station",
      "latitude": 17.4474,
      "longitude": 78.381,
      "radius_meters": 70
    },
    {
      "id": "amenity_cafe",
      "entity_type": "amenity",
      "name": "Station Cafe",
      "latitude": 17.4480,
      "longitude": 78.3815,
      "radius_meters": 20,
      "parent_id": "STATION_001",
      "amenity_type": "RESTAURANT"
    },
    {
      "id": "amenity_restroom",
      "entity_type": "amenity",
      "name": "Restroom",
      "latitude": 17.4470,
      "longitude": 78.3808,
      "radius_meters": 15,
      "parent_id": "STATION_001",
      "amenity_type": "RESTROOM"
    },
    {
      "id": "amenity_store",
      "entity_type": "amenity",
      "name": "Convenience Store",
      "latitude": 17.4478,
      "longitude": 78.3818,
      "radius_meters": 25,
      "parent_id": "STATION_001",
      "amenity_type": "CSTORE"
    }
  ],
  "pings": [
    {
      "client_ping_id": "ping-uuid-001",
      "recorded_at": "2026-06-24T10:01:00.000Z",
      "latitude": 17.4475,
      "longitude": 78.3812,
      "accuracy": 10.0,
      "ping_reason": "STATION_POLL"
    }
  ],
  "events": [
    {
      "client_event_id": "os-event-001",
      "entity_type": "station",
      "entity_id": "STATION_001",
      "action": "ENTER",
      "recorded_at": "2026-06-24T10:00:55.000Z",
      "latitude": 17.4474,
      "longitude": 78.3810,
      "delivery_mode": "foreground"
    }
  ]
}
```

---

### 5.4 `GET /api/v1/geofence-config` (optional convenience)

Returns station geofence circles **without** sending entities or pings. Useful if app only needs to refresh OS fences.

**Query params:** None in v1.

**Response `data`:** Same `geofence_config` array as ingest response.

**Note:** If no stations in DB yet, returns empty array. App should prefer first ingest with entities to populate DB.

---

### 5.5 API summary table (v1)

| Method | Path | Purpose | Caller |
|--------|------|---------|--------|
| GET | `/api/health` | Health check | HF app |
| POST | `/api/v1/ingest` | Entities + pings + optional events | HF app |
| GET | `/api/v1/geofence-config` | Read station circles only | HF app (optional) |

---

## 6. Entry/exit calculation logic

This section explains **exactly** how the server decides ENTER vs EXIT from location pings alone. Read this before implementing `geofence_engine.py` or debugging analytics data.

### 6.1 Core concept: set difference, not magic

The server does **not** look for a special "EXIT signal" in GPS data. Every ping answers one question:

> **Which station and amenity IDs contain this point right now?**

That answer is a **set of IDs** (possibly empty). The server compares:

```
CURRENT_INSIDE  =  IDs inside right now (from this ping's lat/lng)
LAST_INSIDE     =  IDs saved from the previous ping for this user_id
```

Then:

```
ENTER  =  CURRENT_INSIDE − LAST_INSIDE     (in CURRENT but not in LAST)
EXIT   =  LAST_INSIDE − CURRENT_INSIDE     (in LAST but not in CURRENT)
NO EVENT =  CURRENT_INSIDE = LAST_INSIDE    (no change)
```

**"User is outside all geofences"** means `CURRENT_INSIDE` is the **empty set** `{}`. If the user was inside Station A before, that produces **EXIT Station A** — not a separate "global outside" event.

After processing, the server saves:

```
LAST_INSIDE = CURRENT_INSIDE
```

for the next ping.

### 6.2 Geometry: how "inside" is determined (v1)

#### Stations and circle amenities

For `geometry_type: circle`:

```
distance_meters = haversine(ping_lat, ping_lng, entity_lat, entity_lon)
inside = distance_meters <= radius_meters
```

- Station default `radius_meters`: **70**
- Amenity radius: from entity payload (typically 10–30m)

**v1 does not apply:**

- Accuracy filtering (ignore bad GPS)
- Entry buffer / exit buffer / hysteresis
- Debounce (N consecutive readings)

A single ping inside the radius counts as inside. A single ping outside counts as outside.

#### Polygon amenities (future)

For `geometry_type: polygon`, use point-in-polygon test. Optional in v1; schema supports it.

### 6.3 State storage: `user_geo_state` table

One row per `user_id`:

| Field | Type | Meaning |
|-------|------|---------|
| `inside_station_ids` | JSON array of strings | Stations user is currently inside per server state |
| `inside_amenity_ids` | JSON array of strings | Amenities user is currently inside per server state |
| `updated_at` | timestamp | Last ping processed |

**Initial state** (new user): both arrays empty `[]`.

**Important:** State is keyed on **`user_id`**, not `device_id`. Same user on two phones shares one state row (see Section 3.3 for multi-device caveat).

### 6.4 Processing algorithm (pseudocode)

For each ping (sorted by `recorded_at`):

```
1. INSERT location_pings row (skip if duplicate client_ping_id)
   → capture ping_row.id as source_ping_id for geo_events in this iteration
   → if duplicate: skip steps 2–5 for this ping (no state change)

2. Load user_geo_state for user_id (or create empty)

3. STATION PHASE
   3a. Load all entities WHERE entity_type = 'station' AND is_active = true
   3b. currently_inside_stations = { station.id where point inside station circle }
   3c. last_stations = user_geo_state.inside_station_ids

   3d. For each id in (currently_inside_stations - last_stations):
         event = INSERT geo_events (
           action = ENTER,
           entity_type = station,
           entity_id = id,
           station_id = id,              -- for stations: station_id = entity_id
           source_ping_id = ping_row.id,
           occurred_at = ping.recorded_at,
           latitude/longitude/accuracy from ping
         )
         session_service.open_session(
           user_id, entity_type='station', entity_id=id,
           station_id=id, entered_at=ping.recorded_at, enter_event_id=event.id
         )

   3e. For each id in (last_stations - currently_inside_stations):
         event = INSERT geo_events (
           action = EXIT,
           entity_type = station,
           entity_id = id,
           station_id = id,
           source_ping_id = ping_row.id,
           occurred_at = ping.recorded_at,
           latitude/longitude/accuracy from ping
         )
         session_service.close_session(
           user_id, entity_type='station', entity_id=id,
           exited_at=ping.recorded_at, exit_event_id=event.id
         )
         FORCE EXIT all amenities where parent_id = id (see 6.5)

4. AMENITY PHASE (only for stations in currently_inside_stations)
   4a. For each station_id in currently_inside_stations:
         Load amenities WHERE parent_id = station_id AND is_active = true
   4b. currently_inside_amenities = union of amenities inside across those stations
   4c. last_amenities = user_geo_state.inside_amenity_ids (after forced exits from 3e)

   4d. For each amenity_id in (currently_inside_amenities - last_amenities):
         parent_station_id = amenity.parent_id
         event = INSERT geo_events (
           action = ENTER,
           entity_type = amenity,
           entity_id = amenity_id,
           station_id = parent_station_id,  -- for amenities: station_id = parent_id
           source_ping_id = ping_row.id,
           occurred_at = ping.recorded_at,
           latitude/longitude/accuracy from ping
         )
         session_service.open_session(
           user_id, entity_type='amenity', entity_id=amenity_id,
           station_id=parent_station_id, entered_at=ping.recorded_at, enter_event_id=event.id
         )

   4e. For each amenity_id in (last_amenities - currently_inside_amenities):
         parent_station_id = lookup parent_id for amenity_id
         event = INSERT geo_events (
           action = EXIT,
           entity_type = amenity,
           entity_id = amenity_id,
           station_id = parent_station_id,
           source_ping_id = ping_row.id,
           occurred_at = ping.recorded_at,
           latitude/longitude/accuracy from ping
         )
         session_service.close_session(
           user_id, entity_type='amenity', entity_id=amenity_id,
           exited_at=ping.recorded_at, exit_event_id=event.id
         )

5. UPDATE user_geo_state:
     inside_station_ids = currently_inside_stations
     inside_amenity_ids = currently_inside_amenities (after forced exits)
```

**`geo_events.station_id` population rules:**

| `entity_type` | `station_id` value |
|---------------|-------------------|
| `station` | Same as `entity_id` |
| `amenity` | `entities.parent_id` of that amenity |

**`source_ping_id`:** Always set to the `location_pings.id` UUID returned from step 1 for the ping being processed. If step 1 skipped insert (duplicate), do not run steps 2–5.

Optional device `events[]` are stored in `geofence_events_raw` **before or after** ping processing but **do not modify** steps 2–5 in v1.

### 6.5 Forced amenity EXIT on station EXIT

When user EXITS a station (station ID drops from inside set), they cannot remain "inside" an amenity at that station.

**Rule:** On station EXIT for `station_id = S`:

```
For each amenity_id in last_amenities where amenity.parent_id = S:
  If amenity_id still in last_amenities:
    event = INSERT geo_events (
      action = EXIT,
      entity_type = amenity,
      entity_id = amenity_id,
      station_id = S,
      source_ping_id = ping_row.id,
      occurred_at = ping.recorded_at,
      ...
    )
    session_service.close_session(
      user_id, entity_type='amenity', entity_id=amenity_id,
      exited_at=ping.recorded_at, exit_event_id=event.id
    )
    Remove amenity_id from inside_amenity_ids
```

This runs even if the ping would not have evaluated amenities (user already outside station circle).

### 6.6 Dwell time (presence_sessions)

**Created inline during Section 6.4 processing** — not a separate batch job in v1.

| Action | `session_service` behavior |
|--------|---------------------------|
| Station or amenity **ENTER** | `open_session()` — insert `presence_sessions` row with `exited_at = null`, `enter_event_id` set |
| Station or amenity **EXIT** | `close_session()` — find open session for `(user_id, entity_type, entity_id)`, set `exited_at`, `dwell_seconds`, `exit_event_id` |

v1 rule: **one open session per `(user_id, entity_type, entity_id)`**. Do not open a second session if one is already open.

Analytics queries use `presence_sessions` for dwell time, or pair ENTER/EXIT rows in `geo_events`.

---

### 6.7 Example A — One station, no amenities

**Setup:**

| Entity | Type | Center | Radius |
|--------|------|--------|--------|
| STATION_001 | station | (17.4474, 78.381) | 70m |

**User:** `user_id = user_alice`. Initial state: `inside_station_ids = []`.

| # | Time | Ping location | Distance to station | Inside STATION_001? | LAST stations | Events | New LAST |
|---|------|---------------|---------------------|---------------------|---------------|--------|----------|
| 1 | 10:00 | 200m away | >70m | No | `[]` | none | `[]` |
| 2 | 10:00:30 | 200m away | >70m | No | `[]` | none | `[]` |
| 3 | 10:01:00 | 50m away | ≤70m | **Yes** | `[]` | **ENTER STATION_001** | `[STATION_001]` |
| 4 | 10:01:30 | 40m away | ≤70m | Yes | `[STATION_001]` | none | `[STATION_001]` |
| 5 | 10:02:00 | 30m away | ≤70m | Yes | `[STATION_001]` | none | `[STATION_001]` |
| 6 | 10:02:30 | 90m away | >70m | **No** | `[STATION_001]` | **EXIT STATION_001** | `[]` |
| 7 | 10:03:00 | 95m away | >70m | No | `[]` | none | `[]` |

**Ping 6 explained (the "outside all geofences" case):**

- `currently_inside_stations = {}` (empty — point is not inside any station).
- `last_stations = {STATION_001}`.
- `EXIT = last − current = {STATION_001}`.
- User is "outside all geofences" — that **is** EXIT from the station they were in.

**Ping 7:** Still outside everything. `current` and `last` both empty → no event.

---

### 6.8 Example B — One station with three amenities

**Setup:**

| Entity | Type | Parent | Center (approx) | Radius |
|--------|------|--------|-----------------|--------|
| STATION_001 | station | — | (17.4474, 78.381) | 70m |
| amenity_cafe | amenity | STATION_001 | (17.4480, 78.3815) | 20m |
| amenity_restroom | amenity | STATION_001 | (17.4470, 78.3808) | 15m |
| amenity_store | amenity | STATION_001 | (17.4478, 78.3818) | 25m |

User walks: approaches station → walks to cafe → walks to store → leaves station.

Initial: `inside_station_ids = []`, `inside_amenity_ids = []`.

| # | Time | Location (narrative) | Inside station? | Inside amenities | LAST amenities | Station events | Amenity events | LAST after |
|---|------|----------------------|-----------------|------------------|----------------|----------------|----------------|------------|
| 1 | 10:00 | Far away | No | — | `[]` | none | none | stations `[]`, amenities `[]` |
| 2 | 10:01 | Enters station zone | **Yes** | none yet | `[]` | **ENTER STATION_001** | none | stations `[S001]`, amenities `[]` |
| 3 | 10:01:30 | At cafe | Yes | **cafe** | `[]` | none | **ENTER cafe** | stations `[S001]`, amenities `[cafe]` |
| 4 | 10:02 | Still at cafe | Yes | cafe | `[cafe]` | none | none | same |
| 5 | 10:02:30 | Walked to store | Yes | **store** (not cafe) | `[cafe]` | none | **EXIT cafe**, **ENTER store** | stations `[S001]`, amenities `[store]` |
| 6 | 10:03 | At restroom | Yes | **restroom** | `[store]` | none | **EXIT store**, **ENTER restroom** | stations `[S001]`, amenities `[restroom]` |
| 7 | 10:03:30 | Middle of station, not in any amenity | Yes | none | `[restroom]` | none | **EXIT restroom** | stations `[S001]`, amenities `[]` |
| 8 | 10:04 | Leaves station (90m away) | **No** | — | `[]` | **EXIT STATION_001** | none (amenities already empty) | stations `[]`, amenities `[]` |

**Ping 5 detail (switching amenities):**

- User still inside STATION_001 → amenity phase runs.
- `currently_inside_amenities = {store}`.
- `last_amenities = {cafe}`.
- ENTER store, EXIT cafe — two events on one ping.

**Ping 8 detail (station EXIT with no amenity forced exit needed):**

- User already not in any amenity at ping 7.
- Station EXIT only.

**Ping 8 alternate (if user still inside restroom when leaving station):**

If ping 8 location is outside station but `last_amenities = [restroom]`:

1. Station phase: EXIT STATION_001.
2. **Forced EXIT:** restroom (parent STATION_001) → EXIT restroom event.
3. `inside_amenity_ids` cleared.

---

### 6.9 Example C — Switching between two stations

**Setup:**

| Entity | Center | Radius |
|--------|--------|--------|
| STATION_A | (17.44, 78.38) | 70m |
| STATION_B | (17.45, 78.39) | 70m |

Stations are far enough apart that a single point cannot be inside both.

| # | Narrative | Inside stations | LAST | Events |
|---|-----------|-----------------|------|--------|
| 1 | Near STATION_A | `{A}` | `[]` | ENTER A |
| 2 | Still at A | `{A}` | `{A}` | none |
| 3 | Driving toward B, outside both | `{}` | `{A}` | **EXIT A** |
| 4 | Arrives at B | `{B}` | `{}` | **ENTER B** |
| 5 | At B | `{B}` | `{B}` | none |

**Ping 3 → 4 without intermediate ping (fast drive):**

If user goes from inside A directly to inside B on one 30s poll (skipped ping while between stations):

| # | Inside | LAST | Events |
|---|--------|------|--------|
| 1 | `{A}` | `[]` | ENTER A |
| 2 | `{B}` | `{A}` | **EXIT A**, **ENTER B** |

One ping can emit **both** a station EXIT and a station ENTER.

---

### 6.10 Example D — Optional OS event vs ping (observability)

| Time | OS event (optional) | Ping | Server canonical `geo_events` |
|------|---------------------|------|-------------------------------|
| 10:00:55 | ENTER STATION_001 (stored in raw) | — | — |
| 10:01:00 | — | inside station | ENTER STATION_001 (if not already inside from last state) |

If OS ENTER at 10:00:55 but first ping at 10:01:00 also inside:

- Raw table has device ENTER at 10:00:55.
- If `last_stations` was empty, ping at 10:01:00 produces ENTER at 10:01:00 in `geo_events`.
- **Duplicate ENTER risk:** avoided because after first ENTER, `last_stations = [STATION_001]`; subsequent inside pings do nothing.

If OS fires ENTER early (false positive 150m away) but ping shows outside:

- Raw table: device ENTER.
- Ping: no ENTER in `geo_events` (not inside 70m).
- Analytics use `geo_events` (ping truth). Raw table shows discrepancy for debugging.

v1 does not auto-flag discrepancies; both rows exist for manual analysis.

---

### 6.11 Edge cases and v1 behavior

| Scenario | v1 behavior |
|----------|-------------|
| Duplicate ping (`client_ping_id` replay) | Ignored; no state change |
| Ping outside all stations | EXIT all previously inside stations; forced amenity EXITS |
| User inside station but ping GPS error far away | EXIT station (trust this ping); may re-ENTER on next good ping |
| No amenities defined for station | Station ENTER/EXIT only; amenity phase skipped |
| Entity `is_active = false` | Excluded from inside calculation |
| First ping ever is inside station | ENTER (last was empty) |
| Batch of 5 pings in one request | Process sequentially sorted by `recorded_at` |
| Empty `entities` in request | Use existing DB entities for geometry |
| Station not in DB yet | Cannot be inside; app should send entities first |

### 6.12 What the app must do for this to work

| Requirement | Reason |
|-------------|--------|
| Send pings while user is inside station (~30s) | Server only updates state when pings arrive |
| Send entities before or with first pings | Server needs geometry |
| Stable `user_id` | State continuity |
| Unique `client_ping_id` per fix | Idempotency |
| OS geofence to **start/stop polling** | Battery: don't poll 30s globally when far from stations |

OS geofence is **not** required for server EXIT logic if pings keep arriving. OS geofence is required for **reliable polling trigger** in background without polling the entire world.

### 6.13 v1 design limitations (accepted for dev)

These are **not bugs** — explicit v1 tradeoffs documented for implementers:

| Topic | v1 behavior | Consideration |
|-------|-------------|---------------|
| **Out-of-order pings** | Processed sorted by `recorded_at` within each request | If ping B arrives in a later request after ping C was already processed, state may be briefly inconsistent. Acceptable for localhost dev. |
| **Concurrent pings** | No locking on `user_geo_state` | Same `user_id` sending simultaneous requests could race. Fine for v1 dev volume. |
| **No accuracy filtering** | All GPS fixes trusted | A very poor accuracy fix (e.g. 500m) can cause false ENTER/EXIT. Explicit non-goal for v1 (Section 2.2). |
| **Multi-device same user** | State keyed on `user_id` only | Two phones for one user can overwrite each other's inside-set. Acceptable for single-device dev testers. |

---

## 7. Supabase database schema

Create these tables manually in Supabase SQL editor (or via timestamped migration files in the backend repo). **RLS disabled for v1** — backend uses service role key; authorization is app-layer when added later.

### 7.1 Entity relationship diagram

```
entities (stations + amenities, self-referential via parent_id)
    │
    ├── location_pings (many per user)
    ├── geofence_events_raw (optional device events)
    ├── geo_events (canonical ENTER/EXIT)
    ├── presence_sessions (derived dwell)
    └── user_geo_state (one row per user_id)
```

### 7.2 Table: `entities`

Unified station and amenity definitions.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `text` | NO | — | **PK.** Station or amenity ID from HF app. |
| `entity_type` | `text` | NO | — | `'station'` or `'amenity'`. Check constraint recommended. |
| `parent_id` | `text` | YES | NULL | **FK → entities.id.** NULL for stations. Required for amenities. |
| `name` | `text` | NO | — | Display name. |
| `latitude` | `double precision` | NO | — | WGS84. |
| `longitude` | `double precision` | NO | — | WGS84. |
| `radius_meters` | `integer` | NO | `70` | Circle radius. Stations default 70. |
| `geometry_type` | `text` | NO | `'circle'` | `'circle'` or `'polygon'`. |
| `polygon` | `jsonb` | YES | NULL | GeoJSON coordinate array for polygons. |
| `amenity_type` | `text` | YES | NULL | HF code: CSTORE, RESTAURANT, etc. |
| `is_active` | `boolean` | NO | `true` | Soft delete / disable. |
| `metadata` | `jsonb` | YES | NULL | Arbitrary HF fields. |
| `created_at` | `timestamptz` | NO | `now()` | |
| `updated_at` | `timestamptz` | NO | `now()` | Update on upsert. |

**Constraints:**

```sql
CHECK (entity_type IN ('station', 'amenity'))
CHECK (
  (entity_type = 'station' AND parent_id IS NULL) OR
  (entity_type = 'amenity' AND parent_id IS NOT NULL)
)
```

**Indexes:**

```sql
CREATE INDEX idx_entities_type_active ON entities (entity_type, is_active);
CREATE INDEX idx_entities_parent ON entities (parent_id) WHERE parent_id IS NOT NULL;
```

**Example queries:**

```sql
-- All stations for geofence_config
SELECT id, latitude, longitude, radius_meters
FROM entities
WHERE entity_type = 'station' AND is_active = true;

-- Amenities of a station
SELECT * FROM entities
WHERE entity_type = 'amenity' AND parent_id = 'STATION_001' AND is_active = true;
```

---

### 7.3 Table: `location_pings`

Immutable log of every GPS fix received.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | **PK.** |
| `user_id` | `text` | NO | — | Person identifier from app. |
| `device_id` | `text` | YES | NULL | Optional debug device id. |
| `client_ping_id` | `text` | NO | — | Client idempotency key (SDK uuid). |
| `recorded_at` | `timestamptz` | NO | — | Device timestamp of fix. |
| `received_at` | `timestamptz` | NO | `now()` | Server receipt time. |
| `latitude` | `double precision` | NO | — | |
| `longitude` | `double precision` | NO | — | |
| `accuracy_meters` | `double precision` | YES | NULL | |
| `altitude` | `double precision` | YES | NULL | |
| `speed_mps` | `double precision` | YES | NULL | |
| `heading` | `double precision` | YES | NULL | |
| `is_moving` | `boolean` | YES | NULL | |
| `ping_reason` | `text` | YES | NULL | STATION_POLL, etc. |
| `context` | `jsonb` | YES | NULL | Full optional context object from app. |

**Unique constraint (idempotency):**

```sql
UNIQUE (user_id, client_ping_id)
```

**Indexes:**

```sql
CREATE INDEX idx_pings_user_recorded ON location_pings (user_id, recorded_at DESC);
CREATE INDEX idx_pings_recorded ON location_pings (recorded_at DESC);
```

---

### 7.4 Table: `geofence_events_raw`

Optional OS geofence events from device. **Not** the canonical analytics stream.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | **PK.** |
| `user_id` | `text` | NO | — | |
| `device_id` | `text` | YES | NULL | |
| `client_event_id` | `text` | NO | — | Idempotency key. |
| `entity_type` | `text` | NO | — | v1: `'station'`. |
| `entity_id` | `text` | NO | — | Station id. |
| `action` | `text` | NO | — | `'ENTER'` or `'EXIT'`. |
| `recorded_at` | `timestamptz` | NO | — | OS event time. |
| `received_at` | `timestamptz` | NO | `now()` | |
| `latitude` | `double precision` | YES | NULL | |
| `longitude` | `double precision` | YES | NULL | |
| `accuracy_meters` | `double precision` | YES | NULL | |
| `delivery_mode` | `text` | YES | NULL | |
| `was_terminated` | `boolean` | YES | `false` | |
| `coordinates_adjusted` | `boolean` | YES | `false` | |
| `extras` | `jsonb` | YES | NULL | |

**Unique constraint:**

```sql
UNIQUE (user_id, client_event_id)
```

**Indexes:**

```sql
CREATE INDEX idx_raw_events_user ON geofence_events_raw (user_id, recorded_at DESC);
CREATE INDEX idx_raw_events_entity ON geofence_events_raw (entity_id, recorded_at DESC);
```

---

### 7.5 Table: `geo_events`

**Canonical ENTER/EXIT events** produced by server geofence engine (ping set-diff).

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | **PK.** |
| `user_id` | `text` | NO | — | |
| `device_id` | `text` | YES | NULL | From ping if provided. |
| `entity_type` | `text` | NO | — | `'station'` or `'amenity'`. |
| `entity_id` | `text` | NO | — | FK logical → entities.id. |
| `station_id` | `text` | YES | NULL | See Section 6.4: for `entity_type = station` → `station_id = entity_id`; for `entity_type = amenity` → `station_id = entities.parent_id`. |
| `action` | `text` | NO | — | `'ENTER'` or `'EXIT'`. |
| `occurred_at` | `timestamptz` | NO | — | Usually ping `recorded_at`. |
| `source` | `text` | NO | `'server_ping'` | v1: always server ping set-diff. |
| `source_ping_id` | `uuid` | YES | NULL | **FK → location_pings.id**. UUID captured after ping insert in Section 6.4 step 1. |
| `latitude` | `double precision` | YES | NULL | From triggering ping. |
| `longitude` | `double precision` | YES | NULL | |
| `accuracy_meters` | `double precision` | YES | NULL | |
| `created_at` | `timestamptz` | NO | `now()` | |

**Indexes:**

```sql
CREATE INDEX idx_geo_events_user_occurred ON geo_events (user_id, occurred_at DESC);
CREATE INDEX idx_geo_events_entity ON geo_events (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_geo_events_station ON geo_events (station_id, occurred_at DESC);
```

---

### 7.6 Table: `user_geo_state`

Current inside-set per user. **One row per `user_id`.**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | `text` | NO | — | **PK.** |
| `inside_station_ids` | `jsonb` | NO | `'[]'` | Array of station id strings. |
| `inside_amenity_ids` | `jsonb` | NO | `'[]'` | Array of amenity id strings. |
| `updated_at` | `timestamptz` | NO | `now()` | Last ping processed. |

**Example row:**

```json
{
  "user_id": "hf_user_8827361",
  "inside_station_ids": ["STATION_001"],
  "inside_amenity_ids": ["amenity_cafe"],
  "updated_at": "2026-06-24T10:01:30Z"
}
```

---

### 7.7 Table: `presence_sessions` (recommended v1)

Dwell time for analytics. Opened on ENTER, closed on EXIT.

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `id` | `uuid` | NO | `gen_random_uuid()` | **PK.** |
| `user_id` | `text` | NO | — | |
| `entity_type` | `text` | NO | — | `'station'` or `'amenity'`. |
| `entity_id` | `text` | NO | — | |
| `station_id` | `text` | YES | NULL | Parent station for amenities. |
| `entered_at` | `timestamptz` | NO | — | From ENTER event. |
| `exited_at` | `timestamptz` | YES | NULL | NULL = still inside. |
| `dwell_seconds` | `integer` | YES | NULL | Computed on EXIT. |
| `enter_event_id` | `uuid` | YES | NULL | FK → geo_events.id |
| `exit_event_id` | `uuid` | YES | NULL | FK → geo_events.id |
| `created_at` | `timestamptz` | NO | `now()` | |

**Indexes:**

```sql
CREATE INDEX idx_sessions_entity ON presence_sessions (entity_type, entity_id, entered_at DESC);
CREATE INDEX idx_sessions_user ON presence_sessions (user_id, entered_at DESC);
CREATE INDEX idx_sessions_open ON presence_sessions (user_id) WHERE exited_at IS NULL;
```

**Session rules:**

- ENTER → insert row with `exited_at = null` (if no open session for same entity; v1: one open session per entity per user).
- EXIT → find open session, set `exited_at`, `dwell_seconds`.

---

### 7.8 Full SQL bootstrap script (reference)

Run in Supabase SQL editor to create all v1 tables:

```sql
-- entities
CREATE TABLE entities (
  id text PRIMARY KEY,
  entity_type text NOT NULL CHECK (entity_type IN ('station', 'amenity')),
  parent_id text REFERENCES entities(id),
  name text NOT NULL,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_meters integer NOT NULL DEFAULT 70,
  geometry_type text NOT NULL DEFAULT 'circle',
  polygon jsonb,
  amenity_type text,
  is_active boolean NOT NULL DEFAULT true,
  metadata jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (
    (entity_type = 'station' AND parent_id IS NULL) OR
    (entity_type = 'amenity' AND parent_id IS NOT NULL)
  )
);

CREATE INDEX idx_entities_type_active ON entities (entity_type, is_active);
CREATE INDEX idx_entities_parent ON entities (parent_id) WHERE parent_id IS NOT NULL;

-- location_pings
CREATE TABLE location_pings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  device_id text,
  client_ping_id text NOT NULL,
  recorded_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  accuracy_meters double precision,
  altitude double precision,
  speed_mps double precision,
  heading double precision,
  is_moving boolean,
  ping_reason text,
  context jsonb,
  UNIQUE (user_id, client_ping_id)
);

CREATE INDEX idx_pings_user_recorded ON location_pings (user_id, recorded_at DESC);
CREATE INDEX idx_pings_recorded ON location_pings (recorded_at DESC);

-- geofence_events_raw
CREATE TABLE geofence_events_raw (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  device_id text,
  client_event_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('ENTER', 'EXIT')),
  recorded_at timestamptz NOT NULL,
  received_at timestamptz NOT NULL DEFAULT now(),
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  delivery_mode text,
  was_terminated boolean DEFAULT false,
  coordinates_adjusted boolean DEFAULT false,
  extras jsonb,
  UNIQUE (user_id, client_event_id)
);

CREATE INDEX idx_raw_events_user ON geofence_events_raw (user_id, recorded_at DESC);
CREATE INDEX idx_raw_events_entity ON geofence_events_raw (entity_id, recorded_at DESC);

-- geo_events
CREATE TABLE geo_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  device_id text,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  station_id text,
  action text NOT NULL CHECK (action IN ('ENTER', 'EXIT')),
  occurred_at timestamptz NOT NULL,
  source text NOT NULL DEFAULT 'server_ping',
  source_ping_id uuid REFERENCES location_pings(id),
  latitude double precision,
  longitude double precision,
  accuracy_meters double precision,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_geo_events_user_occurred ON geo_events (user_id, occurred_at DESC);
CREATE INDEX idx_geo_events_entity ON geo_events (entity_type, entity_id, occurred_at DESC);
CREATE INDEX idx_geo_events_station ON geo_events (station_id, occurred_at DESC);

-- user_geo_state
CREATE TABLE user_geo_state (
  user_id text PRIMARY KEY,
  inside_station_ids jsonb NOT NULL DEFAULT '[]',
  inside_amenity_ids jsonb NOT NULL DEFAULT '[]',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- presence_sessions
CREATE TABLE presence_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  entity_type text NOT NULL,
  entity_id text NOT NULL,
  station_id text,
  entered_at timestamptz NOT NULL,
  exited_at timestamptz,
  dwell_seconds integer,
  enter_event_id uuid REFERENCES geo_events(id),
  exit_event_id uuid REFERENCES geo_events(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_sessions_entity ON presence_sessions (entity_type, entity_id, entered_at DESC);
CREATE INDEX idx_sessions_user ON presence_sessions (user_id, entered_at DESC);
CREATE INDEX idx_sessions_open ON presence_sessions (user_id) WHERE exited_at IS NULL;
```

### 7.9 Supabase project settings

| Setting | v1 value |
|---------|----------|
| RLS | **Disabled** on all tables (backend uses service role) |
| Extensions | `pgcrypto` for `gen_random_uuid()` (enabled by default on Supabase) |
| PostGIS | **Optional** v1 — haversine in Python is sufficient for circles |
| Backups | Use Supabase dashboard defaults |

### 7.10 Environment variables (backend)

```bash
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
# Optional
API_HOST=0.0.0.0
API_PORT=8000
DEFAULT_STATION_RADIUS_METERS=70
```

**Never** expose `SUPABASE_SERVICE_ROLE_KEY` to the mobile app.

---

## 8. Web app and analytics APIs

The backend serves **mobile ingest** (Section 5) and **read-only analytics APIs** for the Visit Analytics dashboard (`apps/web`). Section 8.3–8.4 mark what is **implemented** vs still **planned**.

### 8.1 Web app purpose

| Audience | Questions the web app answers |
|----------|-------------------------------|
| **Leadership** | Which stations/amenities have highest foot traffic? Where should we place offers? |
| **Product** | Dwell time at cafe vs store? Return visit rate? |
| **Engineering** | Why didn't user X get amenity ENTER? Ping timeline? OS vs server mismatch? |
| **Ops** | Upload failure rates? Permission denial rates? |

**Scope:** Observability limited to geofencing feature — not full app analytics.

### 8.2 Monorepo structure

```
hyperfuel-geofencing-analytics/
├── apps/
│   ├── api/          # FastAPI — ingest + analytics read routes
│   └── web/          # React Visit Analytics dashboard (implemented)
├── docs/
│   └── geofencing-analytics-platform-spec.md
└── package.json      # npm run dev — API :8000 + web :5173
```

Web stack: React 18 + TypeScript + Vite, Material UI, TanStack Query. Auth: not implemented — internal dev use only (Section 8.7).

### 8.3 Web app pages

| Page | Route | Status | Description |
|------|-------|--------|-------------|
| **Stations** | `/stations` | Implemented | Home — stations ranked by visitors, visits, time spent; expandable amenity rows |
| **Place report** | `/entities/:entityId` | Implemented | Per-station or per-amenity KPIs and visitor breakdown |
| **Users** | `/users` | Implemented | User list with KPI cards (location updates, visits, still there) |
| **User drill-down** | `/users/:userId` | Implemented | Visits, location updates, tracked places; technical detail drawer |
| **Dashboard (standalone)** | — | Planned | Dedicated KPI home separate from nav sections |
| **Observability** | — | Planned | Permission stats, ping gaps, duplicate rate, platform breakdown |
| **Entity admin** | — | Planned | CRUD stations/amenities (dev; ingest from app is primary) |

### 8.4 Analytics APIs

All under `/api/v1/analytics`, read-only. **Admin auth not implemented** — same as mobile ingest (Section 8.7).

#### Implemented (v1 dashboard)

| Method | Path | Used by |
|--------|------|---------|
| GET | `/dashboard/summary` | KPI cards (`from`, `to` optional) |
| GET | `/users` | Users page |
| GET | `/users/{user_id}/timeline` | User drill-down |
| GET | `/entities` | Entity lists in user timeline |
| GET | `/presence-sessions` | Session data (filters: `user_id`, `entity_id`, `from`, `to`, `open_only`) |
| GET | `/stations/catalog` | Stations home |
| GET | `/entities/{entity_id}/analytics` | Place report |

#### Planned (not yet implemented)

#### `GET /api/v1/analytics/dashboard/summary`

**Query params:** `from` (ISO date), `to` (ISO date)

**Response `data`:**

```json
{
  "period": { "from": "...", "to": "..." },
  "total_pings": 125000,
  "unique_users": 842,
  "station_visits": 3200,
  "amenity_visits": 8900,
  "avg_pings_per_user_per_day": 12.4,
  "platform_breakdown": { "ios": 60, "android": 40 }
}
```

#### `GET /api/v1/analytics/stations/summary`

**Query params:** `from`, `to`, `page`, `size`, `sort` (`visits` | `unique_users` | `avg_dwell`)

**Response `data.items[]`:**

| Field | Description |
|-------|-------------|
| `station_id` | |
| `station_name` | From entities |
| `unique_visitors` | DISTINCT user_id with station ENTER |
| `total_visits` | COUNT station ENTER events |
| `total_dwell_seconds` | SUM completed session dwell |
| `avg_dwell_seconds` | AVG per visit |
| `peak_hour` | Hour of day with max ENTERs |

#### `GET /api/v1/analytics/stations/{station_id}/detail`

**Response:** Station summary + amenity breakdown + hourly visit histogram.

#### `GET /api/v1/analytics/amenities/summary`

**Query params:** `from`, `to`, `station_id` (optional filter), `page`, `size`

**Response `data.items[]`:**

| Field | Description |
|-------|-------------|
| `amenity_id`, `amenity_name`, `station_id`, `station_name` | |
| `amenity_type` | CSTORE, etc. |
| `unique_visitors` | |
| `total_visits` | ENTER count |
| `avg_dwell_seconds` | |
| `pct_of_station_visitors` | Users who entered amenity / users who entered station |

**Leadership use:** Rank amenities for offer placement.

#### `GET /api/v1/analytics/users/{user_id}/timeline`

**Query params:** `from`, `to`, `limit`

**Response `data`:**

```json
{
  "user_id": "hf_user_8827361",
  "pings": [ /* location_pings summary */ ],
  "geo_events": [ /* ENTER/EXIT chronological */ ],
  "raw_device_events": [ /* optional OS events */ ],
  "current_state": {
    "inside_station_ids": [],
    "inside_amenity_ids": []
  }
}
```

**Engineering use:** Debug single user journey.

#### `GET /api/v1/analytics/observability/health`

**Response:**

```json
{
  "users_with_zero_pings_after_station_enter": 42,
  "pct_users_location_always": 0.65,
  "ping_upload_gap_p95_seconds": 45,
  "raw_vs_canonical_enter_mismatch_count": 12,
  "pings_per_hour": 450
}
```

#### `GET /api/v1/analytics/entities`

List all entities (stations + amenities) for admin UI.

#### `GET /api/v1/analytics/presence-sessions`

**Query params:** `user_id`, `entity_id`, `from`, `to`, `open_only` (boolean)

Returns dwell sessions for export / CSV.

### 8.5 SQL views (recommended before web app)

Create in Supabase for faster dashboards:

| View | Purpose |
|------|---------|
| `v_station_visits_daily` | `station_id`, `date`, `visits`, `unique_users` |
| `v_amenity_visits_daily` | Same for amenities |
| `v_dwell_by_entity` | `entity_id`, `avg_dwell`, `median_dwell`, `visit_count` |
| `v_user_last_seen` | `user_id`, `last_ping_at`, `last_event_at` |

### 8.6 Offer placement scoring (future product logic)

Not an API v1 — documented for leadership alignment:

```
offer_score = unique_visitors_30d × avg_dwell_minutes × return_rate
```

Web app ranks amenities/stations by `offer_score`. Product team picks top N for Hyperfuel wallet offers and tap-and-pay pilots.

### 8.7 Auth for web app (future)

| v1 mobile | Future web |
|-----------|------------|
| No auth | Admin API key or Google SSO for internal staff |
| Trust `user_id` | Read APIs require admin role |
| | Optional: HF JWT validation on mobile ingest |

### 8.8 Deployment path (beyond localhost)

| Stage | API URL | Notes |
|-------|---------|-------|
| Dev local | `http://localhost:8000` | Current spec |
| Dev shared | Cloud Run / EC2 + HTTPS | Team testing |
| Staging | Internal URL | Load testing 1000 users |
| Production decision | Same service or HF CORE integration | After dev validation |

Data retention policy (future): raw pings may be aggregated after 90 days; `geo_events` and `presence_sessions` kept longer.

---

## 9. Operational notes (local dev)

### 9.1 Starting the stack

```bash
# 1. Supabase: apply migrations in apps/api/migrations/ (or Section 7.8 SQL)

# 2. Full stack (API + Visit Analytics dashboard)
cd apps/api
python -m venv .venv && source .venv/bin/activate
cp .env.example .env   # fill SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY; USE_MEMORY_STORE=false for real data
pip install -e ".[dev]"
cd ../web && yarn install
cd ../.. && npm install
npm run dev            # API :8000, dashboard :5173

# 3. HF app (optional — mobile ingest)
# Set GEOFENCE_ANALYTICS_BASE_URL per Section 4.2
npm start / yarn ios / yarn android
```

### 9.2 Verifying ingest

```bash
curl -s http://localhost:8000/api/health | jq

curl -s -X POST http://localhost:8000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test_user_1",
    "entities": [{
      "id": "STATION_001",
      "entity_type": "station",
      "name": "Test Station",
      "latitude": 17.4474,
      "longitude": 78.381,
      "radius_meters": 70
    }],
    "pings": [{
      "client_ping_id": "test-ping-1",
      "recorded_at": "2026-06-24T10:01:00Z",
      "latitude": 17.4475,
      "longitude": 78.3812,
      "accuracy": 10
    }]
  }' | jq
```

Check Supabase: `location_pings`, `geo_events` (ENTER if inside 70m), `user_geo_state`.

### 9.3 Common issues

| Issue | Cause | Fix |
|-------|-------|-----|
| App cannot reach API | Wrong base URL on device | Use LAN IP or `10.0.2.2` |
| No ENTER event | Point outside 70m radius | Simulate location closer to station center |
| Duplicate ENTER | Idempotency broken | Ensure unique `client_ping_id` per fix |
| Two ENTER for same visit | Multiple `user_id` values | Unify reporting user id in app |
| Empty `geofence_config` | No entities in DB | Send `entities` in ingest first |

### 9.4 Backend implementation order (engineer one-shot plan)

| Step | Task |
|------|------|
| 1 | Scaffold FastAPI monorepo from operative-ai patterns |
| 2 | Run Supabase SQL (Section 7.8) |
| 3 | Implement repositories for all tables |
| 4 | Implement `haversine` + point-in-circle in `core/geo.py` |
| 5 | Implement `geofence_engine.py` (Section 6.4 pseudocode) |
| 6 | Implement `POST /api/v1/ingest` + `GET /api/health` + optional `GET /geofence-config` |
| 7 | Unit tests: set-diff examples from Section 6.7–6.9 |
| 8 | HF mobile integration per Section 4 |
| 9 | Manual E2E on simulator with location simulation |
| 10 | (Later) Analytics routes + web app |

---

## 10. Glossary

| Term | Definition |
|------|------------|
| **Entity** | A station or amenity row in `entities` table |
| **Station** | Top-level geofence region (`parent_id` null), default 70m OS circle |
| **Amenity** | Child entity inside a station (`parent_id` = station id) |
| **Ping** | Single GPS fix sent to server |
| **Raw device event** | OS `onGeofence` ENTER/EXIT stored in `geofence_events_raw` |
| **Geo event** | Canonical ENTER/EXIT in `geo_events` from server set-diff |
| **Set difference** | ENTER = now inside − was inside; EXIT = was inside − now inside |
| **user_geo_state** | Server memory of which stations/amenities user is currently inside |
| **Presence session** | Dwell interval between ENTER and EXIT |
| **geofence_config** | Station circles returned to app for `addGeofences()` |
| **Idempotency** | Duplicate `client_ping_id` / `client_event_id` ignored |
| **Source of truth (geometry)** | HF app sends entities on ingest (v1) |
| **Source of truth (analytics events)** | Server `geo_events` from pings (v1) |

---

## Document history

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-06-24 | Initial complete spec: ingest API, set-diff logic, Supabase schema, HF integration, future web |
| 1.1 | 2026-06-24 | Senior review: fixed bootstrap SQL indexes, Android `__DEV__` base URL, algorithm gaps (`source_ping_id`, `station_id`, `presence_sessions`), entity upsert ordering, HTTP 422 convention, health path note, v1 limitations table |
| 1.2 | 2026-06-30 | Visit Analytics dashboard (`apps/web`) and analytics read APIs implemented; Section 8 and codebase structure updated |

---

## Quick reference card

```
Mobile → POST /api/v1/ingest
  user_id (required)
  entities[] (stations radius=70 + amenities with parent_id)
  pings[] (every ~30s inside station)
  events[] (optional OS geofence)

Server per ping:
  current_inside = geometry check
  ENTER = current - last
  EXIT = last - current
  last = current

Tables: entities, location_pings, geofence_events_raw,
        geo_events, user_geo_state, presence_sessions

Local API: http://localhost:8000 (see Section 4.2 for emulator/device)
Dashboard: http://localhost:5173 (npm run dev from repo root)
Analytics: GET /api/v1/analytics/*
```

---

## 11. Backend codebase structure (implementation guide)

Follow **operative-ai-main** layered architecture. Engineers implementing the one-shot plan should create this structure.

```
apps/api/
├── app/
│   ├── main.py                 # FastAPI app, CORS, lifespan, router registration
│   ├── config.py               # Settings: SUPABASE_*, USE_MEMORY_STORE, DEFAULT_STATION_RADIUS_METERS=70
│   ├── dependencies.py         # get_admin_client, get_*_service
│   ├── api/v1/routes/
│   │   ├── health.py           # GET /api/health
│   │   ├── ingest.py           # POST /api/v1/ingest
│   │   ├── geofence_config.py  # GET /api/v1/geofence-config
│   │   └── analytics.py        # GET /api/v1/analytics/* (Section 8.4)
│   ├── services/
│   │   ├── ingest_service.py   # Orchestrates upsert + ping loop + response
│   │   ├── geofence_engine.py  # Section 6.4 pseudocode — CORE LOGIC
│   │   ├── entity_service.py   # Upsert entities, build geofence_config
│   │   ├── session_service.py  # Open/close presence_sessions on geo_events
│   │   ├── analytics_service.py
│   │   └── entity_analytics_service.py
│   ├── repositories/
│   │   ├── memory_backend.py   # In-memory store when USE_MEMORY_STORE=true
│   │   └── supabase_backend.py # Supabase persistence
│   ├── schemas/
│   │   ├── requests/ingest_request.py
│   │   ├── responses/          # api_response, ingest, analytics, entity_analytics
│   │   └── internal/models.py
│   └── core/
│       ├── supabase.py         # Async admin client
│       ├── supabase_retry.py
│       ├── postgrest_errors.py
│       ├── geo.py              # haversine_distance_meters(), is_inside_circle()
│       ├── exceptions.py
│       ├── error_handlers.py
│       └── responses.py        # success(), error() helpers
├── migrations/
│   ├── 20260624120000_initial_schema.sql
│   ├── 20260625143000_entities_user_id.sql
│   └── 20260625200000_geo_users.sql
├── tests/
│   ├── test_geofence_engine.py # Section 6.7, 6.8, 6.9 as pytest cases
│   ├── test_geo.py
│   ├── test_ingest_api.py
│   ├── test_analytics_api.py
│   ├── test_entity_analytics_api.py
│   ├── test_supabase_idempotency.py
│   └── test_supabase_retry.py
├── pyproject.toml
└── .env.example

apps/web/                       # Visit Analytics dashboard — see apps/web/README.md
```

### 11.1 Key implementation files

**`core/geo.py`**

```python
def haversine_distance_meters(lat1, lon1, lat2, lon2) -> float: ...
def is_inside_circle(ping_lat, ping_lon, center_lat, center_lon, radius_m) -> bool:
    return haversine_distance_meters(...) <= radius_m
```

**`geofence_engine.py`** — implement Section 6.4 exactly. No debounce. Call `session_service` on ENTER/EXIT.

**`ingest_service.py`** — processing order:

1. `entity_service.upsert_all(entities)` — **two-pass: stations then amenities** (Section 5.3.3)
2. `raw_event_repository.insert_all(events)` (skip duplicates)
3. Sort pings by `recorded_at`
4. For each ping: `geofence_engine.process_ping(user_id, ping)` (Section 6.4 — includes `session_service`)
5. Return `geofence_config` + `ingest_summary`

### 11.2 CORS for local HF app

```python
# Allow Metro bundler and local dev origins
allow_origins=[
    "http://localhost:8081",
    "http://localhost:19006",
    "http://127.0.0.1:8081",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

Physical device does not need CORS (React Native is not browser). Simulators hitting localhost also typically bypass CORS for native HTTP clients — **axios/fetch from RN usually has no CORS issue**. CORS matters if web debug tools are used.

### 11.3 Default constants

```python
DEFAULT_STATION_RADIUS_METERS = 70
```

Apply when upserting station entity without `radius_meters` in payload.

### 11.4 Test cases (must pass before HF integration)

| Test | Input | Expected |
|------|-------|----------|
| `test_first_ping_inside_station` | last empty, ping inside 70m | 1 station ENTER |
| `test_second_ping_still_inside` | last [S1], ping inside S1 | 0 events |
| `test_ping_outside_after_inside` | last [S1], ping outside | 1 station EXIT |
| `test_amenity_enter` | inside station + amenity circle | amenity ENTER |
| `test_amenity_switch` | move from cafe to store | EXIT cafe, ENTER store |
| `test_station_exit_forces_amenity_exit` | exit station while amenity inside | EXIT station + EXIT amenity + close sessions |
| `test_station_handoff` | A to B in one ping | EXIT A, ENTER B |
| `test_duplicate_ping_id` | same client_ping_id twice | 1 ping row, 1 state change |
| `test_enter_opens_session` | station ENTER | `presence_sessions` row with `exited_at` null |
| `test_exit_closes_session` | station EXIT after ENTER | session `exited_at` set, `dwell_seconds` computed |
