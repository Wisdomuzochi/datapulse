import os
import pytest
from unittest.mock import patch
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Fournit des valeurs par défaut avant tout import de l'app so that
# pydantic-settings can build Settings() even without a .env file.
os.environ.setdefault("POSTGRES_USER", "test")
os.environ.setdefault("POSTGRES_PASSWORD", "test")
os.environ.setdefault("POSTGRES_DB", "test")
os.environ.setdefault("POSTGRES_HOST", "localhost")
os.environ.setdefault("POSTGRES_PORT", "5432")
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")

import app.main as main_module  # noqa: E402
from app.main import app  # noqa: E402
from app.database import Base, get_db  # noqa: E402

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
