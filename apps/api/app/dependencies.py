from fastapi import Request

from app.config import Settings, get_settings
from app.repositories.memory_backend import MemoryBackend
from app.services.analytics_service import AnalyticsService
from app.services.entity_analytics_service import EntityAnalyticsService
from app.services.entity_service import EntityService
from app.services.geofence_engine import GeofenceEngine
from app.services.ingest_service import IngestService
from app.services.session_service import SessionService


def get_backend(request: Request) -> MemoryBackend:
    return request.app.state.backend


def get_settings_dep() -> Settings:
    return get_settings()


def get_entity_service(request: Request) -> EntityService:
    backend = get_backend(request)
    settings = get_settings()
    return EntityService(backend, settings)


def get_session_service(request: Request) -> SessionService:
    return SessionService(get_backend(request))


def get_geofence_engine(request: Request) -> GeofenceEngine:
    return GeofenceEngine(get_backend(request), get_session_service(request))


def get_ingest_service(request: Request) -> IngestService:
    return IngestService(
        get_backend(request),
        get_entity_service(request),
        get_geofence_engine(request),
    )


def get_analytics_service(request: Request) -> AnalyticsService:
    return AnalyticsService(get_backend(request))


def get_entity_analytics_service(request: Request) -> EntityAnalyticsService:
    return EntityAnalyticsService(get_backend(request))
