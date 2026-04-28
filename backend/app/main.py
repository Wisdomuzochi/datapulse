from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes.health import router as health_router
from app.api.routes.ingest import router as ingest_router
from app.api.routes.results import router as results_router
from app.database import engine, Base
from prometheus_fastapi_instrumentator import Instrumentator
import app.models


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title="DataPulse API",
    description="ETL pipeline and analytics API with NLP processing.",
    version="0.1.0",
    lifespan=lifespan,
)

# ── CORS ─────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # Au cas où
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Instrumentator().instrument(app).expose(app)

app.include_router(health_router, prefix="/api/v1", tags=["Health"])
app.include_router(ingest_router, prefix="/api/v1", tags=["Pipeline"])
app.include_router(results_router, prefix="/api/v1", tags=["Results"])


@app.get("/")
def root():
    return {
        "service": "DataPulse API",
        "version": "0.1.0",
        "docs": "/docs",
    }