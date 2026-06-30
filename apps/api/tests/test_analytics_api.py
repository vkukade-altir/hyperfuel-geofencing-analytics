"""Analytics API integration tests."""

from fastapi.testclient import TestClient


def _seed_user_data(client: TestClient, user_id: str = "analytics_user") -> None:
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": user_id,
            "user_name": "Test User",
            "user_email": "test@hyperfuel.example",
            "entities": [
                {
                    "id": "STATION_A",
                    "entity_type": "station",
                    "name": "Station Alpha",
                    "latitude": 17.4474,
                    "longitude": 78.381,
                    "radius_meters": 70,
                },
                {
                    "id": "AMENITY_1",
                    "entity_type": "amenity",
                    "parent_id": "STATION_A",
                    "name": "Corner Store",
                    "latitude": 17.4475,
                    "longitude": 78.3811,
                    "radius_meters": 30,
                    "amenity_type": "CSTORE",
                },
            ],
            "pings": [
                {
                    "client_ping_id": "ping-1",
                    "recorded_at": "2026-06-24T10:00:00Z",
                    "latitude": 17.4475,
                    "longitude": 78.3812,
                    "accuracy": 8.0,
                },
                {
                    "client_ping_id": "ping-2",
                    "recorded_at": "2026-06-24T10:05:00Z",
                    "latitude": 17.4475,
                    "longitude": 78.3812,
                    "accuracy": 8.0,
                },
            ],
            "events": [
                {
                    "client_event_id": "os-1",
                    "entity_type": "station",
                    "entity_id": "STATION_A",
                    "action": "ENTER",
                    "recorded_at": "2026-06-24T10:00:05Z",
                }
            ],
        },
    )


def test_analytics_users_list(client: TestClient) -> None:
    _seed_user_data(client)
    response = client.get("/api/v1/analytics/users")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    users = body["data"]
    assert any(u["user_id"] == "analytics_user" for u in users)
    user = next(u for u in users if u["user_id"] == "analytics_user")
    assert user["ping_count"] == 2
    assert user["user_name"] == "Test User"
    assert user["user_email"] == "test@hyperfuel.example"
    assert user["geo_event_count"] >= 1
    assert user["entity_count"] == 2


def test_analytics_user_timeline(client: TestClient) -> None:
    _seed_user_data(client)
    response = client.get("/api/v1/analytics/users/analytics_user/timeline")
    assert response.status_code == 200
    body = response.json()
    data = body["data"]
    assert data["user_id"] == "analytics_user"
    assert data["user_name"] == "Test User"
    assert data["user_email"] == "test@hyperfuel.example"
    assert len(data["pings"]) == 2
    assert len(data["geo_events"]) >= 1
    assert len(data["entities"]) == 2
    assert len(data["raw_device_events"]) == 1
    assert "STATION_A" in data["current_state"]["inside_station_ids"]


def test_analytics_dashboard_summary(client: TestClient) -> None:
    _seed_user_data(client)
    response = client.get("/api/v1/analytics/dashboard/summary")
    assert response.status_code == 200
    body = response.json()
    assert body["data"]["total_pings"] >= 2
    assert body["data"]["unique_users"] >= 1
    assert body["data"]["station_enters"] >= 1


def test_analytics_entities_and_sessions(client: TestClient) -> None:
    _seed_user_data(client)
    entities = client.get("/api/v1/analytics/entities", params={"user_id": "analytics_user"})
    assert entities.status_code == 200
    assert len(entities.json()["data"]) == 2

    sessions = client.get(
        "/api/v1/analytics/presence-sessions",
        params={"user_id": "analytics_user"},
    )
    assert sessions.status_code == 200
    assert len(sessions.json()["data"]) >= 1
