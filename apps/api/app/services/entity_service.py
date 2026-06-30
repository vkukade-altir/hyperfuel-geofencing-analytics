"""Entity sync and geofence_config — per-user full replace on ingest."""

from app.config import Settings
from app.repositories.memory_backend import MemoryBackend
from app.schemas.internal.models import EntityRecord, GeofenceConfigItem
from app.schemas.requests.ingest_request import EntityRequest


class EntityService:
    def __init__(self, backend: MemoryBackend, settings: Settings) -> None:
        self._backend = backend
        self._settings = settings

    async def sync_user_entities(self, user_id: str, entities: list[EntityRequest]) -> int:
        """
        Replace user's entity set with payload from mobile.
        Mobile CORE catalog refresh is source of truth for ping geometry checks.
        """
        await self._backend.delete_user_entities(user_id)

        stations = [e for e in entities if e.entity_type == "station"]
        amenities = [e for e in entities if e.entity_type == "amenity"]
        count = 0
        for item in stations:
            await self._backend.upsert_entity(self._to_record(item, user_id))
            count += 1
        for item in amenities:
            await self._backend.upsert_entity(self._to_record(item, user_id))
            count += 1
        return count

    def _to_record(self, item: EntityRequest, user_id: str) -> EntityRecord:
        radius = item.radius_meters
        if item.entity_type == "station" and radius is None:
            radius = self._settings.default_station_radius_meters
        if radius is None:
            radius = self._settings.default_station_radius_meters
        return EntityRecord(
            id=item.id,
            user_id=user_id,
            entity_type=item.entity_type,
            parent_id=item.parent_id,
            name=item.name,
            latitude=item.latitude,
            longitude=item.longitude,
            radius_meters=radius,
            geometry_type=item.geometry_type,
            polygon=item.polygon,
            amenity_type=item.amenity_type,
            is_active=item.is_active,
            metadata=item.metadata,
        )

    async def get_geofence_config(self, user_id: str) -> list[GeofenceConfigItem]:
        return await self._backend.list_geofence_config(user_id)
