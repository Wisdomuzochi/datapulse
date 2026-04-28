from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import DataSource, PipelineRecord, RecordStatus
from app.schemas import IngestRequest, IngestResponse
from worker.tasks import process_record

router = APIRouter()


@router.post("/ingest", response_model=IngestResponse)
def ingest(payload: IngestRequest, db: Session = Depends(get_db)):
    """
    Ingère un texte brut, le sauvegarde en BDD
    et déclenche le pipeline NLP en arrière-plan.
    """

    # ── 1. Récupère ou crée la source ───────────────────────
    source = db.query(DataSource).filter(
        DataSource.name == payload.source_name
    ).first()

    if not source:
        source = DataSource(
            name=payload.source_name,
            source_type=payload.source_type,
        )
        db.add(source)
        db.commit()
        db.refresh(source)

    # ── 2. Crée le record en BDD avec statut "pending" ──────
    record = PipelineRecord(
        source_id=source.id,
        raw_text=payload.text,
        status=RecordStatus.pending,
    )
    db.add(record)
    db.commit()
    db.refresh(record)

    # ── 3. Envoie la tâche à Celery ─────────────────────────
    task = process_record.delay(record.id)

    return IngestResponse(
        record_id=record.id,
        status=record.status.value,
        task_id=task.id,
        message="Record ingested successfully. NLP processing started.",
    )