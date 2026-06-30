import os

os.environ.setdefault("USE_MEMORY_STORE", "true")

import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.repositories.memory_backend import MemoryBackend
from app.schemas.internal.models import EntityRecord
from app.services.geofence_engine import GeofenceEngine
from app.services.session_service import SessionService


@pytest.fixture
def backend() -> MemoryBackend:
    return MemoryBackend()


@pytest.fixture
def engine(backend: MemoryBackend) -> GeofenceEngine:
    return GeofenceEngine(backend, SessionService(backend))


@pytest.fixture
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


STATION_001 = EntityRecord(
    id="STATION_001",
    user_id="user_test",
    entity_type="station",
    name="Test Station",
    latitude=17.4474,
    longitude=78.381,
    radius_meters=70,
)

STATION_A = EntityRecord(
    id="STATION_A",
    user_id="user_test",
    entity_type="station",
    name="Station A",
    latitude=17.44,
    longitude=78.38,
    radius_meters=70,
)

STATION_B = EntityRecord(
    id="STATION_B",
    user_id="user_test",
    entity_type="station",
    name="Station B",
    latitude=17.45,
    longitude=78.39,
    radius_meters=70,
)

AMENITY_CAFE = EntityRecord(
    id="amenity_cafe",
    user_id="user_test",
    entity_type="amenity",
    parent_id="STATION_001",
    name="Cafe",
    latitude=17.4475,
    longitude=78.3813,
    radius_meters=15,
)

AMENITY_STORE = EntityRecord(
    id="amenity_store",
    user_id="user_test",
    entity_type="amenity",
    parent_id="STATION_001",
    name="Store",
    latitude=17.44735,
    longitude=78.38095,
    radius_meters=15,
)
