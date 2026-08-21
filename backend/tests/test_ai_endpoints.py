import pytest
from fastapi.testclient import TestClient

def test_copilot_chat_happy_path(client: TestClient, agent_token: str):
    response = client.post(
        "/api/v1/copilot/chat",
        headers={"Authorization": f"Bearer {agent_token}"},
        json={
            "agentId": "agent-123",
            "message": "Find me a flight to Paris",
            "context": {"location": "NYC"}
        }
    )
    # Right now, since AI doesn't fail, it should be 200
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data or "message" in data

def test_copilot_chat_permission_denied(client: TestClient, traveler_token: str):
    response = client.post(
        "/api/v1/copilot/chat",
        headers={"Authorization": f"Bearer {traveler_token}"},
        json={
            "agentId": "agent-123",
            "message": "Find me a flight to Paris",
            "context": {}
        }
    )
    assert response.status_code == 403

def test_copilot_chat_missing_data(client: TestClient, agent_token: str):
    response = client.post(
        "/api/v1/copilot/chat",
        headers={"Authorization": f"Bearer {agent_token}"},
        json={
            # Missing message
            "agentId": "agent-123",
        }
    )
    assert response.status_code == 422

def test_ai_trip_genie_happy_path(client: TestClient):
    response = client.post(
        "/api/v1/ai/trip-genie",
        json={
            "destination": "Paris",
            "dates": {"start": "2026-09-01", "end": "2026-09-10"},
            "budget": "luxury",
            "travelers": 2,
            "preferences": ["art", "food"]
        }
    )
    assert response.status_code == 200

def test_ai_trip_genie_missing_data(client: TestClient):
    response = client.post(
        "/api/v1/ai/trip-genie",
        json={
            "destination": "Paris",
            # Missing fields
        }
    )
    assert response.status_code == 422

def test_ai_local_sense_happy_path(client: TestClient):
    response = client.post(
        "/api/v1/ai/local-sense",
        json={
            "lat": 48.8566,
            "lng": 2.3522,
            "radius": 1000,
            "categories": ["restaurant"]
        }
    )
    assert response.status_code == 200
