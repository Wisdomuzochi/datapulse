from celery import Celery
from app.config import settings

celery_app = Celery(
    "datapulse",
    broker=settings.redis_url,
    backend=settings.redis_url,
)

celery_app.conf.update(
    broker_connection_retry_on_startup=True,
)


@celery_app.task(name="worker.tasks.process_record")
def process_record(record_id: int) -> dict:
    """
    Tâche principale du pipeline DataPulse :
    1. Récupère le record depuis PostgreSQL
    2. Lance l'analyse de sentiment (DistilBERT)
    3. Met à jour le record avec les résultats
    """
    from datetime import datetime
    from app.database import SessionLocal
    from app.models import PipelineRecord, RecordStatus

    db = SessionLocal()

    try:
        # ── 1. Récupère le record ────────────────────────────
        record = db.query(PipelineRecord).filter(
            PipelineRecord.id == record_id
        ).first()

        if not record:
            return {"error": f"Record {record_id} not found"}

        # ── 2. Passe en statut "processing" ──────────────────
        record.status = RecordStatus.processing
        db.commit()

        # ── 3. Analyse de sentiment (BERT multilingue, supporte le français) ──
        from transformers import pipeline

        sentiment_pipeline = pipeline(
            "sentiment-analysis",
            model="nlptown/bert-base-multilingual-uncased-sentiment",
        )

        result = sentiment_pipeline(record.raw_text[:512])[0]

        # Le modèle retourne "1 star" … "5 stars" — on mappe vers NEGATIVE/NEUTRAL/POSITIVE
        stars = int(result["label"][0])
        if stars <= 2:
            sentiment_label = "NEGATIVE"
        elif stars == 3:
            sentiment_label = "NEUTRAL"
        else:
            sentiment_label = "POSITIVE"

        # ── 4. Met à jour le record avec les résultats ────────
        record.sentiment_label = sentiment_label
        record.sentiment_score = round(result["score"], 4)
        record.status          = RecordStatus.completed
        record.processed_at    = datetime.utcnow()
        db.commit()

        return {
            "record_id":       record_id,
            "sentiment_label": record.sentiment_label,
            "sentiment_score": record.sentiment_score,
            "status":          "completed",
        }

    except Exception as e:
        # ── En cas d'erreur : marque le record comme "failed" ─
        record.status = RecordStatus.failed
        db.commit()
        return {"error": str(e)}

    finally:
        db.close()