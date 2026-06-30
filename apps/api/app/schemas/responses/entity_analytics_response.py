"""Entity-centric analytics models — station/amenity visit stats for offer placement."""

from datetime import datetime

from pydantic import BaseModel, Field


class EntityStatsSummary(BaseModel):
    """Aggregated visit metrics for one station or amenity (across all users)."""

    entity_id: str
    entity_type: str
    name: str
    parent_id: str | None = None
    amenity_type: str | None = None
    latitude: float | None = None
    longitude: float | None = None
    radius_meters: int | None = None
    total_enters: int = 0
    total_exits: int = 0
    unique_visitors: int = 0
    completed_sessions: int = 0
    open_sessions: int = 0
    total_dwell_seconds: int = 0
    avg_dwell_seconds: float | None = None
    median_dwell_seconds: int | None = None


class StationWithAmenities(BaseModel):
    """Station row with nested amenity stats — leadership foot-traffic view."""

    station: EntityStatsSummary
    amenities: list[EntityStatsSummary] = Field(default_factory=list)


class StationsCatalogData(BaseModel):
    """Hierarchical station → amenity catalog with visit stats."""

    stations: list[StationWithAmenities]
    total_stations: int
    total_amenities: int


class UserVisitSessionRow(BaseModel):
    """One dwell session for a user at an entity."""

    session_id: str
    entered_at: datetime
    exited_at: datetime | None = None
    dwell_seconds: int | None = None
    is_open: bool = False


class UserEntityVisitRow(BaseModel):
    """Per-user visit breakdown at one entity."""

    user_id: str
    user_name: str | None = None
    user_email: str | None = None
    enter_count: int = 0
    exit_count: int = 0
    completed_visits: int = 0
    open_visits: int = 0
    total_dwell_seconds: int = 0
    avg_dwell_seconds: float | None = None
    sessions: list[UserVisitSessionRow] = Field(default_factory=list)


class EntityAnalyticsDetail(EntityStatsSummary):
    """Full drill-down for one entity — users, dwell, sessions."""

    user_visits: list[UserEntityVisitRow] = Field(default_factory=list)
    child_amenities: list[EntityStatsSummary] = Field(default_factory=list)
