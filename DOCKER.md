# 🐳 Docker Setup — Yogya Nomad Gateway

Panduan lengkap untuk menjalankan Yogya Nomad Gateway menggunakan Docker (Backend API + PostgreSQL).

---

## 📋 Quick Start (30 detik)

```bash
# 1. Set environment variables
export DB_PASSWORD="your_db_password"
export OPENAI_API_KEY="sk-your-api-key"

# 2. Start containers
docker-compose up -d

# 3. Verify
docker-compose ps
curl http://localhost:8787/api/health
```

Output yang diharapkan:
```json
{"ok": true, "model": "gpt-4o-mini", "database": "connected"}
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│  Docker Host (Localhost)                            │
│                                                     │
│  ┌──────────────────────────────────────────────┐  │
│  │ Docker Network (internal bridge)             │  │
│  │                                              │  │
│  │  ┌─────────────────┐   ┌─────────────────┐  │  │
│  │  │  yogya_nomad_db │   │ yogya_nomad_api │  │  │
│  │  │  (PostgreSQL)   │◄──┤  (Node.js/Exp)  │  │  │
│  │  │                 │   │                 │  │  │
│  │  │ :5432 (internal)│   │ :8787 (expose)  │  │  │
│  │  └─────────────────┘   └─────────────────┘  │  │
│  └──────────────────────────────────────────────┘  │
│                      │                             │
│                      ▼ Port 8787 (Host)            │
│              http://localhost:8787                │
└─────────────────────────────────────────────────────┘
```

---

## 🚀 Commands — Quick Reference

### Start & Stop

```bash
# Start (detached mode)
docker-compose up -d

# Stop
docker-compose stop

# Stop & remove containers
docker-compose down

# Stop & remove everything (volumes, images, networks)
docker-compose down -v
```

### View Status

```bash
# List running containers
docker-compose ps

# View logs
docker-compose logs -f              # Follow all logs
docker-compose logs -f api          # Follow only API logs
docker-compose logs -f postgres     # Follow only DB logs
docker-compose logs --tail=50       # Last 50 lines

# Inspect container
docker-compose exec api bash        # Shell into API container
docker-compose exec postgres bash   # Shell into DB container
```

### Build & Rebuild

```bash
# Build image
docker-compose build

# Build without cache (force rebuild)
docker-compose build --no-cache

# Build specific service
docker-compose build api
docker-compose build postgres
```

---

## 🧪 Testing Endpoints

### Health Check

```bash
# API health
curl http://localhost:8787/api/health

# Expected output:
# {"ok":true,"model":"gpt-4o-mini","database":"connected"}
```

### Destinations API

```bash
# Get all destinations
curl http://localhost:8787/api/destinations

# Get one destination
curl http://localhost:8787/api/destinations/loc-1

# Search destinations
curl "http://localhost:8787/api/destinations/search?q=cafe"

# Filter by category
curl "http://localhost:8787/api/destinations/filter?category=coworking"

# Filter by rating
curl "http://localhost:8787/api/destinations/filter?rating=4.5"
```

### Articles API

```bash
# Get all articles
curl http://localhost:8787/api/articles

# Get one article
curl http://localhost:8787/api/articles/art-1

# Search articles
curl "http://localhost:8787/api/articles/search?q=kalibiru"

# Filter by category
curl "http://localhost:8787/api/articles/filter?category=Kuliner"
```

---

## 🗄️ Database Management

### Access PostgreSQL Shell

```bash
# Enter psql interactive shell
docker-compose exec postgres psql -U postgres -d yogya_nomad_db

# Once inside psql:
\dt                    # List tables
SELECT * FROM destinations;
SELECT * FROM articles;
\q                     # Quit
```

### Backup Database

```bash
# Create backup file
docker exec yogya_nomad_db pg_dump -U postgres -d yogya_nomad_db > backup.sql

# Compress backup
gzip backup.sql
```

### Restore Database

```bash
# Restore from backup
cat backup.sql | docker exec -i yogya_nomad_db psql -U postgres -d yogya_nomad_db

# Or restore from gzip
gunzip < backup.sql.gz | docker exec -i yogya_nomad_db psql -U postgres -d yogya_nomad_db
```

### Run Migration Scripts

```bash
# Migrate locations data
docker-compose exec api npm run node scripts/migrate-locations.js

# Migrate articles data
docker-compose exec api npm run node scripts/migrate-articles.js
```

---

## 🌐 Environment Variables

### Development (`.env`)

```bash
DB_HOST=localhost        # Local development
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=yogya_nomad_db
PORT=8787
OPENAI_API_KEY=sk-...
```

### Production (`.env.production` / `docker-compose.yml`)

```bash
DB_HOST=postgres         # Docker service name
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=<from-env>
DB_NAME=yogya_nomad_db
PORT=8787
NODE_ENV=production
OPENAI_API_KEY=<from-env>
```

### Setting Env Vars saat `docker-compose up`

```bash
# Option 1: Export dan lanjutkan
export DB_PASSWORD="secure_password"
export OPENAI_API_KEY="sk-..."
docker-compose up -d

# Option 2: Inline
DB_PASSWORD="secure_password" OPENAI_API_KEY="sk-..." docker-compose up -d

# Option 3: Create `.env` file di root (docker-compose akan auto-load)
# File: .env
# DB_PASSWORD=secure_password
# OPENAI_API_KEY=sk-...
# docker-compose up -d
```

---

## 🚀 Deployment ke Railway

Railway adalah platform cloud yang support Docker + PostgreSQL + HTTPS otomatis.

### Step 1: Push ke GitHub

```bash
git add Dockerfile docker-compose.yml .dockerignore DOCKER.md
git commit -m "Add Docker support"
git push origin main
```

### Step 2: Create Railway Project

1. Buka https://railway.app
2. Login / Sign up
3. Click "New Project" → "Deploy from GitHub"
4. Connect GitHub repository
5. Select `Yogya-Nomad-Gateway`
6. Railway akan auto-detect Dockerfile

### Step 3: Setup Services

Railway akan membuat service untuk container:

```
Project: Yogya Nomad Gateway
├── api (dari Dockerfile)
└── postgres (create add-on)
```

**Setup PostgreSQL:**
1. Click "+" → "Add Service" → "PostgreSQL"
2. Railway auto-generate password & connection string
3. Railway otomatis setup environment variables

### Step 4: Configure Environment

1. Click `api` service → "Variables"
2. Add variables:
   ```
   OPENAI_API_KEY=sk-...
   NODE_ENV=production
   DB_HOST=postgres   (jika Railway create separate container)
   ```

3. Click `postgres` service → copy connection variables
   - Railway otomatis set `DB_PASSWORD`, `DB_HOST`, dll

### Step 5: Deploy

1. Trigger deployment (auto-trigger saat push ke main, atau manual)
2. Monitor logs: click `api` → "Logs"
3. Wait for "Health check: OK"

### Step 6: Get Public URL

1. Click `api` service → "Settings"
2. Copy "Public Domain URL" (auto-generated)
   - Example: `https://yogya-nomad-api-production-xxx.up.railway.app`
3. HTTPS included! ✅

### Verify on Railway

```bash
# Replace dengan URL Railway Anda
curl https://yogya-nomad-api-production-xxx.up.railway.app/api/health
curl https://yogya-nomad-api-production-xxx.up.railway.app/api/destinations
```

---

## 🔧 Troubleshooting

### ❌ "Port 5432 already in use"

```bash
# Kill existing PostgreSQL process
lsof -i :5432
kill -9 <PID>

# Or change port in docker-compose.yml
# ports:
#   - "5433:5432"
```

### ❌ "Connection refused" / "Cannot connect to Docker daemon"

```bash
# Make sure Docker daemon is running
# Mac/Windows: Start Docker Desktop
# Linux: sudo systemctl start docker
docker ps    # Test connection
```

### ❌ "Database connection error" saat start API

```bash
# Check postgres container status
docker-compose logs postgres

# Verify health check
docker-compose ps
# Lihat STATUS — harus "healthy"

# Jika belum healthy, tunggu (health check butuh beberapa detik)
sleep 10
docker-compose exec api npm start
```

### ❌ "OPENAI_API_KEY not set"

```bash
# Pastikan saat docker-compose up, environment variable sudah di-set
echo $OPENAI_API_KEY    # Verify
docker-compose up -d    # Pastikan env sudah export

# Atau set di .env file di root:
echo "OPENAI_API_KEY=sk-..." > .env
docker-compose up -d
```

### ❌ "node_modules permission denied" (Mac/Linux)

```bash
# Fix volume permissions
docker-compose down
docker volume prune
docker-compose up -d --build
```

### ❌ Data hilang setelah container stop

```bash
# Verify volume
docker volume ls | grep postgres_data

# Jika volume hilang, database akan reset
# Solusi: Backup sebelum down
docker-compose exec postgres pg_dump -U postgres -d yogya_nomad_db > backup.sql
docker-compose down
docker-compose up -d
docker-compose exec -i postgres psql -U postgres -d yogya_nomad_db < backup.sql
```

---

## 📝 Development Workflow

### Local Development (with hot-reload)

```bash
# .env file sudah ada dengan DB credentials lokal
docker-compose up -d

# API server akan auto-reload saat code berubah (volume mounted)
# Edit server/index.js → save → container auto-restart
```

### Production Build

```bash
# Build optimized production image
docker-compose build --no-cache

# Start production containers
NODE_ENV=production docker-compose up -d
```

---

## 📦 Docker Images

### API Image

```bash
# View image
docker image ls | grep yogya

# Manual build
docker build -t yogya-nomad-api:latest .

# Run manual
docker run -p 8787:8787 \
  -e DB_HOST=postgres \
  -e OPENAI_API_KEY=sk-... \
  yogya-nomad-api:latest
```

### PostgreSQL Image

```bash
# Base image: postgres:15-alpine
# Data volume: postgres_data (persistent)
```

---

## ✅ Checklist — Sebelum Production Deploy

- [ ] `.env.production` sudah dibuat dengan konfigurasi production
- [ ] `OPENAI_API_KEY` sudah tersimpan di secret management (jangan di-code)
- [ ] Database backup sudah ada
- [ ] Health checks sudah configured di Dockerfile & docker-compose.yml
- [ ] Ports sudah benar (8787 untuk API, 5432 internal untuk DB)
- [ ] Volume `postgres_data` sudah di-set untuk persistence
- [ ] Docker image sudah di-test lokal
- [ ] Railway project sudah setup (atau cloud provider lain)
- [ ] Environment variables sudah di-setup di Railway/cloud
- [ ] HTTPS sudah enabled (Railway auto, atau setup reverse proxy)
- [ ] Monitoring & logs sudah di-check
- [ ] Backup strategy sudah planned

---

## 📚 Resources

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Railway: https://railway.app/docs
- PostgreSQL: https://www.postgresql.org/docs/15/

---

**Last Updated:** 2026-07-05  
**Docker Version:** 20.10+  
**Docker Compose Version:** 2.0+
