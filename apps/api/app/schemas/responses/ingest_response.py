from pydantic import BaseModel

from app.schemas.internal.models import GeofenceConfigItem


class GeoEventsCreatedResponse(BaseModel):
    station_enter: int = 0
    station_exit: int = 0
    amenity_enter: int = 0
    amenity_exit: int = 0


class IngestSummaryResponse(BaseModel):
    entities_upserted: int = 0
    pings_received: int = 0
    pings_stored: int = 0
    pings_duplicate: int = 0
    events_received: int = 0
    events_stored: int = 0
    geo_events_created: GeoEventsCreatedResponse


class IngestDataResponse(BaseModel):
    geofence_config: list[GeofenceConfigItem]
    ingest_summary: IngestSummaryResponse


class HealthDataResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    storage_backend: str
    supabase_configured: bool
