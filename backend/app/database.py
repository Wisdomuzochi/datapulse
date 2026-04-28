from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from app.config import settings

# ── Connexion à PostgreSQL ───────────────────────────────────
engine = create_engine(settings.database_url)

# ── Fabrique de sessions ─────────────────────────────────────
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# ── Classe de base pour les modèles ─────────────────────────
class Base(DeclarativeBase):
    pass


# ── Dépendance FastAPI ────────────────────────────────────────
def get_db():
    """
    Générateur de session de base de données.
    Utilisé comme dépendance dans les routes FastAPI.
    Garantit que la session est fermée après chaque requête.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()