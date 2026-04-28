from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database import get_db
import time

START_TIME = time.time()
router = APIRouter()


@router.get("/health")
def health_check(db: Session = Depends(get_db)):
    """
    Health check complet :
    - Statut de l'API
    - Connexion à la base de données
    - Uptime du service
    """
    # Vérifie que PostgreSQL répond
    try:
        db.execute(text("SELECT 1"))
        db_status = "healthy"
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "healthy",
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "database": db_status,
    }