"""Response models for analytics read APIs — spec Section 8.4."""

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.schemas.internal.models import (
    EntityRecord,
    GeoEventRecord,
    LocationPingRecord,
    PresenceSessionRecord,
)


class RawDeviceEventItem(BaseModel):
    """OS-level geofence event from geofence_events_raw — observability only."""

    id: str
    user_id: str
    device_id: str | None = None
    client_event_id: str
    entity_type: str
    entity_id: str
    action: str
    recorded_at: datetime
    latitude: float | None = None
    longitude: float | None = None
    accuracy_meters: float | None = None
    delivery_mode: str | None = None
    was_terminated: bool = False
    coordinates_adjusted: bool = False
    extras: dict[str, Any] | None = None


class CurrentStateItem(BaseModel):
    """Live user_geo_state snapshot for debug UI — spec Section 8.4 timeline."""

    inside_station_ids: list[str] = Field(default_factory=list)
    inside_amenity_ids: list[str] = Field(default_factory=list)
    updated_at: datetime | None = None


class UserTimelineData(BaseModel):
    """Full user journey for engineering debug — GET /analytics/users/{user_id}/timeline."""

    user_id: str
    user_name: str | None = None
    user_email: str | None = None
    pings: list[LocationPingRecord]
    geo_events: list[GeoEventRecord]
    raw_device_events: list[RawDeviceEventItem]
    presence_sessions: list[PresenceSessionRecord]
    entities: list[EntityRecord]
    current_state: CurrentStateItem


class UserSummaryItem(BaseModel):
    """Row in the user picker list."""

    user_id: str
    user_name: str | None = None
    user_email: str | None = None
    ping_count: int
    geo_event_count: int
    session_count: int
    open_session_count: int
    entity_count: int
    last_ping_at: datetime | None = None
    last_event_at: datetime | None = None


class PeriodRange(BaseModel):
    from_: datetime = Field(alias="from")
    to: datetime

    model_config = {"populate_by_name": True}


class DashboardSummaryData(BaseModel):
    """Aggregate KPIs — spec Section 8.4 dashboard/summary."""

    period: PeriodRange
    total_pings: int
    unique_users: int
    station_enters: int
    amenity_enters: int
    open_sessions: int
    total_entities: int


class EntityWithLabel(EntityRecord):
    """Entity enriched with parent station name for UI display."""

    parent_name: str | None = None
