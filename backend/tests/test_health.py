def test_health_returns_200(client):
    """Le health check doit retourner un statut 200."""
    response = client.get("/api/v1/health")
    assert response.status_code == 200


def test_health_response_structure(client):
    """La réponse doit contenir les champs attendus."""
    response = client.get("/api/v1/health")
    data = response.json()

    assert "status" in data
    assert "uptime_seconds" in data
    assert "database" in data


def test_health_status_is_healthy(client):
    """Le statut doit être 'healthy' quand la BDD répond."""
    response = client.get("/api/v1/health")
    data = response.json()

    assert data["status"] == "healthy"
    assert data["database"] == "healthy"


def test_health_uptime_is_positive(client):
    """L'uptime doit être un nombre positif."""
    response = client.get("/api/v1/health")
    data = response.json()

    assert data["uptime_seconds"] >= 0