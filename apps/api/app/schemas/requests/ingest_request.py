from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator, model_validator


class PingContextRequest(BaseModel):
    app_state: str | None = None
    delivery_mode: str | None = None
    battery_level: int | None = None
    battery_charging: bool | None = None
    location_permission: str | None = None
    location_services_enabled: bool | None = None
    network_type: str | None = None
    sdk_tracking_enabled: bool | None = None
    inside_station_ids: list[str] | None = None
    extras: dict[str, Any] | None = None


class EntityRequest(BaseModel):
    id: str
    entity_type: Literal["station", "amenity"]
    name: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    parent_id: str | None = None
    radius_meters: int | None = Field(default=None, ge=1)
    geometry_type: str = "circle"
    polygon: list[Any] | None = None
    amenity_type: str | None = None
    is_active: bool = True
    metadata: dict[str, Any] | None = None

    @model_validator(mode="after")
    def validate_entity_shape(self) -> "EntityRequest":
        if self.entity_type == "station" and self.parent_id is not None:
            raise ValueError("station entities must not have parent_id")
        if self.entity_type == "amenity" and not self.parent_id:
            raise ValueError("amenity entities require parent_id")
        return self


class PingRequest(BaseModel):
    client_ping_id: str
    recorded_at: str
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    accuracy: float | None = None
    altitude: float | None = None
    speed: float | None = None
    heading: float | None = None
    is_moving: bool | None = None
    ping_reason: str | None = None
    context: PingContextRequest | dict[str, Any] | None = None


class RawGeofenceEventRequest(BaseModel):
    client_event_id: str
    entity_type: Literal["station"] = "station"
    entity_id: str
    action: Literal["ENTER", "EXIT"]
    recorded_at: str
    latitude: float | None = None
    longitude: float | None = None
    accuracy: float | None = None
    delivery_mode: str | None = None
    was_terminated: bool = False
    coordinates_adjusted: bool = False
    extras: dict[str, Any] | None = None


class IngestRequest(BaseModel):
    user_id: str = Field(min_length=1, max_length=128)
    user_name: str | None = Field(default=None, max_length=256)
    user_email: str | None = Field(default=None, max_length=320)
    device_id: str | None = None
    entities: list[EntityRequest] | None = None
    pings: list[PingRequest] = Field(default_factory=list)
    events: list[RawGeofenceEventRequest] = Field(default_factory=list)

    @field_validator("user_id")
    @classmethod
    def strip_user_id(cls, value: str) -> str:
        return value.strip()
