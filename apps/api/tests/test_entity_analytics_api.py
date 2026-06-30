"""Entity analytics API tests."""

from fastapi.testclient import TestClient


def _seed_station_visit(client: TestClient) -> str:
    station_id = "STATION_VISIT_001"
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": "visit_user_a",
            "user_name": "Alice",
            "user_email": "alice@test.com",
            "entities": [
                {
                    "id": station_id,
                    "entity_type": "station",
                    "name": "Visit Test Station",
                    "latitude": 17.4474,
                    "longitude": 78.381,
                    "radius_meters": 70,
                },
                {
                    "id": "AMENITY_VISIT_1",
                    "entity_type": "amenity",
                    "parent_id": station_id,
                    "name": "Test Cafe",
                    "latitude": 17.4475,
                    "longitude": 78.3811,
                    "radius_meters": 30,
                    "amenity_type": "CSTORE",
                },
            ],
            "pings": [
                {
                    "client_ping_id": "v-ping-enter",
                    "recorded_at": "2026-06-24T10:00:00Z",
                    "latitude": 17.4475,
                    "longitude": 78.3812,
                },
                {
                    "client_ping_id": "v-ping-exit",
                    "recorded_at": "2026-06-24T10:30:00Z",
                    "latitude": 17.45,
                    "longitude": 78.39,
                },
            ],
        },
    )
    return station_id


def test_stations_catalog(client: TestClient) -> None:
    station_id = _seed_station_visit(client)
    response = client.get("/api/v1/analytics/stations/catalog")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["total_stations"] >= 1
    station = next(s for s in data["stations"] if s["station"]["entity_id"] == station_id)
    assert station["station"]["name"] == "Visit Test Station"
    assert len(station["amenities"]) == 1
    assert station["station"]["total_enters"] >= 1


def test_entity_analytics_detail(client: TestClient) -> None:
    station_id = _seed_station_visit(client)
    response = client.get(f"/api/v1/analytics/entities/{station_id}/analytics")
    assert response.status_code == 200
    data = response.json()["data"]
    assert data["entity_id"] == station_id
    assert data["unique_visitors"] >= 1
    assert len(data["user_visits"]) >= 1
    assert data["user_visits"][0]["user_name"] == "Alice"
