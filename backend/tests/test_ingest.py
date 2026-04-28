from unittest.mock import patch, MagicMock


def test_ingest_returns_201(client):
    """L'ingestion d'un texte valide doit retourner 200."""
    with patch("app.api.routes.ingest.process_record") as mock_task:
        mock_task.delay.return_value = MagicMock(id="fake-task-id")

        response = client.post(
            "/api/v1/ingest",
            json={
                "source_name": "test_source",
                "text": "Ce produit est vraiment excellent !",
            },
        )

    assert response.status_code == 200


def test_ingest_response_structure(client):
    """La réponse doit contenir record_id, status, task_id, message."""
    with patch("app.api.routes.ingest.process_record") as mock_task:
        mock_task.delay.return_value = MagicMock(id="fake-task-id")

        response = client.post(
            "/api/v1/ingest",
            json={
                "source_name": "test_source",
                "text": "Ce produit est vraiment excellent !",
            },
        )

    data = response.json()
    assert "record_id" in data
    assert "status" in data
    assert "task_id" in data
    assert "message" in data


def test_ingest_status_is_pending(client):
    """Le statut initial doit être 'pending'."""
    with patch("app.api.routes.ingest.process_record") as mock_task:
        mock_task.delay.return_value = MagicMock(id="fake-task-id")

        response = client.post(
            "/api/v1/ingest",
            json={
                "source_name": "test_source",
                "text": "Ce produit est vraiment excellent !",
            },
        )

    assert response.json()["status"] == "pending"


def test_ingest_rejects_short_text(client):
    """Un texte trop court doit être rejeté avec une erreur 422."""
    response = client.post(
        "/api/v1/ingest",
        json={
            "source_name": "test_source",
            "text": "Non",
        },
    )

    assert response.status_code == 422


def test_ingest_rejects_missing_text(client):
    """Un payload sans 'text' doit être rejeté avec une erreur 422."""
    response = client.post(
        "/api/v1/ingest",
        json={"source_name": "test_source"},
    )

    assert response.status_code == 422