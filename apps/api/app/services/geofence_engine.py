"""
Geofence engine — Section 6.4 set-difference state machine.

Each ping: geometry check → ENTER/EXIT on state change → update user_geo_state.
No debounce. Forced amenity EXIT on station EXIT (Section 6.5).
"""

from datetime import datetime

from app.core.geo import is_inside_circle
from app.repositories.memory_backend import MemoryBackend
from app.schemas.internal.models import GeoEventsCreated, LocationPingRecord
from app.services.session_service import SessionService


class GeofenceEngine:
    def __init__(self, backend: MemoryBackend, session_service: SessionService) -> None:
        self._backend = backend
        self._session_service = session_service

    async def process_ping(
        self,
        *,
        user_id: str,
        device_id: str | None,
        ping: LocationPingRecord,
    ) -> GeoEventsCreated:
        """Implements Section 6.4 pseudocode for one stored ping row."""
        counts = GeoEventsCreated()
        state = await self._backend.get_or_create_user_state(user_id)
        last_stations = set(state.inside_station_ids)
        last_amenities = set(state.inside_amenity_ids)

        stations = await self._backend.list_active_stations(user_id)
        currently_inside_stations = {
            s.id
            for s in stations
            if is_inside_circle(
                ping.latitude,
                ping.longitude,
                s.latitude,
                s.longitude,
                s.radius_meters,
            )
        }

        for station_id in currently_inside_stations - last_stations:
            event = await self._emit_station_event(
                user_id=user_id,
                device_id=device_id,
                station_id=station_id,
                action="ENTER",
                ping=ping,
            )
            await self._session_service.open_session(
                user_id=user_id,
                entity_type="station",
                entity_id=station_id,
                station_id=station_id,
                entered_at=ping.recorded_at,
                enter_event_id=event.id,
            )
            counts.increment("station", "ENTER")

        for station_id in last_stations - currently_inside_stations:
            event = await self._emit_station_event(
                user_id=user_id,
                device_id=device_id,
                station_id=station_id,
                action="EXIT",
                ping=ping,
            )
            await self._session_service.close_session(
                user_id=user_id,
                entity_type="station",
                entity_id=station_id,
                exited_at=ping.recorded_at,
                exit_event_id=event.id,
            )
            counts.increment("station", "EXIT")

            # Section 6.5 — forced amenity EXIT when station EXIT fires
            for amenity_id in list(last_amenities):
                amenity = await self._backend.get_entity(amenity_id, user_id)
                if amenity and amenity.parent_id == station_id:
                    forced = await self._emit_amenity_event(
                        user_id=user_id,
                        device_id=device_id,
                        amenity_id=amenity_id,
                        station_id=station_id,
                        action="EXIT",
                        ping=ping,
                    )
                    await self._session_service.close_session(
                        user_id=user_id,
                        entity_type="amenity",
                        entity_id=amenity_id,
                        exited_at=ping.recorded_at,
                        exit_event_id=forced.id,
                    )
                    last_amenities.discard(amenity_id)
                    counts.increment("amenity", "EXIT")

        currently_inside_amenities: set[str] = set()
        for station_id in currently_inside_stations:
            amenities = await self._backend.list_active_amenities_for_station(station_id, user_id)
            for amenity in amenities:
                if is_inside_circle(
                    ping.latitude,
                    ping.longitude,
                    amenity.latitude,
                    amenity.longitude,
                    amenity.radius_meters,
                ):
                    currently_inside_amenities.add(amenity.id)

        for amenity_id in currently_inside_amenities - last_amenities:
            amenity = await self._backend.get_entity(amenity_id, user_id)
            parent_id = amenity.parent_id if amenity else None
            event = await self._emit_amenity_event(
                user_id=user_id,
                device_id=device_id,
                amenity_id=amenity_id,
                station_id=parent_id,
                action="ENTER",
                ping=ping,
            )
            await self._session_service.open_session(
                user_id=user_id,
                entity_type="amenity",
                entity_id=amenity_id,
                station_id=parent_id,
                entered_at=ping.recorded_at,
                enter_event_id=event.id,
            )
            counts.increment("amenity", "ENTER")

        for amenity_id in last_amenities - currently_inside_amenities:
            amenity = await self._backend.get_entity(amenity_id, user_id)
            parent_id = amenity.parent_id if amenity else None
            event = await self._emit_amenity_event(
                user_id=user_id,
                device_id=device_id,
                amenity_id=amenity_id,
                station_id=parent_id,
                action="EXIT",
                ping=ping,
            )
            await self._session_service.close_session(
                user_id=user_id,
                entity_type="amenity",
                entity_id=amenity_id,
                exited_at=ping.recorded_at,
                exit_event_id=event.id,
            )
            counts.increment("amenity", "EXIT")

        await self._backend.update_user_state(
            user_id,
            sorted(currently_inside_stations),
            sorted(currently_inside_amenities),
        )
        return counts

    async def _emit_station_event(
        self,
        *,
        user_id: str,
        device_id: str | None,
        station_id: str,
        action: str,
        ping: LocationPingRecord,
    ):
        return await self._backend.create_geo_event(
            user_id=user_id,
            device_id=device_id,
            entity_type="station",
            entity_id=station_id,
            station_id=station_id,
            action=action,
            occurred_at=ping.recorded_at,
            source_ping_id=ping.id,
            latitude=ping.latitude,
            longitude=ping.longitude,
            accuracy_meters=ping.accuracy_meters,
        )

    async def _emit_amenity_event(
        self,
        *,
        user_id: str,
        device_id: str | None,
        amenity_id: str,
        station_id: str | None,
        action: str,
        ping: LocationPingRecord,
    ):
        return await self._backend.create_geo_event(
            user_id=user_id,
            device_id=device_id,
            entity_type="amenity",
            entity_id=amenity_id,
            station_id=station_id,
            action=action,
            occurred_at=ping.recorded_at,
            source_ping_id=ping.id,
            latitude=ping.latitude,
            longitude=ping.longitude,
            accuracy_meters=ping.accuracy_meters,
        )
