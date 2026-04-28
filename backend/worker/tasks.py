from celery import Celery
from app.config import settings

# ── Initialisation de Celery ─────────────────────────────────
celery_app = Celery(
    "datapulse",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

# ── Configuration ────────────────────────────────────────────
celery_app.conf.update(
    broker_connection_retry_on_startup=True,
)


@celery_app.task(name="worker.tasks.simulate_etl")
def simulate_etl(source: str) -> dict:
    """
    Tâche ETL simulée pour valider le pipeline Celery/Redis.
    En Phase 2, cette tâche lira de vraies données et lancera le NLP.
    """
    import time
    import random

    print(f"[ETL] Starting pipeline for source: {source}")
    time.sleep(2)  # Simule un traitement

    result = {
        "source": source,
        "records_processed": random.randint(100, 1000),
        "status": "completed",
    }

    print(f"[ETL] Pipeline completed: {result}")
    return result