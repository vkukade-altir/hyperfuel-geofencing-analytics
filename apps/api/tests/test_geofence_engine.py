from datetime import datetime, timezone

import pytest

from app.repositories.memory_backend import MemoryBackend
from app.services.geofence_engine import GeofenceEngine
from app.services.session_service import SessionService
from tests.conftest import AMENITY_CAFE, AMENITY_STORE, STATION_001, STATION_A, STATION_B


@pytest.mark.asyncio
async def test_first_ping_inside_station() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    engine = GeofenceEngine(backend, SessionService(backend))

    record = await backend.insert_ping(
        user_id="user_test",
        device_id=None,
        client_ping_id="p1",
        recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
        latitude=17.4475,
        longitude=78.3812,
        accuracy_meters=10.0,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=False,
        ping_reason="STATION_POLL",
        context=None,
    )
    counts = await engine.process_ping(user_id="user_test", device_id=None, ping=record)
    assert counts.station_enter == 1
    assert counts.station_exit == 0


@pytest.mark.asyncio
async def test_second_ping_still_inside() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    engine = GeofenceEngine(backend, SessionService(backend))

    for i, lat in enumerate([17.4475, 17.4476]):
        record = await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id=f"p{i}",
            recorded_at=datetime(2026, 6, 24, 10, 1, i, tzinfo=timezone.utc),
            latitude=lat,
            longitude=78.3812,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        )
        counts = await engine.process_ping(user_id="user_test", device_id=None, ping=record)
    assert counts.station_enter == 0
    assert counts.station_exit == 0


@pytest.mark.asyncio
async def test_ping_outside_after_inside() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    engine = GeofenceEngine(backend, SessionService(backend))

    inside = await backend.insert_ping(
        user_id="user_test",
        device_id=None,
        client_ping_id="p1",
        recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
        latitude=17.4475,
        longitude=78.3812,
        accuracy_meters=10.0,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=False,
        ping_reason="STATION_POLL",
        context=None,
    )
    await engine.process_ping(user_id="user_test", device_id=None, ping=inside)

    outside = await backend.insert_ping(
        user_id="user_test",
        device_id=None,
        client_ping_id="p2",
        recorded_at=datetime(2026, 6, 24, 10, 2, 0, tzinfo=timezone.utc),
        latitude=17.44,
        longitude=78.38,
        accuracy_meters=10.0,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=False,
        ping_reason="STATION_POLL",
        context=None,
    )
    counts = await engine.process_ping(user_id="user_test", device_id=None, ping=outside)
    assert counts.station_exit == 1


@pytest.mark.asyncio
async def test_amenity_enter() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    await backend.upsert_entity(AMENITY_CAFE)
    engine = GeofenceEngine(backend, SessionService(backend))

    station_ping = await backend.insert_ping(
        user_id="user_test",
        device_id=None,
        client_ping_id="p1",
        recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
        latitude=17.4474,
        longitude=78.381,
        accuracy_meters=10.0,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=False,
        ping_reason="STATION_POLL",
        context=None,
    )
    await engine.process_ping(user_id="user_test", device_id=None, ping=station_ping)

    cafe_ping = await backend.insert_ping(
        user_id="user_test",
        device_id=None,
        client_ping_id="p2",
        recorded_at=datetime(2026, 6, 24, 10, 1, 30, tzinfo=timezone.utc),
        latitude=17.4475,
        longitude=78.3813,
        accuracy_meters=10.0,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=False,
        ping_reason="STATION_POLL",
        context=None,
    )
    counts = await engine.process_ping(user_id="user_test", device_id=None, ping=cafe_ping)
    assert counts.amenity_enter == 1


@pytest.mark.asyncio
async def test_amenity_switch() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    await backend.upsert_entity(AMENITY_CAFE)
    await backend.upsert_entity(AMENITY_STORE)
    engine = GeofenceEngine(backend, SessionService(backend))

    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p1",
            recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
            latitude=17.4474,
            longitude=78.381,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p2",
            recorded_at=datetime(2026, 6, 24, 10, 1, 30, tzinfo=timezone.utc),
            latitude=17.4475,
            longitude=78.3813,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    counts = await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p3",
            recorded_at=datetime(2026, 6, 24, 10, 2, 0, tzinfo=timezone.utc),
            latitude=17.44735,
            longitude=78.38095,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    assert counts.amenity_exit == 1
    assert counts.amenity_enter == 1


@pytest.mark.asyncio
async def test_station_exit_forces_amenity_exit() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    await backend.upsert_entity(AMENITY_CAFE)
    engine = GeofenceEngine(backend, SessionService(backend))

    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p1",
            recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
            latitude=17.4474,
            longitude=78.381,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p2",
            recorded_at=datetime(2026, 6, 24, 10, 1, 30, tzinfo=timezone.utc),
            latitude=17.4475,
            longitude=78.3813,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    counts = await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p3",
            recorded_at=datetime(2026, 6, 24, 10, 2, 0, tzinfo=timezone.utc),
            latitude=17.44,
            longitude=78.38,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    assert counts.station_exit == 1
    assert counts.amenity_exit == 1


@pytest.mark.asyncio
async def test_station_handoff() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_A)
    await backend.upsert_entity(STATION_B)
    engine = GeofenceEngine(backend, SessionService(backend))

    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p1",
            recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
            latitude=17.44,
            longitude=78.38,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    counts = await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p2",
            recorded_at=datetime(2026, 6, 24, 10, 2, 0, tzinfo=timezone.utc),
            latitude=17.45,
            longitude=78.39,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    assert counts.station_exit == 1
    assert counts.station_enter == 1


@pytest.mark.asyncio
async def test_enter_opens_session() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    engine = GeofenceEngine(backend, SessionService(backend))

    ping = await backend.insert_ping(
        user_id="user_test",
        device_id=None,
        client_ping_id="p1",
        recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
        latitude=17.4475,
        longitude=78.3812,
        accuracy_meters=10.0,
        altitude=None,
        speed_mps=None,
        heading=None,
        is_moving=False,
        ping_reason="STATION_POLL",
        context=None,
    )
    await engine.process_ping(user_id="user_test", device_id=None, ping=ping)
    open_sessions = [s for s in backend.sessions.values() if s.exited_at is None]
    assert len(open_sessions) == 1


@pytest.mark.asyncio
async def test_exit_closes_session() -> None:
    backend = MemoryBackend()
    await backend.upsert_entity(STATION_001)
    engine = GeofenceEngine(backend, SessionService(backend))

    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p1",
            recorded_at=datetime(2026, 6, 24, 10, 1, 0, tzinfo=timezone.utc),
            latitude=17.4474,
            longitude=78.381,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    await engine.process_ping(
        user_id="user_test",
        device_id=None,
        ping=await backend.insert_ping(
            user_id="user_test",
            device_id=None,
            client_ping_id="p2",
            recorded_at=datetime(2026, 6, 24, 10, 2, 0, tzinfo=timezone.utc),
            latitude=17.44,
            longitude=78.38,
            accuracy_meters=10.0,
            altitude=None,
            speed_mps=None,
            heading=None,
            is_moving=False,
            ping_reason="STATION_POLL",
            context=None,
        ),
    )
    closed = [s for s in backend.sessions.values() if s.exited_at is not None]
    assert len(closed) == 1
    assert closed[0].dwell_seconds is not None
