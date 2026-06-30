"""Analytics read service — spec Section 8.4."""

from datetime import datetime, timezone

from app.repositories.memory_backend import MemoryBackend
from app.schemas.responses.analytics_response import (
    CurrentStateItem,
    DashboardSummaryData,
    PeriodRange,
    UserSummaryItem,
    UserTimelineData,
)


class AnalyticsService:
    """Read-only queries for the analytics web dashboard."""

    def __init__(self, backend: MemoryBackend) -> None:
        self._backend = backend

    async def list_users(self) -> list[UserSummaryItem]:
        """Build user picker rows with counts and last-seen timestamps."""
        user_ids = await self._backend.list_user_summaries()
        profiles = await self._backend.list_user_profiles()
        summaries: list[UserSummaryItem] = []
        for user_id in user_ids:
            profile = profiles.get(user_id)
            sessions = await self._backend.list_presence_sessions(user_id=user_id, limit=1000)
            entities = await self._backend.list_user_entities(user_id)
            open_count = sum(1 for s in sessions if s.exited_at is None)
            all_pings = await self._backend.list_user_pings(user_id, limit=10000)
            all_events = await self._backend.list_user_geo_events(user_id, limit=10000)
            last_ping = max((p.recorded_at for p in all_pings), default=None)
            last_event = max((e.occurred_at for e in all_events), default=None)
            summaries.append(
                UserSummaryItem(
                    user_id=user_id,
                    user_name=profile.user_name if profile else None,
                    user_email=profile.user_email if profile else None,
                    ping_count=len(all_pings),
                    geo_event_count=len(all_events),
                    session_count=len(sessions),
                    open_session_count=open_count,
                    entity_count=len(entities),
                    last_ping_at=last_ping,
                    last_event_at=last_event,
                )
            )
        summaries.sort(
            key=lambda u: u.last_ping_at or u.last_event_at or datetime.min.replace(tzinfo=timezone.utc),
            reverse=True,
        )
        return summaries

    async def get_user_timeline(
        self,
        user_id: str,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        limit: int = 500,
    ) -> UserTimelineData:
        """Full debug timeline for one user — pings, events, sessions, state."""
        pings = await self._backend.list_user_pings(
            user_id, from_dt=from_dt, to_dt=to_dt, limit=limit
        )
        geo_events = await self._backend.list_user_geo_events(
            user_id, from_dt=from_dt, to_dt=to_dt, limit=limit
        )
        raw_events = await self._backend.list_user_raw_events(
            user_id, from_dt=from_dt, to_dt=to_dt, limit=limit
        )
        sessions = await self._backend.list_presence_sessions(
            user_id=user_id, from_dt=from_dt, to_dt=to_dt, limit=limit
        )
        entities = await self._backend.list_user_entities(user_id)
        state = await self._backend.get_or_create_user_state(user_id)
        profile = await self._backend.get_user_profile(user_id)
        return UserTimelineData(
            user_id=user_id,
            user_name=profile.user_name if profile else None,
            user_email=profile.user_email if profile else None,
            pings=sorted(pings, key=lambda p: p.recorded_at),
            geo_events=sorted(geo_events, key=lambda e: e.occurred_at),
            raw_device_events=sorted(raw_events, key=lambda e: e.recorded_at),
            presence_sessions=sorted(sessions, key=lambda s: s.entered_at),
            entities=entities,
            current_state=CurrentStateItem(
                inside_station_ids=state.inside_station_ids,
                inside_amenity_ids=state.inside_amenity_ids,
                updated_at=state.updated_at,
            ),
        )

    async def get_dashboard_summary(
        self,
        *,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
    ) -> DashboardSummaryData:
        """Aggregate KPIs across all users for the dashboard home page."""
        now = datetime.now(timezone.utc)
        period_from = from_dt or datetime(1970, 1, 1, tzinfo=timezone.utc)
        period_to = to_dt or now
        user_ids = await self._backend.list_user_summaries()
        entities = await self._backend.list_all_entities()
        return DashboardSummaryData(
            period=PeriodRange.model_validate({"from": period_from, "to": period_to}),
            total_pings=await self._backend.count_pings(from_dt=from_dt, to_dt=to_dt),
            unique_users=len(user_ids),
            station_enters=await self._backend.count_geo_events(
                entity_type="station", action="ENTER", from_dt=from_dt, to_dt=to_dt
            ),
            amenity_enters=await self._backend.count_geo_events(
                entity_type="amenity", action="ENTER", from_dt=from_dt, to_dt=to_dt
            ),
            open_sessions=await self._backend.count_open_sessions(),
            total_entities=len(entities),
        )

    async def list_entities(self, user_id: str | None = None):
        if user_id:
            return await self._backend.list_user_entities(user_id)
        return await self._backend.list_all_entities()

    async def list_sessions(
        self,
        *,
        user_id: str | None = None,
        entity_id: str | None = None,
        from_dt: datetime | None = None,
        to_dt: datetime | None = None,
        open_only: bool = False,
        limit: int = 500,
    ):
        return await self._backend.list_presence_sessions(
            user_id=user_id,
            entity_id=entity_id,
            from_dt=from_dt,
            to_dt=to_dt,
            open_only=open_only,
            limit=limit,
        )
