"""Entity-centric visit analytics — stations, amenities, dwell stats (spec Section 8)."""

from collections import defaultdict
from statistics import median

from app.repositories.memory_backend import MemoryBackend
from app.schemas.internal.models import EntityRecord, GeoEventRecord, PresenceSessionRecord
from app.schemas.responses.entity_analytics_response import (
    EntityAnalyticsDetail,
    EntityStatsSummary,
    StationWithAmenities,
    StationsCatalogData,
    UserEntityVisitRow,
    UserVisitSessionRow,
)


def _median_int(values: list[int]) -> int | None:
    if not values:
        return None
    return int(median(values))


def _avg_float(values: list[int]) -> float | None:
    if not values:
        return None
    return round(sum(values) / len(values), 1)


class EntityAnalyticsService:
    """Aggregate geo_events and presence_sessions by entity_id for leadership dashboards."""

    def __init__(self, backend: MemoryBackend) -> None:
        self._backend = backend

    async def _load_aggregate_inputs(
        self,
    ) -> tuple[list[EntityRecord], list[GeoEventRecord], list[PresenceSessionRecord], dict]:
        entities = await self._backend.list_all_entities()
        events = await self._backend.list_all_geo_events()
        sessions = await self._backend.list_all_presence_sessions()
        profiles = await self._backend.list_user_profiles()
        return entities, events, sessions, profiles

    def _canonical_entities(self, entities: list[EntityRecord]) -> dict[str, EntityRecord]:
        """Pick one display row per entity_id (latest name wins by sort on user_id)."""
        by_id: dict[str, EntityRecord] = {}
        for entity in sorted(entities, key=lambda e: e.id):
            by_id[entity.id] = entity
        return by_id

    def _compute_entity_stats(
        self,
        entity_id: str,
        canonical: EntityRecord | None,
        events: list[GeoEventRecord],
        sessions: list[PresenceSessionRecord],
    ) -> EntityStatsSummary:
        entity_events = [e for e in events if e.entity_id == entity_id]
        entity_sessions = [s for s in sessions if s.entity_id == entity_id]
        enters = [e for e in entity_events if e.action == "ENTER"]
        exits = [e for e in entity_events if e.action == "EXIT"]
        visitors = {e.user_id for e in enters}
        completed = [s for s in entity_sessions if s.exited_at is not None]
        open_sess = [s for s in entity_sessions if s.exited_at is None]
        dwells = [s.dwell_seconds for s in completed if s.dwell_seconds is not None]
        total_dwell = sum(dwells)

        return EntityStatsSummary(
            entity_id=entity_id,
            entity_type=canonical.entity_type if canonical else (entity_events[0].entity_type if entity_events else "station"),
            name=canonical.name if canonical else entity_id,
            parent_id=canonical.parent_id if canonical else None,
            amenity_type=canonical.amenity_type if canonical else None,
            latitude=canonical.latitude if canonical else None,
            longitude=canonical.longitude if canonical else None,
            radius_meters=canonical.radius_meters if canonical else None,
            total_enters=len(enters),
            total_exits=len(exits),
            unique_visitors=len(visitors),
            completed_sessions=len(completed),
            open_sessions=len(open_sess),
            total_dwell_seconds=total_dwell,
            avg_dwell_seconds=_avg_float(dwells),
            median_dwell_seconds=_median_int(dwells),
        )

    async def get_stations_catalog(self) -> StationsCatalogData:
        """Stations with nested amenities and cross-user visit stats."""
        entities, events, sessions, _ = await self._load_aggregate_inputs()
        canonical = self._canonical_entities(entities)

        station_ids = sorted(
            eid for eid, e in canonical.items() if e.entity_type == "station"
        )
        amenity_by_parent: dict[str, list[str]] = defaultdict(list)
        for eid, entity in canonical.items():
            if entity.entity_type == "amenity" and entity.parent_id:
                if eid not in amenity_by_parent[entity.parent_id]:
                    amenity_by_parent[entity.parent_id].append(eid)

        stations: list[StationWithAmenities] = []
        total_amenities = 0
        for station_id in station_ids:
            station_stats = self._compute_entity_stats(
                station_id, canonical.get(station_id), events, sessions
            )
            amenity_stats = [
                self._compute_entity_stats(aid, canonical.get(aid), events, sessions)
                for aid in sorted(amenity_by_parent.get(station_id, []))
            ]
            amenity_stats.sort(key=lambda a: a.total_enters, reverse=True)
            total_amenities += len(amenity_stats)
            stations.append(StationWithAmenities(station=station_stats, amenities=amenity_stats))

        stations.sort(key=lambda s: s.station.total_enters, reverse=True)
        return StationsCatalogData(
            stations=stations,
            total_stations=len(stations),
            total_amenities=total_amenities,
        )

    async def get_entity_analytics(self, entity_id: str) -> EntityAnalyticsDetail | None:
        """Per-entity drill-down with per-user visit and dwell breakdown."""
        entities, events, sessions, profiles = await self._load_aggregate_inputs()
        canonical_map = self._canonical_entities(entities)
        canonical = canonical_map.get(entity_id)
        if not canonical:
            has_activity = any(e.entity_id == entity_id for e in events) or any(
                s.entity_id == entity_id for s in sessions
            )
            if not has_activity:
                return None

        stats = self._compute_entity_stats(entity_id, canonical, events, sessions)
        entity_events = [e for e in events if e.entity_id == entity_id]
        entity_sessions = [s for s in sessions if s.entity_id == entity_id]

        sessions_by_user: dict[str, list[PresenceSessionRecord]] = defaultdict(list)
        for session in entity_sessions:
            sessions_by_user[session.user_id].append(session)

        enters_by_user: dict[str, int] = defaultdict(int)
        exits_by_user: dict[str, int] = defaultdict(int)
        for event in entity_events:
            if event.action == "ENTER":
                enters_by_user[event.user_id] += 1
            elif event.action == "EXIT":
                exits_by_user[event.user_id] += 1

        all_user_ids = set(enters_by_user) | set(sessions_by_user)
        user_visits: list[UserEntityVisitRow] = []
        for user_id in sorted(all_user_ids):
            profile = profiles.get(user_id)
            user_sessions = sorted(
                sessions_by_user.get(user_id, []),
                key=lambda s: s.entered_at,
                reverse=True,
            )
            dwells = [
                s.dwell_seconds
                for s in user_sessions
                if s.dwell_seconds is not None
            ]
            completed = [s for s in user_sessions if s.exited_at is not None]
            open_sess = [s for s in user_sessions if s.exited_at is None]
            user_visits.append(
                UserEntityVisitRow(
                    user_id=user_id,
                    user_name=profile.user_name if profile else None,
                    user_email=profile.user_email if profile else None,
                    enter_count=enters_by_user.get(user_id, 0),
                    exit_count=exits_by_user.get(user_id, 0),
                    completed_visits=len(completed),
                    open_visits=len(open_sess),
                    total_dwell_seconds=sum(dwells),
                    avg_dwell_seconds=_avg_float(dwells),
                    sessions=[
                        UserVisitSessionRow(
                            session_id=s.id,
                            entered_at=s.entered_at,
                            exited_at=s.exited_at,
                            dwell_seconds=s.dwell_seconds,
                            is_open=s.exited_at is None,
                        )
                        for s in user_sessions
                    ],
                )
            )

        user_visits.sort(key=lambda u: u.enter_count, reverse=True)

        child_amenities: list[EntityStatsSummary] = []
        if canonical and canonical.entity_type == "station":
            child_ids = sorted(
                eid
                for eid, e in canonical_map.items()
                if e.entity_type == "amenity" and e.parent_id == entity_id
            )
            child_amenities = [
                self._compute_entity_stats(aid, canonical_map.get(aid), events, sessions)
                for aid in child_ids
            ]
            child_amenities.sort(key=lambda a: a.total_enters, reverse=True)

        return EntityAnalyticsDetail(
            **stats.model_dump(),
            user_visits=user_visits,
            child_amenities=child_amenities,
        )
