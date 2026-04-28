# DataPulse 📊

![CI/CD](https://github.com/Wisdomuzochi/datapulse/actions/workflows/ci.yml/badge.svg)
![Docker](https://img.shields.io/badge/Docker-Compose-blue?logo=docker)
![FastAPI](https://img.shields.io/badge/FastAPI-0.111-green?logo=fastapi)
![AWS](https://img.shields.io/badge/AWS-Terraform-orange?logo=amazon-aws)
![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)

Une plateforme **ETL + NLP** de bout en bout qui ingère des textes bruts, les analyse automatiquement avec un modèle DistilBERT, et expose les résultats via un dashboard React en temps réel — le tout déployé sur AWS avec une infrastructure entièrement provisionnée en code (Terraform).

> Ce projet couvre l'intégralité du cycle de vie d'une application moderne : développement local, conteneurisation, CI/CD automatisé, observabilité SRE et Infrastructure as Code sur AWS.

---

## Architecture globale

```
┌─────────────────────────────────────────────────────────────────┐
│                        UTILISATEUR                              │
│                           │                                     │
│              POST /api/v1/ingest (texte brut)                   │
│                           │                                     │
└───────────────────────────┼─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FRONTEND (React + Nginx)                     │
│                                                                 │
│   Dashboard temps réel — KPIs, graphiques Recharts              │
│   Formulaire d'ingestion — test du pipeline en direct           │
└───────────────────────────┬─────────────────────────────────────┘
                            │  proxy /api/ → api:8000
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API FASTAPI                                │
│                                                                 │
│   POST /api/v1/ingest  → valide, sauvegarde (pending), publie  │
│   GET  /api/v1/results → résultats filtrés + paginés           │
│   GET  /api/v1/health  → statut API + BDD (pour orchestrateur) │
│   GET  /metrics        → métriques Prometheus                  │
└───────────┬───────────────────────┬─────────────────────────────┘
            │                       │
            ▼                       ▼
┌───────────────────┐   ┌───────────────────────────────────────┐
│   REDIS (broker)  │   │         POSTGRESQL                    │
│                   │   │                                       │
│  File de messages │   │  data_sources    (sources de données) │
│  Celery ↔ API     │   │  pipeline_records (statuts + scores)  │
└────────┬──────────┘   └───────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────┐
│                    CELERY WORKER                                │
│                                                                 │
│   1. Récupère le record (statut: pending → processing)         │
│   2. Lance DistilBERT sur le texte (max 512 tokens)            │
│   3. { label: "POSITIVE", score: 0.9991 }                      │
│   4. Met à jour le record (statut: completed)                  │
└─────────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                 OBSERVABILITÉ SRE                               │
│                                                                 │
│   Prometheus → scrape /metrics toutes les 15s                  │
│   Grafana    → dashboard (requêtes/sec, latence p95, erreurs)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Stack technique

| Couche | Technologie |
|---|---|
| Frontend | React 18 + Vite + Recharts |
| Reverse Proxy | Nginx (multi-stage Docker) |
| API | FastAPI 0.111 + Uvicorn |
| ORM | SQLAlchemy 2.0 + Alembic |
| Base de données | PostgreSQL 15 |
| Message broker | Redis 7 |
| Worker asynchrone | Celery 5.4 |
| Modèle NLP | DistilBERT (HuggingFace Transformers) |
| Monitoring | Prometheus + Grafana |
| Conteneurisation | Docker + Docker Compose |
| CI/CD | GitHub Actions |
| Registry | GitHub Container Registry (ghcr.io) |
| Cloud | AWS (EC2, RDS, S3, VPC, IAM) |
| IaC | Terraform |

---

## Structure du projet

```
datapulse/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   │   ├── health.py       # GET /health — statut API + BDD
│   │   │   ├── ingest.py       # POST /ingest — ingestion + Celery
│   │   │   └── results.py      # GET /results — résultats paginés
│   │   ├── config.py           # Configuration via pydantic-settings
│   │   ├── database.py         # Connexion PostgreSQL + session
│   │   ├── main.py             # FastAPI app + CORS + Prometheus
│   │   └── models.py           # SQLAlchemy (DataSource, PipelineRecord)
│   ├── worker/
│   │   └── tasks.py            # Tâche Celery + pipeline NLP DistilBERT
│   ├── tests/
│   │   ├── conftest.py         # Fixtures pytest + SQLite isolation
│   │   ├── test_health.py      # 4 tests endpoint /health
│   │   └── test_ingest.py      # 5 tests endpoint /ingest
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/         # Header, StatsCard, SentimentChart, RecordsTable
│   │   ├── services/api.js     # Appels axios vers FastAPI
│   │   └── App.jsx             # Dashboard principal + KPIs
│   ├── nginx.conf              # Proxy /api/ → api:8000 + SPA routing
│   └── Dockerfile              # Multi-stage Node.js → Nginx
├── monitoring/
│   └── prometheus.yml          # Config scrape Prometheus
├── infra/
│   ├── main.tf                 # Provider AWS + Terraform config
│   ├── variables.tf            # Paramètres configurables
│   ├── vpc.tf                  # VPC, subnets, Internet Gateway
│   ├── security.tf             # Security Groups EC2 + RDS
│   ├── ec2.tf                  # Instance t3.micro + user_data
│   ├── rds.tf                  # PostgreSQL RDS managé
│   ├── s3.tf                   # Bucket stockage
│   ├── iam.tf                  # Rôle EC2 + policy S3
│   └── outputs.tf              # IP publique, URLs, endpoints
├── .github/workflows/
│   └── ci.yml                  # Pipeline CI/CD GitHub Actions
└── docker-compose.yml          # Stack locale complète (7 services)
```

---

## Flux de données

```
1. L'utilisateur soumet un texte via le dashboard React
         ↓
2. FastAPI valide le payload (Pydantic) et sauvegarde
   en PostgreSQL avec statut "pending"
         ↓
3. FastAPI publie une tâche dans Redis (Celery broker)
   et répond immédiatement à l'utilisateur
         ↓
4. Le Celery Worker consomme la tâche depuis Redis
   → statut "processing"
         ↓
5. DistilBERT analyse le texte
   → { "label": "POSITIVE", "score": 0.9991 }
         ↓
6. PostgreSQL mis à jour avec les résultats NLP
   → statut "completed"
         ↓
7. Le dashboard React rafraîchit automatiquement (15s)
   et affiche les nouveaux KPIs et graphiques
```

---

## Démarrage rapide

### Prérequis

- Docker + Docker Compose
- Python 3.11 (pour les tests locaux)

### Lancer la stack complète

```bash
git clone git@github.com:Wisdomuzochi/datapulse.git
cd datapulse

cp .env.example .env
# Édite .env avec tes valeurs

docker compose up --build
```

| Service | URL |
|---|---|
| Dashboard React | http://localhost |
| API FastAPI + Swagger | http://localhost:8000/docs |
| Prometheus | http://localhost:9090 |
| Grafana | http://localhost:3000 |

### Tester le pipeline

```bash
curl -X POST http://localhost:8000/api/v1/ingest \
  -H "Content-Type: application/json" \
  -d '{"source_name": "google_reviews", "text": "Produit excellent, je recommande !"}'
```

```json
{
  "record_id": 1,
  "status": "pending",
  "task_id": "cbe76cdc-87a9-46e0-86a8-68e571c7411b",
  "message": "Record ingested successfully. NLP processing started."
}
```

---

## Pipeline CI/CD

```
git push sur main
      │
      ├── Job 1 : Tests
      │     ├── pytest (9 tests, SQLite isolation)
      │     └── coverage rapport
      │
      └── Job 2 : Build + Scan + Push  (si tests OK)
            ├── docker build ./backend
            ├── Trivy scan (CRITICAL + HIGH)
            └── Push → ghcr.io/wisdomuzochi/datapulse
```

### Secrets GitHub requis

| Secret | Description |
|---|---|
| `GITHUB_TOKEN` | Auto-généré par GitHub (push ghcr.io) |

---

## Infrastructure AWS (Terraform)

```bash
cd infra
terraform init
terraform plan -var-file="terraform.tfvars"
terraform apply -var-file="terraform.tfvars"
```

### Ressources provisionnées (19 au total)

| Ressource | Type AWS | Free Tier |
|---|---|---|
| VPC + subnets + IGW | Réseau | ✅ |
| Security Groups | Firewall | ✅ |
| EC2 t3.micro | Serveur | ✅ |
| RDS PostgreSQL t3.micro | Base de données | ✅ |
| S3 bucket | Stockage | ✅ |
| IAM role + profile | Sécurité | ✅ |

### Outputs après `terraform apply`

```
frontend_url = "http://<EC2_IP>"
api_url      = "http://<EC2_IP>:8000"
grafana_url  = "http://<EC2_IP>:3000"
s3_bucket    = "datapulse-storage-<account_id>"
```

---

## Observabilité SRE

Métriques exposées via `/metrics` et scrapées par Prometheus :

```
http_requests_total              → compteur de requêtes par endpoint
http_request_duration_seconds    → histogramme de latence (p50/p95/p99)
```

Dashboard Grafana :
- Requêtes par seconde
- Latence p95
- Taux d'erreurs

---

## Concepts DevOps illustrés

- **Pipeline asynchrone** — découplage API ↔ Worker via Redis/Celery
- **Machine à états** — pending → processing → completed/failed
- **Dependency pinning** — versions exactes dans requirements.txt
- **Docker multi-stage** — image Nginx ~25Mo (vs Node.js ~300Mo)
- **IAM least-privilege** — rôle EC2 limité à S3 uniquement
- **Infrastructure as Code** — 19 ressources AWS en Terraform
- **Test isolation** — SQLite en mémoire pour les tests (pas de PostgreSQL)
- **SRE observability** — Prometheus scraping + Grafana dashboards

---

## Auteur

**Wisdom MUONAKA**
[GitHub](https://github.com/Wisdomuzochi) · [LinkedIn](https://linkedin.com/in/wisdom-muonaka-45781b321)