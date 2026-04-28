import enum
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text,
    Float, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship
from app.database import Base


# ── Enumération des statuts possibles d'un enregistrement ───
class RecordStatus(enum.Enum):
    pending    = "pending"
    processing = "processing"
    completed  = "completed"
    failed     = "failed"


# ── Table 1 : Sources de données ────────────────────────────
class DataSource(Base):
    __tablename__ = "data_sources"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String(100), nullable=False, unique=True)
    source_type= Column(String(50), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relation vers les enregistrements
    records = relationship("PipelineRecord", back_populates="source")

    def __repr__(self):
        return f"<DataSource name={self.name} type={self.source_type}>"


# ── Table 2 : Enregistrements du pipeline ───────────────────
class PipelineRecord(Base):
    __tablename__ = "pipeline_records"

    id               = Column(Integer, primary_key=True, index=True)
    source_id        = Column(Integer, ForeignKey("data_sources.id"), nullable=False)
    raw_text         = Column(Text, nullable=False)
    status           = Column(Enum(RecordStatus), default=RecordStatus.pending)
    sentiment_label  = Column(String(20), nullable=True)
    sentiment_score  = Column(Float, nullable=True)
    created_at       = Column(DateTime, default=datetime.utcnow)
    processed_at     = Column(DateTime, nullable=True)

    # Relation inverse vers la source
    source = relationship("DataSource", back_populates="records")

    def __repr__(self):
        return f"<PipelineRecord id={self.id} status={self.status}>"