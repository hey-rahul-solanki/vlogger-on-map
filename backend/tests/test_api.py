from fastapi.testclient import TestClient

from app.main import app


client = TestClient(app)


def test_lists_seeded_destinations() -> None:
    response = client.get("/destinations")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 3
    assert {destination["slug"] for destination in data} >= {"himachal", "japan", "bali"}


def test_destination_places_include_video_backed_social_proof() -> None:
    response = client.get("/destinations/himachal/places")
    assert response.status_code == 200
    data = response.json()
    assert data["destination"]["slug"] == "himachal"
    assert data["places"]
    assert all(place["video_count"] >= 1 for place in data["places"])
    assert all(place["creators"] for place in data["places"])


def test_place_detail_exposes_evidence_and_confidence() -> None:
    response = client.get("/places/place_pinggan")
    assert response.status_code == 200
    data = response.json()
    assert data["scores"]["confidence"] == "likely"
    assert data["mentions"]
    assert data["videos"]


def test_admin_ingest_requires_token() -> None:
    response = client.post(
        "/admin/ingest",
        json={"destination_slug": "bali", "source_urls": ["https://www.youtube.com/watch?v=aqz-KE-bpKQ"]},
    )
    assert response.status_code == 401


def test_admin_ingest_accepts_valid_token() -> None:
    response = client.post(
        "/admin/ingest",
        headers={"x-admin-token": "dev-admin-token"},
        json={"destination_slug": "bali", "source_urls": ["https://www.youtube.com/watch?v=aqz-KE-bpKQ"]},
    )
    assert response.status_code == 200
    assert response.json()["status"] == "queued"

