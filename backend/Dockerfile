# ── Image de base ───────────────────────────────────────────
FROM python:3.11-slim

# ── Dossier de travail dans le conteneur ────────────────────
WORKDIR /app

# ── Dépendances système nécessaires pour psycopg2 ───────────
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# ── Dépendances Python ───────────────────────────────────────
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# ── Code source ──────────────────────────────────────────────
COPY . .