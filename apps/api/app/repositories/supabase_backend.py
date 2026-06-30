"""Supabase-backed persistence — Section 7 schema via PostgREST."""

from collections.abc import Awaitable, Callable
from datetime import datetime
from typing import Any, TypeVar

from supabase import AsyncClient

from app.core.supabase import first_row_or_none
from app.core.supabase_retry import with_supabase_retry
from app.repositories.memory_backend import MemoryBackend
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

R = TypeVar("R")


class SupabaseBackend(MemoryBackend):
    """Supabase implementation mirroring MemoryBackend public methods."""

    def __init__(self, client: AsyncClient) -> None:
        super().__init__()
        self._client = client

    async def _run(
        self,
        fn: Callable[[], Awaitable[R]],
        *,
        operation: str = "postgrest",
    ) -> R:
        """Execute PostgREST call with retry on transient httpx errors."""
        return await with_supabase_retry(fn, operation=operation)

    async def delete_user_entities(self, user_id: str) -> None:
        await self._run(
            lambda: self._client.table("entities").delete().eq("user_id", user_id).execute(),
            operation="delete_user_entities",
        )

    async def upsert_entity(self, entity: EntityRecord) -> None:
        row = {
            "id": entity.id,
            "user_id": entity.user_id,
            "entity_type": entity.entity_type,
            "parent_id": entity.parent_id,
            "name": entity.name,
            "latitude": entity.latitude,
            "longitude": entity.longitude,
            "radius_meters": entity.radius_meters,
            "geometry_type": entity.geometry_type,
            "polygon": entity.polygon,
            "amenity_type": entity.amenity_type,
            "is_active": entity.is_active,
            "metadata": entity.metadata,
            "updated_at": datetime.now().isoformat(),
        }
        await self._run(
            lambda: self._client.table("entities").upsert(row).execute(),
            operation="upsert_entity",
        )

    async def list_active_stations(self, user_id: str) -> list[EntityRecord]:
        response = await self._run(
            lambda: self._client.table("entities")
            .select("*")
            .eq("entity_type", "station")
            .eq("is_active", True)
            .eq("user_id", user_id)
            .execute(),
            operation="list_active_stations",
        )
        rows = response.data or []
        return [EntityRecord.model_validate(row) for row in rows]

    async def list_active_amenities_for_station(
        self,
        station_id: str,
        user_id: str,
    ) -> list[EntityRecord]:
        response = await self._run(
            lambda: self._client.table("entities")
            .select("*")
            .eq("entity_type", "amenity")
            .eq("is_active", True)
            .eq("parent_id", station_id)
            .eq("user_id", user_id)
            .execute(),
            operation="list_active_amenities_for_station",
        )
        rows = response.data or []
        return [EntityRecord.model_validate(row) for row in rows]

    async def get_entity(self, entity_id: str, user_id: str) -> EntityRecord | None:
        response = await self._run(
            lambda: self._client.table("entities")
            .select("*")
            .eq("id", entity_id)
            .eq("user_id", user_id)
            .maybe_single()
            .execute(),
            operation="get_entity",
        )
        row = response.data if response and response.data else None
        if not row:
            return None
        return EntityRecord.model_validate(row)

    async def insert_ping(self, **kwargs: Any) -> LocationPingRecord | None:
        user_id = kwargs["user_id"]
        client_ping_id = kwargs["client_ping_id"]
        existing = await self._run(
            lambda: self._client.table("location_pings")
            .select("id")
            .eq("user_id", user_id)
            .eq("client_ping_id", client_ping_id)
            .maybe_single()
            .execute(),
            operation="insert_ping_idempotency_check",
        )
        if existing and existing.data:
            return None

        row = {
            "user_id": user_id,
            "device_id": kwargs.get("device_id"),
            "client_ping_id": client_ping_id,
            "recorded_at": kwargs["recorded_at"].isoformat(),
            "latitude": kwargs["latitude"],
            "longitude": kwargs["longitude"],
            "accuracy_meters": kwargs.get("accuracy_meters"),
            "altitude": kwargs.get("altitude"),
            "speed_mps": kwargs.get("speed_mps"),
            "heading": kwargs.get("heading"),
            "is_moving": kwargs.get("is_moving"),
            "ping_reason": kwargs.get("ping_reason"),
            "context": kwargs.get("context"),
        }
        response = await self._run(
            lambda: self._client.table("location_pings").insert(row).select("*").execute(),
            operation="insert_location_ping",
        )
        inserted = first_row_or_none(response)
        if not inserted:
            return None
        return LocationPingRecord.model_validate(inserted)

    async def insert_raw_event(self, **kwargs: Any) -> bool:
        user_id = kwargs["user_id"]
        client_event_id = kwargs["client_event_id"]
        existing = await self._run(
            lambda: self._client.table("geofence_events_raw")
            .select("id")
            .eq("user_id", user_id)
            .eq("client_event_id", client_event_id)
            .maybe_single()
            .execute(),
            operation="insert_raw_event_idempotency_check",
        )
        if existing and existing.data:
            return False

        row = {
            "user_id": user_id,
            "device_id": kwargs.get("device_id"),
            "client_event_id": client_event_id,
            "entity_type": kwargs["entity_type"],
            "entity_id": kwargs["entity_id"],
            "action": kwargs["action"],
            "recorded_at": kwargs["recorded_at"].isoformat(),
            "latitude": kwargs.get("latitude"),
            "longitude": kwargs.get("longitude"),
            "accuracy_meters": kwargs.get("accuracy_meters"),
            "delivery_mode": kwargs.get("delivery_mode"),
            "was_terminated": kwargs.get("was_terminated", False),
            "coordinates_adjusted": kwargs.get("coordinates_adjusted", False),
            "extras": kwargs.get("extras"),
        }
        await self._run(
            lambda: self._client.table("geofence_events_raw").insert(row).execute(),
            operation="insert_geofence_event_raw",
        )
        return True

    async def create_geo_event(self, **kwargs: Any) -> GeoEventRecord:
        row = {
            "user_id": kwargs["user_id"],
            "device_id": kwargs.get("device_id"),
            "entity_type": kwargs["entity_type"],
            "entity_id": kwargs["entity_id"],
            "station_id": kwargs.get("station_id"),
            "action": kwargs["action"],
            "occurred_at": kwargs["occurred_at"].isoformat(),
            "source": "server_ping",
            "source_ping_id": kwargs.get("source_ping_id"),
            "latitude": kwargs.get("latitude"),
            "longitude": kwargs.get("longitude"),
            "accuracy_meters": kwargs.get("accuracy_meters"),
        }
        response = await self._run(
            lambda: self._client.table("geo_events").insert(row).select("*").execute(),
            operation="insert_geo_event",
        )
        inserted = first_row_or_none(response)
        if not inserted:
            raise ValueError("geo_events insert returned no row")
        return GeoEventRecord.model_validate(inserted)

    async def get_or_create_user_state(self, user_id: str) -> UserGeoStateRecord:
        response = await self._run(
            lambda: self._client.table("user_geo_state")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute(),
            operation="get_user_geo_state",
        )
        if response and response.data:
            return UserGeoStateRecord.model_validate(response.data)

        row = {
            "user_id": user_id,
            "inside_station_ids": [],
            "inside_amenity_ids": [],
        }
        await self._run(
            lambda: self._client.table("user_geo_state").insert(row).execute(),
            operation="insert_user_geo_state",
        )
        return UserGeoStateRecord(
            user_id=user_id,
            inside_station_ids=[],
            inside_amenity_ids=[],
            updated_at=datetime.now(),
        )

    async def update_user_state(
        self,
        user_id: str,
        inside_station_ids: list[str],
        inside_amenity_ids: list[str],
    ) -> UserGeoStateRecord:
        row = {
            "inside_station_ids": inside_station_ids,
            "inside_amenity_ids": inside_amenity_ids,
            "updated_at": datetime.now().isoformat(),
        }
        response = await self._run(
            lambda: self._client.table("user_geo_state")
            .update(row)
            .eq("user_id", user_id)
            .select("*")
            .execute(),
            operation="update_user_geo_state",
        )
        updated = first_row_or_none(response)
        if updated:
            return UserGeoStateRecord.model_validate(updated)
        return await self.get_or_create_user_state(user_id)

    async def open_session(self, **kwargs: Any) -> PresenceSessionRecord | None:
        user_id = kwargs["user_id"]
        entity_type = kwargs["entity_type"]
        entity_id = kwargs["entity_id"]
        open_resp = await self._run(
            lambda: self._client.table("presence_sessions")
            .select("id")
            .eq("user_id", user_id)
            .eq("entity_type", entity_type)
            .eq("entity_id", entity_id)
            .is_("exited_at", "null")
            .execute(),
            operation="open_session_check",
        )
        if open_resp.data:
            return None

        row = {
            "user_id": user_id,
            "entity_type": entity_type,
            "entity_id": entity_id,
            "station_id": kwargs.get("station_id"),
            "entered_at": kwargs["entered_at"].isoformat(),
            "enter_event_id": kwargs["enter_event_id"],
        }
        response = await self._run(
            lambda: self._client.table("presence_sessions").insert(row).select("*").execute(),
            operation="insert_presence_session",
        )
        inserted = first_row_or_none(response)
        if not inserted:
            return None
        return PresenceSessionRecord.model_validate(inserted)

    async def close_session(self, **kwargs: Any) -> PresenceSessionRecord | None:
        user_id = kwargs["user_id"]
        entity_type = kwargs["entity_type"]
        entity_id = kwargs["entity_id"]
        open_resp = await self._run(
            lambda: self._client.table("presence_sessions")
            .select("*")
            .eq("user_id", user_id)
            .eq("entity_type", entity_type)
            .eq("entity_id", entity_id)
            .is_("exited_at", "null")
            .execute(),
            operation="close_session_lookup",
        )
        rows = open_resp.data or []
        if not rows:
            return None
        session = rows[0]
        entered_at = datetime.fromisoformat(session["entered_at"].replace("Z", "+00:00"))
        exited_at = kwargs["exited_at"]
        dwell_seconds = int((exited_at - entered_at).total_seconds())
        update_row = {
            "exited_at": exited_at.isoformat(),
            "dwell_seconds": dwell_seconds,
            "exit_event_id": kwargs["exit_event_id"],
        }
        response = await self._run(
            lambda: self._client.table("presence_sessions")
            .update(update_row)
            .eq("id", session["id"])
            .select("*")
            .execute(),
            operation="close_session",
        )
        updated = first_row_or_none(response)
        if not updated:
            return None
        return PresenceSessionRecord.model_validate(updated)

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

    # --- Analytics read methods (spec Section 8.4) ---

    def _apply_range(
        self,
        query: Any,
        column: str,
        from_dt: datetime | None,
        to_dt: datetime | None,
    ) -> Any:
        if from_dt:
            query = query.gte(column, from_dt.isoformat())
        if to_dt:
            query = query.lte(column, to_dt.isoformat())
        return query

    async def list_user_entities(self, user_id: str) -> list[EntityRecord]:
        response = await self._run(
            lambda: self._client.table("entities").select("*").eq("user_id", user_id).execute(),
            operation="list_user_entities",
        )
        return [EntityRecord.model_validate(row) for row in (response.data or [])]

    async def list_all_entities(self) -> list[EntityRecord]:
        response = await self._run(
            lambda: self._client.table("entities").select("*").execute(),
            operation="list_entities",
        )
        return [EntityRecord.model_validate(row) for row in (response.data or [])]

    async def list_user_pings(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> list[LocationPingRecord]:
        query = (
            self._client.table("location_pings")
            .select("*")
            .eq("user_id", user_id)
            .order("recorded_at", desc=True)
            .limit(limit)
        )
        query = self._apply_range(query, "recorded_at", from_dt, to_dt)
        response = await self._run(lambda: query.execute(), operation="list_user_pings")
        return [LocationPingRecord.model_validate(row) for row in (response.data or [])]

    async def list_user_geo_events(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> list[GeoEventRecord]:
        query = (
            self._client.table("geo_events")
            .select("*")
            .eq("user_id", user_id)
            .order("occurred_at", desc=True)
            .limit(limit)
        )
        query = self._apply_range(query, "occurred_at", from_dt, to_dt)
        response = await self._run(lambda: query.execute(), operation="list_user_geo_events")
        return [GeoEventRecord.model_validate(row) for row in (response.data or [])]

    async def list_user_raw_events(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> list[RawDeviceEventItem]:
        query = (
            self._client.table("geofence_events_raw")
            .select("*")
            .eq("user_id", user_id)
            .order("recorded_at", desc=True)
            .limit(limit)
        )
        query = self._apply_range(query, "recorded_at", from_dt, to_dt)
        response = await self._run(lambda: query.execute(), operation="list_user_raw_events")
        return [RawDeviceEventItem.model_validate(row) for row in (response.data or [])]

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
        query = self._client.table("presence_sessions").select("*").order("entered_at", desc=True)
        if user_id:
            query = query.eq("user_id", user_id)
        if entity_id:
            query = query.eq("entity_id", entity_id)
        if open_only:
            query = query.is_("exited_at", "null")
        query = self._apply_range(query, "entered_at", from_dt, to_dt)
        query = query.limit(limit)
        response = await self._run(lambda: query.execute(), operation="list_presence_sessions")
        return [PresenceSessionRecord.model_validate(row) for row in (response.data or [])]

    async def list_user_summaries(self) -> list[str]:
        user_ids: set[str] = set()
        for table in ("location_pings", "geo_events", "presence_sessions", "entities"):
            response = await self._run(
                lambda t=table: self._client.table(t).select("user_id").execute(),
                operation=f"list_user_summaries_{table}",
            )
            for row in response.data or []:
                if row.get("user_id"):
                    user_ids.add(row["user_id"])
        state_resp = await self._run(
            lambda: self._client.table("user_geo_state").select("user_id").execute(),
            operation="list_user_summaries_user_geo_state",
        )
        for row in state_resp.data or []:
            if row.get("user_id"):
                user_ids.add(row["user_id"])
        geo_users_resp = await self._run(
            lambda: self._client.table("geo_users").select("user_id").execute(),
            operation="list_user_summaries_geo_users",
        )
        for row in geo_users_resp.data or []:
            if row.get("user_id"):
                user_ids.add(row["user_id"])
        return sorted(user_ids)

    async def count_pings(
        self,
        *,
        user_id: str | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> int:
        query = self._client.table("location_pings").select("id", count="exact")
        if user_id:
            query = query.eq("user_id", user_id)
        query = self._apply_range(query, "recorded_at", from_dt, to_dt)
        response = await self._run(lambda: query.execute(), operation="count_pings")
        return response.count or 0

    async def count_geo_events(
        self,
        *,
        user_id: str | None = None,
        entity_type: str | None = None,
        action: str | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> int:
        query = self._client.table("geo_events").select("id", count="exact")
        if user_id:
            query = query.eq("user_id", user_id)
        if entity_type:
            query = query.eq("entity_type", entity_type)
        if action:
            query = query.eq("action", action)
        query = self._apply_range(query, "occurred_at", from_dt, to_dt)
        response = await self._run(lambda: query.execute(), operation="count_geo_events")
        return response.count or 0

    async def count_open_sessions(self, user_id: str | None = None) -> int:
        query = (
            self._client.table("presence_sessions")
            .select("id", count="exact")
            .is_("exited_at", "null")
        )
        if user_id:
            query = query.eq("user_id", user_id)
        response = await self._run(lambda: query.execute(), operation="count_open_sessions")
        return response.count or 0

    async def upsert_user_profile(
        self,
        user_id: str,
        *,
        user_name: str | None = None,
        user_email: str | None = None,
    ) -> AppUserRecord | None:
        if user_name is None and user_email is None:
            return await self.get_user_profile(user_id)
        existing = await self.get_user_profile(user_id)
        row = {
            "user_id": user_id,
            "user_name": user_name if user_name is not None else (existing.user_name if existing else None),
            "user_email": user_email if user_email is not None else (existing.user_email if existing else None),
            "updated_at": datetime.now().isoformat(),
        }
        await self._run(
            lambda: self._client.table("geo_users").upsert(row).execute(),
            operation="upsert_user_profile",
        )
        return await self.get_user_profile(user_id)

    async def get_user_profile(self, user_id: str) -> AppUserRecord | None:
        response = await self._run(
            lambda: self._client.table("geo_users")
            .select("*")
            .eq("user_id", user_id)
            .maybe_single()
            .execute(),
            operation="get_user_profile",
        )
        if response and response.data:
            return AppUserRecord.model_validate(response.data)
        return None

    async def list_user_profiles(self) -> dict[str, AppUserRecord]:
        response = await self._run(
            lambda: self._client.table("geo_users").select("*").execute(),
            operation="list_user_profiles",
        )
        profiles: dict[str, AppUserRecord] = {}
        for row in response.data or []:
            record = AppUserRecord.model_validate(row)
            profiles[record.user_id] = record
        return profiles

    async def list_all_geo_events(self, limit: int = 50_000) -> list[GeoEventRecord]:
        response = await self._run(
            lambda: self._client.table("geo_events")
            .select("*")
            .order("occurred_at", desc=True)
            .limit(limit)
            .execute(),
            operation="list_all_geo_events",
        )
        return [GeoEventRecord.model_validate(row) for row in (response.data or [])]

    async def list_all_presence_sessions(self, limit: int = 50_000) -> list[PresenceSessionRecord]:
        response = await self._run(
            lambda: self._client.table("presence_sessions")
            .select("*")
            .order("entered_at", desc=True)
            .limit(limit)
            .execute(),
            operation="list_all_presence_sessions",
        )
        return [PresenceSessionRecord.model_validate(row) for row in (response.data or [])]
