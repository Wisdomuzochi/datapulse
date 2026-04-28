from fastapi import FastAPI
from app.api.routes.health import router as health_router
from app.api.routes.ingest import router as ingest_router
from app.api.routes.results import router as results_router  # ← nouveau
from app.database import engine, Base
import app.models

Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DataPulse API",
    description="ETL pipeline and analytics API with NLP processing.",
    version="0.1.0",
)

app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(ingest_router, prefix="/api/v1", tags=["Pipeline"])
app.include_router(results_router, prefix="/api/v1", tags=["Results"])  # ← nouveau

@app.get("/")
def root():
    return {
        "service": "DataPulse API",
        "version": "0.1.0",
        "docs": "/docs",
    }