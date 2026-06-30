"""Ingest orchestration — Section 5.3.2 processing order."""

from datetime import datetime
from typing import Any

from app.repositories.memory_backend import MemoryBackend
from app.schemas.internal.models import GeoEventsCreated
from app.schemas.requests.ingest_request import IngestRequest, PingRequest, RawGeofenceEventRequest
from app.schemas.responses.ingest_response import (
    GeoEventsCreatedResponse,
    IngestDataResponse,
    IngestSummaryResponse,
)
from app.services.entity_service import EntityService
from app.services.geofence_engine import GeofenceEngine


def _parse_iso_datetime(value: str) -> datetime:
    normalized = value.replace("Z", "+00:00")
    return datetime.fromisoformat(normalized)


class IngestService:
    def __init__(
        self,
        backend: MemoryBackend,
        entity_service: EntityService,
        geofence_engine: GeofenceEngine,
    ) -> None:
        self._backend = backend
        self._entity_service = entity_service
        self._geofence_engine = geofence_engine

    async def process(self, payload: IngestRequest) -> IngestDataResponse:
        if payload.user_name or payload.user_email:
            await self._backend.upsert_user_profile(
                payload.user_id,
                user_name=payload.user_name,
                user_email=payload.user_email,
            )

        entities_upserted = 0
        if payload.entities is not None:
            entities_upserted = await self._entity_service.sync_user_entities(
                payload.user_id,
                payload.entities,
            )
        events_stored = await self._store_raw_events(
            user_id=payload.user_id,
            device_id=payload.device_id,
            events=payload.events,
        )

        pings_received = len(payload.pings)
        pings_stored = 0
        pings_duplicate = 0
        geo_totals = GeoEventsCreated()

        sorted_pings = sorted(payload.pings, key=lambda p: p.recorded_at)
        for ping_req in sorted_pings:
            stored, duplicate, created = await self._process_one_ping(
                user_id=payload.user_id,
                device_id=payload.device_id,
                ping_req=ping_req,
            )
            if stored:
                pings_stored += 1
            if duplicate:
                pings_duplicate += 1
            geo_totals.station_enter += created.station_enter
            geo_totals.station_exit += created.station_exit
            geo_totals.amenity_enter += created.amenity_enter
            geo_totals.amenity_exit += created.amenity_exit

        geofence_config = await self._entity_service.get_geofence_config(payload.user_id)
        summary = IngestSummaryResponse(
            entities_upserted=entities_upserted,
            pings_received=pings_received,
            pings_stored=pings_stored,
            pings_duplicate=pings_duplicate,
            events_received=len(payload.events),
            events_stored=events_stored,
            geo_events_created=GeoEventsCreatedResponse(
                station_enter=geo_totals.station_enter,
                station_exit=geo_totals.station_exit,
                amenity_enter=geo_totals.amenity_enter,
                amenity_exit=geo_totals.amenity_exit,
            ),
        )
        return IngestDataResponse(geofence_config=geofence_config, ingest_summary=summary)

    async def _store_raw_events(
        self,
        *,
        user_id: str,
        device_id: str | None,
        events: list[RawGeofenceEventRequest],
    ) -> int:
        stored = 0
        for event in events:
            ok = await self._backend.insert_raw_event(
                user_id=user_id,
                device_id=device_id,
                client_event_id=event.client_event_id,
                entity_type=event.entity_type,
                entity_id=event.entity_id,
                action=event.action,
                recorded_at=_parse_iso_datetime(event.recorded_at),
                latitude=event.latitude,
                longitude=event.longitude,
                accuracy_meters=event.accuracy,
                delivery_mode=event.delivery_mode,
                was_terminated=event.was_terminated,
                coordinates_adjusted=event.coordinates_adjusted,
                extras=event.extras,
            )
            if ok:
                stored += 1
        return stored

    async def _process_one_ping(
        self,
        *,
        user_id: str,
        device_id: str | None,
        ping_req: PingRequest,
    ) -> tuple[bool, bool, GeoEventsCreated]:
        context: dict[str, Any] | None = None
        if ping_req.context is not None:
            if hasattr(ping_req.context, "model_dump"):
                context = ping_req.context.model_dump(exclude_none=True)
            else:
                context = ping_req.context

        recorded = await self._backend.insert_ping(
            user_id=user_id,
            device_id=device_id,
            client_ping_id=ping_req.client_ping_id,
            recorded_at=_parse_iso_datetime(ping_req.recorded_at),
            latitude=ping_req.latitude,
            longitude=ping_req.longitude,
            accuracy_meters=ping_req.accuracy,
            altitude=ping_req.altitude,
            speed_mps=ping_req.speed,
            heading=ping_req.heading,
            is_moving=ping_req.is_moving,
            ping_reason=ping_req.ping_reason,
            context=context,
        )
        if recorded is None:
            return False, True, GeoEventsCreated()

        created = await self._geofence_engine.process_ping(
            user_id=user_id,
            device_id=device_id,
            ping=recorded,
        )
        return True, False, created
