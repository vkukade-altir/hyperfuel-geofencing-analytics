"""In-memory persistence for local dev and tests — mirrors Section 7 schema."""

from datetime import datetime, timezone
from uuid import uuid4

from app.schemas.internal.models import (
    AppUserRecord,
    EntityRecord,
    GeoEventRecord,
    GeofenceConfigItem,
    LocationPingRecord,
    PresenceSessionRecord,
    UserGeoStateRecord,
)
from app.schemas.responses.analytics_response import RawDeviceEventItem


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class MemoryBackend:
    """Dict-backed store implementing the same operations as Supabase repositories."""

    def __init__(self) -> None:
        self.entities: dict[tuple[str, str], EntityRecord] = {}
        self.pings: dict[str, LocationPingRecord] = {}
        self.ping_keys: set[tuple[str, str]] = set()
        self.raw_events: dict[str, dict] = {}
        self.raw_event_keys: set[tuple[str, str]] = set()
        self.geo_events: dict[str, GeoEventRecord] = {}
        self.user_states: dict[str, UserGeoStateRecord] = {}
        self.sessions: dict[str, PresenceSessionRecord] = {}
        self.geo_users: dict[str, AppUserRecord] = {}

    async def upsert_user_profile(
        self,
        user_id: str,
        *,
        user_name: str | None = None,
        user_email: str | None = None,
    ) -> AppUserRecord | None:
        """Store display name/email from mobile ingest — updated on every ingest with profile."""
        if user_name is None and user_email is None:
            return self.geo_users.get(user_id)
        now = _utcnow()
        existing = self.geo_users.get(user_id)
        record = AppUserRecord(
            user_id=user_id,
            user_name=user_name if user_name is not None else (existing.user_name if existing else None),
            user_email=user_email if user_email is not None else (existing.user_email if existing else None),
            created_at=existing.created_at if existing else now,
            updated_at=now,
        )
        self.geo_users[user_id] = record
        return record

    async def get_user_profile(self, user_id: str) -> AppUserRecord | None:
        return self.geo_users.get(user_id)

    async def list_user_profiles(self) -> dict[str, AppUserRecord]:
        return dict(self.geo_users)

    async def delete_user_entities(self, user_id: str) -> None:
        keys_to_delete = [key for key in self.entities if key[1] == user_id]
        for key in keys_to_delete:
            del self.entities[key]

    async def upsert_entity(self, entity: EntityRecord) -> None:
        self.entities[(entity.id, entity.user_id)] = entity

    async def list_active_stations(self, user_id: str) -> list[EntityRecord]:
        return [
            e
            for e in self.entities.values()
            if e.entity_type == "station" and e.is_active and e.user_id == user_id
        ]

    async def list_active_amenities_for_station(
        self,
        station_id: str,
        user_id: str,
    ) -> list[EntityRecord]:
        return [
            e
            for e in self.entities.values()
            if (
                e.entity_type == "amenity"
                and e.is_active
                and e.parent_id == station_id
                and e.user_id == user_id
            )
        ]

    async def get_entity(self, entity_id: str, user_id: str) -> EntityRecord | None:
        return self.entities.get((entity_id, user_id))

    async def list_geofence_config(self, user_id: str) -> list[GeofenceConfigItem]:
        stations = await self.list_active_stations(user_id)
        return [
            GeofenceConfigItem(
                identifier=s.id,
                latitude=s.latitude,
                longitude=s.longitude,
                radius=s.radius_meters,
            )
            for s in stations
        ]

    async def insert_ping(
        self,
        *,
        user_id: str,
        device_id: str | None,
        client_ping_id: str,
        recorded_at: datetime,
        latitude: float,
        longitude: float,
        accuracy_meters: float | None,
        altitude: float | None,
        speed_mps: float | None,
        heading: float | None,
        is_moving: bool | None,
        ping_reason: str | None,
        context: dict | None,
    ) -> LocationPingRecord | None:
        key = (user_id, client_ping_id)
        if key in self.ping_keys:
            return None
        now = _utcnow()
        record = LocationPingRecord(
            id=str(uuid4()),
            user_id=user_id,
            device_id=device_id,
            client_ping_id=client_ping_id,
            recorded_at=recorded_at,
            received_at=now,
            latitude=latitude,
            longitude=longitude,
            accuracy_meters=accuracy_meters,
            altitude=altitude,
            speed_mps=speed_mps,
            heading=heading,
            is_moving=is_moving,
            ping_reason=ping_reason,
            context=context,
        )
        self.pings[record.id] = record
        self.ping_keys.add(key)
        return record

    async def insert_raw_event(
        self,
        *,
        user_id: str,
        device_id: str | None,
        client_event_id: str,
        entity_type: str,
        entity_id: str,
        action: str,
        recorded_at: datetime,
        latitude: float | None,
        longitude: float | None,
        accuracy_meters: float | None,
        delivery_mode: str | None,
        was_terminated: bool,
        coordinates_adjusted: bool,
        extras: dict | None,
    ) -> bool:
        key = (user_id, client_event_id)
        if key in self.raw_event_keys:
            return False
        self.raw_event_keys.add(key)
        event_id = str(uuid4())
        self.raw_events[event_id] = {
            "id": event_id,
            "user_id": user_id,
            "device_id": device_id,
            "client_event_id": client_event_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "action": action,
            "recorded_at": recorded_at,
            "latitude": latitude,
            "longitude": longitude,
            "accuracy_meters": accuracy_meters,
            "delivery_mode": delivery_mode,
            "was_terminated": was_terminated,
            "coordinates_adjusted": coordinates_adjusted,
            "extras": extras,
        }
        return True

    async def create_geo_event(
        self,
        *,
        user_id: str,
        device_id: str | None,
        entity_type: str,
        entity_id: str,
        station_id: str | None,
        action: str,
        occurred_at: datetime,
        source_ping_id: str | None,
        latitude: float | None,
        longitude: float | None,
        accuracy_meters: float | None,
    ) -> GeoEventRecord:
        now = _utcnow()
        record = GeoEventRecord(
            id=str(uuid4()),
            user_id=user_id,
            device_id=device_id,
            entity_type=entity_type,
            entity_id=entity_id,
            station_id=station_id,
            action=action,
            occurred_at=occurred_at,
            source="server_ping",
            source_ping_id=source_ping_id,
            latitude=latitude,
            longitude=longitude,
            accuracy_meters=accuracy_meters,
            created_at=now,
        )
        self.geo_events[record.id] = record
        return record

    async def get_or_create_user_state(self, user_id: str) -> UserGeoStateRecord:
        if user_id not in self.user_states:
            self.user_states[user_id] = UserGeoStateRecord(
                user_id=user_id,
                inside_station_ids=[],
                inside_amenity_ids=[],
                updated_at=_utcnow(),
            )
        return self.user_states[user_id]

    async def update_user_state(
        self,
        user_id: str,
        inside_station_ids: list[str],
        inside_amenity_ids: list[str],
    ) -> UserGeoStateRecord:
        state = await self.get_or_create_user_state(user_id)
        state.inside_station_ids = inside_station_ids
        state.inside_amenity_ids = inside_amenity_ids
        state.updated_at = _utcnow()
        self.user_states[user_id] = state
        return state

    async def open_session(
        self,
        *,
        user_id: str,
        entity_type: str,
        entity_id: str,
        station_id: str | None,
        entered_at: datetime,
        enter_event_id: str,
    ) -> PresenceSessionRecord | None:
        for session in self.sessions.values():
            if (
                session.user_id == user_id
                and session.entity_type == entity_type
                and session.entity_id == entity_id
                and session.exited_at is None
            ):
                return None
        now = _utcnow()
        record = PresenceSessionRecord(
            id=str(uuid4()),
            user_id=user_id,
            entity_type=entity_type,
            entity_id=entity_id,
            station_id=station_id,
            entered_at=entered_at,
            exited_at=None,
            dwell_seconds=None,
            enter_event_id=enter_event_id,
            exit_event_id=None,
            created_at=now,
        )
        self.sessions[record.id] = record
        return record

    async def close_session(
        self,
        *,
        user_id: str,
        entity_type: str,
        entity_id: str,
        exited_at: datetime,
        exit_event_id: str,
    ) -> PresenceSessionRecord | None:
        for session in self.sessions.values():
            if (
                session.user_id == user_id
                and session.entity_type == entity_type
                and session.entity_id == entity_id
                and session.exited_at is None
            ):
                session.exited_at = exited_at
                session.exit_event_id = exit_event_id
                session.dwell_seconds = int((exited_at - session.entered_at).total_seconds())
                self.sessions[session.id] = session
                return session
        return None

    # --- Analytics read methods (spec Section 8.4) ---

    def _in_range(self, ts: datetime, from_dt: datetime | None, to_dt: datetime | None) -> bool:
        if from_dt and ts < from_dt:
            return False
        if to_dt and ts > to_dt:
            return False
        return True

    async def list_user_entities(self, user_id: str) -> list[EntityRecord]:
        """All entities for a user — used to resolve names in analytics UI."""
        return [e for e in self.entities.values() if e.user_id == user_id]

    async def list_all_entities(self) -> list[EntityRecord]:
        return list(self.entities.values())

    async def list_user_pings(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> list[LocationPingRecord]:
        rows = [
            p
            for p in self.pings.values()
            if p.user_id == user_id and self._in_range(p.recorded_at, from_dt, to_dt)
        ]
        rows.sort(key=lambda p: p.recorded_at, reverse=True)
        return rows[:limit]

    async def list_user_geo_events(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> list[GeoEventRecord]:
        rows = [
            e
            for e in self.geo_events.values()
            if e.user_id == user_id and self._in_range(e.occurred_at, from_dt, to_dt)
        ]
        rows.sort(key=lambda e: e.occurred_at, reverse=True)
        return rows[:limit]

    async def list_user_raw_events(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> list[RawDeviceEventItem]:
        rows: list[RawDeviceEventItem] = []
        for event_id, raw in self.raw_events.items():
            if raw["user_id"] != user_id:
                continue
            recorded_at = raw["recorded_at"]
            if not self._in_range(recorded_at, from_dt, to_dt):
                continue
            rows.append(
                RawDeviceEventItem(
                    id=raw.get("id", event_id),
                    user_id=raw["user_id"],
                    device_id=raw.get("device_id"),
                    client_event_id=raw["client_event_id"],
                    entity_type=raw["entity_type"],
                    entity_id=raw["entity_id"],
                    action=raw["action"],
                    recorded_at=recorded_at,
                    latitude=raw.get("latitude"),
                    longitude=raw.get("longitude"),
                    accuracy_meters=raw.get("accuracy_meters"),
                    delivery_mode=raw.get("delivery_mode"),
                    was_terminated=raw.get("was_terminated", False),
                    coordinates_adjusted=raw.get("coordinates_adjusted", False),
                    extras=raw.get("extras"),
                )
            )
        rows.sort(key=lambda e: e.recorded_at, reverse=True)
        return rows[:limit]

    async def list_presence_sessions(
        self,
        *,
        user_id: str | None = None,
        entity_id: str | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        open_only: bool = False,
        limit: int = 500,
    ) -> list[PresenceSessionRecord]:
        rows: list[PresenceSessionRecord] = []
        for session in self.sessions.values():
            if user_id and session.user_id != user_id:
                continue
            if entity_id and session.entity_id != entity_id:
                continue
            if open_only and session.exited_at is not None:
                continue
            if from_dt or to_dt:
                if not self._in_range(session.entered_at, from_dt, to_dt):
                    if session.exited_at is None or not self._in_range(
                        session.exited_at, from_dt, to_dt
                    ):
                        continue
            rows.append(session)
        rows.sort(key=lambda s: s.entered_at, reverse=True)
        return rows[:limit]

    async def list_user_summaries(self) -> list[str]:
        """Distinct user_ids seen in pings, events, or sessions."""
        user_ids: set[str] = set()
        user_ids.update(p.user_id for p in self.pings.values())
        user_ids.update(e.user_id for e in self.geo_events.values())
        user_ids.update(s.user_id for s in self.sessions.values())
        user_ids.update(e.user_id for e in self.entities.values())
        user_ids.update(self.user_states.keys())
        user_ids.update(self.geo_users.keys())
        return sorted(user_ids)

    async def count_pings(
        self,
        *,
        user_id: str | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> int:
        return sum(
            1
            for p in self.pings.values()
            if (user_id is None or p.user_id == user_id)
            and self._in_range(p.recorded_at, from_dt, to_dt)
        )

    async def count_geo_events(
        self,
        *,
        user_id: str | None = None,
        entity_type: str | None = None,
        action: str | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> int:
        count = 0
        for event in self.geo_events.values():
            if user_id and event.user_id != user_id:
                continue
            if entity_type and event.entity_type != entity_type:
                continue
            if action and event.action != action:
                continue
            if not self._in_range(event.occurred_at, from_dt, to_dt):
                continue
            count += 1
        return count

    async def count_open_sessions(self, user_id: str | None = None) -> int:
        return sum(
            1
            for s in self.sessions.values()
            if s.exited_at is None and (user_id is None or s.user_id == user_id)
        )

    async def list_all_geo_events(self, limit: int = 50_000) -> list[GeoEventRecord]:
        """All canonical ENTER/EXIT events — entity analytics aggregation."""
        rows = list(self.geo_events.values())
        rows.sort(key=lambda e: e.occurred_at, reverse=True)
        return rows[:limit]

    async def list_all_presence_sessions(self, limit: int = 50_000) -> list[PresenceSessionRecord]:
        """All dwell sessions — entity analytics aggregation."""
        rows = list(self.sessions.values())
        rows.sort(key=lambda s: s.entered_at, reverse=True)
        return rows[:limit]
