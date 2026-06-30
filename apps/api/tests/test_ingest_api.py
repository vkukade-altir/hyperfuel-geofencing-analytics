from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["status"] == "ok"
    assert body["data"]["storage_backend"] == "memory"


def test_ingest_station_enter(client: TestClient) -> None:
    payload = {
        "user_id": "api_user",
        "entities": [
            {
                "id": "STATION_001",
                "entity_type": "station",
                "name": "Test Station",
                "latitude": 17.4474,
                "longitude": 78.381,
                "radius_meters": 70,
            }
        ],
        "pings": [
            {
                "client_ping_id": "api-ping-1",
                "recorded_at": "2026-06-24T10:01:00Z",
                "latitude": 17.4475,
                "longitude": 78.3812,
                "accuracy": 10.0,
            }
        ],
    }
    response = client.post("/api/v1/ingest", json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["data"]["ingest_summary"]["geo_events_created"]["station_enter"] == 1
    assert len(body["data"]["geofence_config"]) == 1


def test_duplicate_ping_id(client: TestClient) -> None:
    payload = {
        "user_id": "api_user_dup",
        "entities": [
            {
                "id": "STATION_001",
                "entity_type": "station",
                "name": "Test Station",
                "latitude": 17.4474,
                "longitude": 78.381,
                "radius_meters": 70,
            }
        ],
        "pings": [
            {
                "client_ping_id": "dup-ping",
                "recorded_at": "2026-06-24T10:01:00Z",
                "latitude": 17.4475,
                "longitude": 78.3812,
            },
            {
                "client_ping_id": "dup-ping",
                "recorded_at": "2026-06-24T10:01:30Z",
                "latitude": 17.4475,
                "longitude": 78.3812,
            },
        ],
    }
    response = client.post("/api/v1/ingest", json=payload)
    body = response.json()
    assert body["data"]["ingest_summary"]["pings_stored"] == 1
    assert body["data"]["ingest_summary"]["pings_duplicate"] == 1
    assert body["data"]["ingest_summary"]["geo_events_created"]["station_enter"] == 1


def test_geofence_config_endpoint(client: TestClient) -> None:
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": "cfg_user",
            "entities": [
                {
                    "id": "STATION_CFG",
                    "entity_type": "station",
                    "name": "Cfg Station",
                    "latitude": 17.4474,
                    "longitude": 78.381,
                }
            ],
        },
    )
    response = client.get("/api/v1/geofence-config", params={"user_id": "cfg_user"})
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert any(item["identifier"] == "STATION_CFG" for item in body["data"])


def test_per_user_entity_isolation(client: TestClient) -> None:
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": "user_a",
            "entities": [
                {
                    "id": "STATION_A",
                    "entity_type": "station",
                    "name": "Station A",
                    "latitude": 17.4474,
                    "longitude": 78.381,
                }
            ],
        },
    )
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": "user_b",
            "entities": [
                {
                    "id": "STATION_B",
                    "entity_type": "station",
                    "name": "Station B",
                    "latitude": 34.0522,
                    "longitude": -118.2437,
                }
            ],
        },
    )

    cfg_a = client.get("/api/v1/geofence-config", params={"user_id": "user_a"}).json()
    cfg_b = client.get("/api/v1/geofence-config", params={"user_id": "user_b"}).json()

    assert [item["identifier"] for item in cfg_a["data"]] == ["STATION_A"]
    assert [item["identifier"] for item in cfg_b["data"]] == ["STATION_B"]


def test_entity_full_replace_on_resync(client: TestClient) -> None:
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": "replace_user",
            "entities": [
                {
                    "id": "STATION_OLD_1",
                    "entity_type": "station",
                    "name": "Old 1",
                    "latitude": 17.4474,
                    "longitude": 78.381,
                },
                {
                    "id": "STATION_OLD_2",
                    "entity_type": "station",
                    "name": "Old 2",
                    "latitude": 17.4484,
                    "longitude": 78.382,
                },
            ],
        },
    )
    client.post(
        "/api/v1/ingest",
        json={
            "user_id": "replace_user",
            "entities": [
                {
                    "id": "STATION_NEW",
                    "entity_type": "station",
                    "name": "New",
                    "latitude": 17.4494,
                    "longitude": 78.383,
                }
            ],
        },
    )

    cfg = client.get("/api/v1/geofence-config", params={"user_id": "replace_user"}).json()
    assert [item["identifier"] for item in cfg["data"]] == ["STATION_NEW"]
