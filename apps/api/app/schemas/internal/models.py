from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field


EntityType = Literal["station", "amenity"]
GeoAction = Literal["ENTER", "EXIT"]


class EntityRecord(BaseModel):
    id: str
    user_id: str
    entity_type: EntityType
    parent_id: str | None = None
    name: str
    latitude: float
    longitude: float
    radius_meters: int = 70
    geometry_type: str = "circle"
    polygon: list[Any] | None = None
    amenity_type: str | None = None
    is_active: bool = True
    metadata: dict[str, Any] | None = None


class LocationPingRecord(BaseModel):
    id: str
    user_id: str
    device_id: str | None = None
    client_ping_id: str
    recorded_at: datetime
    received_at: datetime
    latitude: float
    longitude: float
    accuracy_meters: float | None = None
    altitude: float | None = None
    speed_mps: float | None = None
    heading: float | None = None
    is_moving: bool | None = None
    ping_reason: str | None = None
    context: dict[str, Any] | None = None


class GeoEventRecord(BaseModel):
    id: str
    user_id: str
    device_id: str | None = None
    entity_type: EntityType
    entity_id: str
    station_id: str | None = None
    action: GeoAction
    occurred_at: datetime
    source: str = "server_ping"
    source_ping_id: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    accuracy_meters: float | None = None
    created_at: datetime


class UserGeoStateRecord(BaseModel):
    user_id: str
    inside_station_ids: list[str] = Field(default_factory=list)
    inside_amenity_ids: list[str] = Field(default_factory=list)
    updated_at: datetime


class PresenceSessionRecord(BaseModel):
    id: str
    user_id: str
    entity_type: EntityType
    entity_id: str
    station_id: str | None = None
    entered_at: datetime
    exited_at: datetime | None = None
    dwell_seconds: int | None = None
    enter_event_id: str | None = None
    exit_event_id: str | None = None
    created_at: datetime


class GeoEventsCreated(BaseModel):
    """Counts of geo_events written during one ping processing cycle."""

    station_enter: int = 0
    station_exit: int = 0
    amenity_enter: int = 0
    amenity_exit: int = 0

    def increment(self, entity_type: EntityType, action: GeoAction) -> None:
        key = f"{entity_type}_{action.lower()}"
        if key == "station_enter":
            self.station_enter += 1
        elif key == "station_exit":
            self.station_exit += 1
        elif key == "amenity_enter":
            self.amenity_enter += 1
        elif key == "amenity_exit":
            self.amenity_exit += 1


class GeofenceConfigItem(BaseModel):
    identifier: str
    latitude: float
    longitude: float
    radius: int


class AppUserRecord(BaseModel):
    """HF app user identity — name/email from mobile ingest for analytics UI."""

    user_id: str
    user_name: str | None = None
    user_email: str | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None
