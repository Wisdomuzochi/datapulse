from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class IngestRequest(BaseModel):
    source_name: str = Field(..., min_length=2, max_length=100, example="google_reviews")
    source_type: str = Field(default="text", example="text")
    text: str = Field(..., min_length=5, max_length=5000, example="Ce produit est vraiment excellent !")


class IngestResponse(BaseModel):
    record_id: int
    status:    str
    task_id:   str
    message:   str


# ── Nouveaux schémas pour /results ──────────────────────────

class RecordOut(BaseModel):
    """Représente un record dans la réponse."""
    id:               int
    source_name:      str
    raw_text:         str
    status:           str
    sentiment_label:  Optional[str]
    sentiment_score:  Optional[float]
    created_at:       datetime
    processed_at:     Optional[datetime]

    class Config:
        from_attributes = True


class ResultsResponse(BaseModel):
    """Réponse paginée de /results."""
    total:   int
    limit:   int
    offset:  int
    records: list[RecordOut]