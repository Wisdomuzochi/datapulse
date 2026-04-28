import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import app.main as main_module
from app.main import app
from app.database import Base, get_db

# ── Base de données SQLite en mémoire pour les tests ────────
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine_test = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine_test,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


# ── Fixture principale : client de test ─────────────────────
@pytest.fixture(scope="function")
def client():
    Base.metadata.create_all(bind=engine_test)
    app.dependency_overrides[get_db] = override_get_db

    with patch.object(main_module, "engine", engine_test):
        with TestClient(app) as test_client:
            yield test_client

    Base.metadata.drop_all(bind=engine_test)
    app.dependency_overrides.clear()
