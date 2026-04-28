from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import PipelineRecord, DataSource, RecordStatus
from app.schemas import ResultsResponse, RecordOut

router = APIRouter()


@router.get("/results", response_model=ResultsResponse)
def get_results(
    db:          Session = Depends(get_db),
    source_name: str     = Query(None, description="Filtrer par nom de source"),
    status:      str     = Query(None, description="Filtrer par statut : pending, processing, completed, failed"),
    limit:       int     = Query(10,   ge=1, le=100, description="Nombre de résultats par page"),
    offset:      int     = Query(0,    ge=0,         description="Décalage pour la pagination"),
):
    """
    Récupère les records traités par le pipeline NLP.
    Supporte le filtrage par source et par statut, avec pagination.
    """

    # ── Requête de base avec jointure sur DataSource ─────────
    query = db.query(PipelineRecord).options(
        joinedload(PipelineRecord.source)
    )

    # ── Filtre optionnel par source_name ─────────────────────
    if source_name:
        query = query.join(DataSource).filter(
            DataSource.name == source_name
        )

    # ── Filtre optionnel par status ───────────────────────────
    if status:
        try:
            status_enum = RecordStatus[status]
            query = query.filter(PipelineRecord.status == status_enum)
        except KeyError:
            pass  # Statut invalide ignoré silencieusement

    # ── Total avant pagination ────────────────────────────────
    total = query.count()

    # ── Pagination ────────────────────────────────────────────
    records = query.order_by(
        PipelineRecord.created_at.desc()
    ).offset(offset).limit(limit).all()

    # ── Sérialisation manuelle (jointure ORM) ─────────────────
    records_out = [
        RecordOut(
            id=r.id,
            source_name=r.source.name,
            raw_text=r.raw_text,
            status=r.status.value,
            sentiment_label=r.sentiment_label,
            sentiment_score=r.sentiment_score,
            created_at=r.created_at,
            processed_at=r.processed_at,
        )
        for r in records
    ]

    return ResultsResponse(
        total=total,
        limit=limit,
        offset=offset,
        records=records_out,
    )