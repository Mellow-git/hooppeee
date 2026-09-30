"""API health and 501 for unimplemented routes."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health_ok(client: TestClient) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "Investigative lead only" in body["disclosure"]


def test_unimplemented_actor_returns_501(client: TestClient) -> None:
    response = client.get("/actors/00000000-0000-0000-0000-000000000001")
    assert response.status_code == 501
    assert "disclosure" in response.json()
