from fastapi import FastAPI
from app.api.routes.health import router as health_router
from app.database import engine, Base

# ── Création des tables au démarrage ────────────────────────
Base.metadata.create_all(bind=engine)

# ── Application FastAPI ──────────────────────────────────────
app = FastAPI(
    title="DataPulse API",
    description="ETL pipeline and analytics API with NLP processing.",
    version="0.1.0",
)

# ── Routes ───────────────────────────────────────────────────
app.include_router(health_router, prefix="/api/v1", tags=["Health"])


@app.get("/")
def root():
    return {
        "service": "DataPulse API",
        "version": "0.1.0",
        "docs": "/docs",
    }