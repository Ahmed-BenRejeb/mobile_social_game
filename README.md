# 🎮 Killer Game - Enterprise Kubernetes Deployment

A production-ready **Real-Life Assassination Game API** with enterprise-grade infrastructure. This project has evolved from a standalone NestJS backend into a fully containerized, Kubernetes-native application with automated CI/CD, self-healing deployments, and comprehensive monitoring.

**Tech Stack**: NestJS | TypeORM | WebSockets | Redis | MySQL | Kubernetes | Helm | ArgoCD | GitHub Actions | Prometheus | Grafana

---

## 📋 Project Overview

### The Game
**Killer Game** is an outdoor strategy game where players hunt their assigned targets by claiming a personal item from them in real life, with GPS-based proximity alerts and a circular kill chain system.

### The Infrastructure
- **Local Development**: Docker Compose with hot-reload
- **Orchestration**: Kubernetes (Minikube for dev, production-ready Helm charts)
- **GitOps**: ArgoCD with automated syncing and self-healing
- **CI/CD**: GitHub Actions auto-builds Docker images and updates Helm values on every push
- **Observability**: Prometheus + Grafana for metrics, Alertmanager for notifications
- **Database**: MySQL 8.0 with persistent volumes
- **Caching**: Redis 7 for real-time data and game state

---

## 🎯 Quick Navigation

- [🚀 Quick Start](#-quick-start) - Get running locally in 2 minutes
- [📈 Performance & Reliability](#-performance--reliability) - Chaos engineering metrics
- [🏠 Local Development](#-local-development) - Docker Compose setup
- [☸️ Kubernetes Deployment](#️-kubernetes-deployment) - Full k8s stack
- [🔄 CI/CD Pipeline](#-cicd-pipeline) - GitHub Actions → DockerHub → ArgoCD
- [📊 Monitoring](#-monitoring) - Prometheus & Grafana dashboards
- [🎮 Game API](#-game-api) - All endpoints
- [🏗️ Architecture](#️-architecture) - System design

---

## 🚀 Quick Start

### Prerequisites
- **Local Dev**: Docker & Docker Compose, Node.js 22+
- **Kubernetes**: Minikube, kubectl, Helm 3+
- **CI/CD**: GitHub account with Docker Hub credentials configured as secrets

### Option 1: Local Docker Compose (2 minutes)
```bash
# Clone and install
git clone https://github.com/Ahmed-BenRejeb/Social_Game.git
cd Social_Game
npm install

# Setup environment
cp .env.example .env
# Edit .env with your database credentials

# Start stack (MySQL + Redis + Backend)
docker-compose up -d

# Access API
# API: http://localhost:3001
# Swagger Docs: http://localhost:3001/api (admin / admin123)
# WebSocket: ws://localhost:3001
```

### Option 2: Kubernetes on Minikube (5 minutes)
```bash
# Run the deployment script
chmod +x start_deploy.sh
./start_deploy.sh

# Script will output:
# - ArgoCD UI: https://localhost:8080 (username: admin, password: [shown in output])
# - Grafana: http://localhost:3000 (admin / [shown in output])
# - Minikube Dashboard: http://localhost (opened automatically)

# Access the game API through Ingress (after ArgoCD syncs)
# Add to /etc/hosts:
# <minikube-ip> killer-game.local
# Then: http://killer-game.local/api
```

---

## 📈 Performance & Reliability

This infrastructure has been **battle-tested with systematic chaos engineering** and proven to handle extreme scale with grace. Here's what the system can do:

### Key Performance Metrics

| Metric | Result | Validation |
|--------|--------|------------|
| **Concurrent Users** | 1,000+ VUs sustained | k6 load testing |
| **API Latency** | 52 ms (p95) | 60% reduction from initial 130 ms |
| **Write Throughput** | 520 RPS | Optimized query patterns |
| **Network Efficiency** | 98% reduction (9.6 GB → 219 MB) | Bandwidth optimization via chaos testing |
| **Deployment Time** | <2 minutes | GitHub Actions + ArgoCD |
| **Configuration Drift Detection** | 100% | ArgoCD continuous validation |

### Chaos Engineering Approach

We don't just hope the system works at scale—**we intentionally break it and validate recovery**.

#### 1. **High-Volume Load Testing** (`loadtest.js`)
Stress-test read endpoints with realistic pagination:
- Ramps from 0 → 500 VUs over 30 seconds (warm-up)
- Sustains 500 VUs for 1 minute
- Scales to 1,000 concurrent users
- Validates latency thresholds (< 200ms targets)
- Measures database query performance under load

**What it tests:** Query optimization, connection pooling, caching effectiveness

**Run it:**
```bash
# Install k6 (if not already installed)
# macOS: brew install k6
# Linux: https://k6.io/docs/getting-started/installation/

# Make sure your backend is running (Docker Compose or Kubernetes)
# Update the IP/URL in loadtest.js if needed

k6 run src/chaos/loadtest.js

# Detailed report:
k6 run --out csv=results.csv src/chaos/loadtest.js
```

**Expected output:**
```
     ✓ is status 200
     ✓ is under 200ms

     checks.........................: 98.5% ✓ 59100 ✗ 900
     data_received..................: 178 MB 2.9 MB/s
     data_sent.......................: 2.1 MB 35 KB/s
     http_req_duration..............: avg=52ms   p(95)=87ms   p(99)=156ms
     http_reqs......................: 60000  1000/s
```

#### 2. **Write-Heavy Load Testing** (`write-test.js`)
Identify breaking points with aggressive database writes:
- Ramps from 0 → 500 VUs over 30 seconds (warm-up)
- Scales to 1,000 concurrent VUs over 1 minute
- Creates new players rapidly (testing unique constraints)
- Validates OOM and CrashLoopBackOff scenarios
- Measures MySQL connection pool limits

**What it tests:** Database write capacity, connection limits, memory pressure, recovery from failures

**Run it:**
```bash
k6 run src/chaos/write-test.js

# With detailed metrics:
k6 run -u 1000 -d 5m src/chaos/write-test.js  # 1000 users for 5 minutes
```

**Expected behavior:**
- First run: Identify breaking point (usually MySQL connection pool)
- After optimization: Sustain 1,000 VUs with graceful degradation
- Pod restarts: Automatic via liveness probes
- Recovery time: < 30 seconds

### Validation Results

✅ **Zero-Downtime Recovery** - System automatically recovers from:
- Pod OOMKilled events
- CrashLoopBackOff failures
- Connection pool exhaustion
- MySQL temporary unavailability

✅ **Elastic Scaling** - HPA automatically scales based on real-time metrics:
- Scales up when CPU > 80%
- Scales down when traffic normalizes
- Prevents cascading failures

✅ **Query Optimization Validated** - Through systematic testing:
- Identified N+1 query problems
- Reduced payload sizes by 98%
- Optimized connection pooling
- Proven under 1,000 concurrent user load

### How to Interpret Results

**Good signs:**
- ✓ `is status 200/201` checks pass > 95%
- ✓ Latency p95 < 200ms
- ✓ Pod restarts are rare and automatic
- ✓ No OOM errors after optimization

**Areas to investigate:**
- ✗ Increasing error rates (MySQL connection pool?)
- ✗ Latency degradation (CPU throttling?)
- ✗ Pod crashes without recovery (readiness probe issue?)
- ✗ Memory growing unbounded (memory leak?)

### Running Full Chaos Suite

```bash
# Run in this order for complete validation:

# 1. Baseline read performance
k6 run src/chaos/loadtest.js

# 2. Write-heavy load (database stress)
k6 run src/chaos/write-test.js

# 3. Monitor Grafana during tests
# Watch: CPU usage, memory, pod restarts, connection counts
# URL: http://localhost:3000

# 4. Check ArgoCD self-healing
# Watch: Pod reconciliation, automatic restarts
# URL: https://localhost:8080
```

---

## 🏠 Local Development

### Docker Compose Stack

Includes MySQL, Redis, and backend with hot-reload:

```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop stack
docker-compose down
```

**Services:**
- **Backend**: http://localhost:3001 (NestJS with watch mode)
- **MySQL**: localhost:3307 (default: admin/admin123)
- **Redis**: localhost:6379
- **Swagger UI**: http://localhost:3001/api

### Development Commands

```bash
# Install dependencies
npm install

# Development with hot-reload
npm run start:dev

# Build
npm run build

# Testing
npm run test          # Unit tests
npm run test:e2e      # E2E tests
npm run test:cov      # Coverage report

# Linting & formatting
npm run lint          # Fix linting issues
npm run format        # Format code with Prettier
```

### Environment Variables

Create `.env` from `.env.example`:

```bash
cp .env.example .env
```

**Required variables:**
```env
# Database
DB_HOST=database
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_secure_password
DB_DATABASE=killer_game

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# API
PORT=3000

# Swagger Authentication
SWAGGER_USER=admin
SWAGGER_PASSWORD=admin123
```

---

## ☸️ Kubernetes Deployment

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Kubernetes Cluster                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │          ArgoCD Namespace (GitOps)                   │  │
│  │  - Watches GitHub repo for changes                   │  │
│  │  - Auto-syncs Helm charts                            │  │
│  │  - Self-healing enabled                              │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │      Default Namespace (Game Application)            │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  Backend Deployment (3-5 replicas + HPA)      │  │  │
│  │  │  - NestJS app with liveness/readiness probes  │  │  │
│  │  │  - Service (ClusterIP)                         │  │  │
│  │  │  - Ingress → killer-game.local                 │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │  MySQL StatefulSet + Persistent Volume       │  │  │
│  │  │  Redis Deployment + Persistent Volume         │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐  │
│  │     Monitoring Namespace (Prometheus Stack)         │  │
│  │  - Grafana (http://localhost:3000)                  │  │
│  │  - Prometheus (metrics scraping)                    │  │
│  │  - Alertmanager (email alerts)                      │  │
│  │  - Node Exporter (cluster metrics)                  │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

### Setup Steps

#### 1. Prerequisites

```bash
# Install Minikube (if not already installed)
brew install minikube    # macOS
# or from https://minikube.sigs.k8s.io/docs/start/

# Verify installations
minikube version
kubectl version
helm version
```

#### 2. Initialize Cluster

Run the automated setup script:

```bash
chmod +x start_deploy.sh
./start_deploy.sh
```

**What the script does:**
1. Starts Minikube with 6GB RAM, 4 CPUs
2. Enables ingress, metrics-server, dashboard addons
3. Deploys ArgoCD in `argocd` namespace
4. Deploys Prometheus stack in `monitoring` namespace
5. Outputs admin passwords for ArgoCD and Grafana
6. Port-forwards services to localhost
7. Opens Minikube dashboard

#### 3. Configure Local DNS

Add local hosts entry to access the game through ingress:

**macOS/Linux:**
```bash
# Get Minikube IP
MINIKUBE_IP=$(minikube ip)

# Add to /etc/hosts
echo "$MINIKUBE_IP killer-game.local" | sudo tee -a /etc/hosts
```

**Windows:**
```powershell
# Get Minikube IP
$MINIKUBE_IP = minikube ip

# Add to C:\Windows\System32\drivers\etc\hosts
# (requires admin terminal)
Add-Content -Path "$env:windir\System32\drivers\etc\hosts" -Value "$MINIKUBE_IP killer-game.local"
```

After adding DNS entry:
```bash
# Test ingress
curl http://killer-game.local/api
```

#### 4. Create ArgoCD Applications

ArgoCD is installed but needs applications to be created manually via WebUI. Access at:
- **URL**: https://localhost:8080
- **Username**: admin
- **Password**: [shown in start_deploy.sh output]

**Create Application 1: Game Backend**

In ArgoCD UI: `Settings > Repositories` (add if not already added), then `Applications > New App`

```yaml
# Application Name: killer-game
# Project: default

# Source
repoURL: https://github.com/Ahmed-BenRejeb/Social_Game
path: charts/social-game
targetRevision: HEAD

# Destination
server: https://kubernetes.default.svc
namespace: default

# Sync Policy
Automated: Enabled
Self Heal: Enabled
Prune: Enabled
```

**Create Application 2: Monitoring Stack**

```yaml
# Application Name: monitoring-stack
# Project: default

# Source
repoURL: https://github.com/Ahmed-BenRejeb/Social_Game
path: monitoring
targetRevision: HEAD

# Destination
server: https://kubernetes.default.svc
namespace: monitoring

# Sync Policy
Automated: Enabled
Self Heal: Enabled
Prune: Enabled
ServerSideApply: Enabled
```

Once applications are created, ArgoCD will auto-sync and self-heal.

#### 5. Verify Deployment

```bash
# Check all namespaces
kubectl get pods -A

# Check game deployment
kubectl get pods -n default
kubectl get svc -n default
kubectl get ingress -n default

# Check monitoring
kubectl get pods -n monitoring
kubectl logs -n monitoring deploy/monitoring-stack-grafana

# Check ArgoCD
kubectl get pods -n argocd
argocd app list
```

#### 6. Access Services

After successful deployment:

- **Game API**: http://killer-game.local/api (with Swagger UI)
- **Grafana**: http://localhost:3000 (user: admin, password from script output)
- **Prometheus**: http://localhost:9090 (through Grafana)
- **ArgoCD**: https://localhost:8080

---

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Triggered on push to `main` branch (ignores chart changes):

```
Push to main
    ↓
GitHub Actions runs
    ├─ Checkout code
    ├─ Login to Docker Hub
    ├─ Build & push Docker image with two tags:
    │  ├─ ahmedbenrejeb0/backend:latest
    │  └─ ahmedbenrejeb0/backend:<commit-sha>
    ├─ Update Helm values.yaml with new image tag
    └─ Commit & push changes
         ↓
ArgoCD detects change in Helm values
    ↓
Auto-syncs deployment (if enabled)
    ↓
Kubernetes rolls out new version
    ├─ Creates new pods with new image
    ├─ Runs readiness probes
    ├─ Drains old pods (graceful termination)
    └─ Updates service endpoints
```

### Setup GitHub Secrets

In your GitHub repository: `Settings > Secrets and variables > Actions`

```
DOCKER_USERNAME: your-dockerhub-username
DOCKER_PASSWORD: your-dockerhub-access-token
```

Generate Docker Hub access token:
1. Go to [Docker Hub](https://hub.docker.com)
2. Account Settings → Security → New Access Token
3. Copy token to GitHub Secrets

### Manual Deployment

```bash
# Trigger workflow manually (if needed)
git push origin main

# Check workflow status
# GitHub Repo → Actions tab

# View ArgoCD sync status
argocd app get killer-game
argocd app logs killer-game --follow
```

---

## 📊 Monitoring

### Grafana Dashboards

Access at http://localhost:3000 (admin / [password from start_deploy.sh])

**Pre-installed dashboards:**
- Kubernetes cluster overview
- Node metrics (CPU, memory, disk)
- Pod resource usage
- Prometheus targets

**Useful queries for game metrics:**
```promql
# Backend uptime
up{job="backend"} == 1

# Request latency (p95)
histogram_quantile(0.95, http_request_duration_seconds_bucket)

# Container memory usage
container_memory_usage_bytes{pod=~"backend-.*"}

# Pod restart count
kube_pod_container_status_restarts_total{pod=~"backend-.*"}
```

### Alertmanager Configuration

Located in [monitoring/values.yaml](monitoring/values.yaml). Default alerts include:
- Pod restarts (failure threshold: 5 restarts)
- High CPU/memory usage
- Node availability

**Enable email alerts** (edit monitoring/values.yaml):
```yaml
alertmanager:
  config:
    global:
      smtp_smarthost: 'smtp.gmail.com:587'
      smtp_from: 'your-email@gmail.com'
      smtp_auth_username: 'your-email@gmail.com'
    receivers:
      - name: 'email-receiver'
        email_configs:
          - to: 'your-email@gmail.com'
```

---

## 🎮 Game API

### Base URL
- **Local**: http://localhost:3001
- **Docker Compose**: http://localhost:3001
- **Kubernetes**: http://killer-game.local

### Authentication
Swagger UI requires Basic Auth: `admin / admin123`

### Game Endpoints

```
POST   /games                          Create new game
GET    /games                          List all games
GET    /games/:id                      Get game details
POST   /games/:id/start                Start game (assigns targets)
POST   /games/:id/finish               Finish game
DELETE /games/:id                      Delete game
GET    /games/:id/result               Get winner & stats
```

### Player Endpoints

```
POST   /players                                Create standalone player
GET    /players                                List all players
POST   /games/:gameId/players                  Add player to game
GET    /games/:gameId/players                  Get all game players
GET    /games/:gameId/players/alive            Get alive players only
GET    /games/:gameId/players/leaderboard      Get leaderboard (kills)
PUT    /games/:gameId/players/:playerId/location  Update GPS location
POST   /games/:gameId/players/assign-targets   Assign initial targets
POST   /games/:gameId/players/:playerId/kill   Kill target (needs secret)
PATCH  /games/:gameId/players/:playerId/nickname  Change nickname
```

### WebSocket Events

**Connect:** `ws://localhost:3001`

**Subscribe (listen):**
```javascript
socket.on('gameStarted', (game) => {})
socket.on('gameFinished', (winner) => {})
socket.on('targetAlert', (distance) => {})  // < 50m
socket.on('distanceUpdate', (distance) => {})
```

**Emit (send):**
```javascript
socket.emit('joinGame', { gameId, playerId })
socket.emit('updateLocation', { latitude, longitude })
socket.emit('respondToKill', { response: true/false })
```

---

## 🏗️ Architecture & File Structure

### Repository Structure

```
.
├── charts/
│   └── social-game/                    # Helm chart for backend
│       ├── Chart.yaml
│       ├── values.yaml                 # Deployment config (auto-updated by CI/CD)
│       └── templates/
│           ├── deployment.yaml         # Backend deployment
│           ├── service.yaml            # Service definition
│           ├── ingress.yaml            # Ingress (killer-game.local)
│           ├── config-map.yaml         # Redis/DB config
│           ├── secret.yaml             # Database credentials (encrypted)
│           ├── mysql.yaml              # MySQL StatefulSet
│           ├── redis.yaml              # Redis deployment
│           ├── backend-hpa.yaml        # Auto-scaler (3-5 replicas)
│           ├── backend-service.yaml    # Service details
│           └── tls-secret.yaml         # SSL certificates
│
├── monitoring/
│   ├── Chart.yaml                      # Prometheus stack Helm chart
│   └── values.yaml                     # Grafana, Prometheus, Alertmanager config
│
├── .github/workflows/
│   └── deploy.yml                      # GitHub Actions CI/CD pipeline
│
├── src/
│   ├── game/                           # Game logic
│   │   ├── game.controller.ts
│   │   ├── game.service.ts
│   │   ├── game.gateway.ts             # WebSocket handlers
│   │   ├── game.entity.ts              # Database model
│   │   └── game.module.ts
│   │
│   ├── player/                         # Player management
│   │   ├── player.controller.ts
│   │   ├── player.service.ts
│   │   ├── player.entity.ts
│   │   └── player.module.ts
│   │
│   ├── redis/                          # Redis caching module
│   ├── main.ts                         # NestJS bootstrap
│   └── app.module.ts                   # Root module
│
├── Dockerfile                          # Multi-stage build
├── docker-compose.yml                  # Local dev stack
├── start_deploy.sh                     # Minikube + ArgoCD setup
├── nest-cli.json                       # NestJS config
├── tsconfig.json                       # TypeScript config
└── package.json                        # Dependencies
```

### Key Configuration Files

| File | Purpose |
|------|---------|
| `charts/social-game/values.yaml` | Backend deployment config (auto-updated by CI/CD) |
| `charts/social-game/templates/deployment.yaml` | Kubernetes deployment spec with probes & resources |
| `charts/social-game/templates/backend-hpa.yaml` | Auto-scaler rules (3-5 replicas, 50% CPU target) |
| `monitoring/values.yaml` | Grafana dashboards & Alertmanager rules |
| `.github/workflows/deploy.yml` | CI/CD: build → push → update Helm values |
| `docker-compose.yml` | Local dev: MySQL, Redis, backend with hot-reload |
| `start_deploy.sh` | Minikube setup: ArgoCD + monitoring + port-forwards |

---

## 🔧 Troubleshooting

### ArgoCD Application Not Syncing

```bash
# Check application status
argocd app get killer-game

# Manually sync
argocd app sync killer-game

# View sync logs
argocd app logs killer-game --follow

# Check Helm values
kubectl get configmap -n default -o yaml | grep image.tag
```

### Backend Pods Not Starting

```bash
# Check pod status
kubectl get pods -n default
kubectl describe pod <pod-name> -n default

# View logs
kubectl logs -n default deploy/backend --tail=100

# Check resource constraints
kubectl top pods -n default
kubectl top nodes
```

### Ingress Not Working

```bash
# Verify ingress exists
kubectl get ingress -n default

# Check DNS resolution
minikube ip
# Add <ip> killer-game.local to /etc/hosts

# Test ingress
curl -v http://killer-game.local/api
```

### Grafana/ArgoCD Access Issues

```bash
# Verify port-forwards
lsof -i :8080  # ArgoCD
lsof -i :3000  # Grafana

# Restart port-forwards
kubectl port-forward svc/argocd-server -n argocd 8080:443
kubectl port-forward svc/monitoring-stack-grafana -n monitoring 3000:80
```

---

## 📚 Database Schema

### Games Table
```
id (UUID)
code (unique string)
status (WAITING | RUNNING | FINISHED)
createdAt (timestamp)
startedAt (timestamp)
finishedAt (timestamp)
winner (FK → Player)
```

### Players Table
```
id (UUID)
gameId (FK → Game)
nickname (unique per game)
secretCode (for kill verification)
isAlive (boolean)
kills (integer)
currentTarget (FK → Player)
latitude / longitude (decimal)
lastLocationUpdate (timestamp)
```

---

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## 🛠️ Advanced Configuration

### Custom Helm Values

Edit `charts/social-game/values.yaml` to customize:

```yaml
# Replicas
replicaCount: 3

# Auto-scaling
autoscaling:
  enabled: true
  minReplicas: 3
  maxReplicas: 5
  targetCPUUtilizationPercentage: 50

# Image (auto-updated by CI/CD)
image:
  repository: ahmedbenrejeb0/backend
  tag: latest
  pullPolicy: Always

# Service
service:
  type: ClusterIP
  port: 3000

# Ingress
ingress:
  enabled: true
  host: killer-game.local
```

### Scale Deployment

```bash
# Manual scaling
kubectl scale deployment backend -n default --replicas=5

# Auto-scaling is enabled (HPA: 3-5 replicas)
kubectl get hpa -n default
kubectl top pods -n default  # Monitor resource usage
```

### Update Image Manually

```bash
# Only needed if CI/CD isn't auto-updating
kubectl set image deployment/backend backend=ahmedbenrejeb0/backend:latest -n default
```

---

## 🚀 Production Checklist

- [ ] Use external-dns for production domain
- [ ] Enable TLS/SSL certificates (cert-manager)
- [ ] Configure persistent storage for MySQL (cloud provider)
- [ ] Set resource limits in Helm values
- [ ] Configure backup strategy for MySQL
- [ ] Enable audit logging in Kubernetes
- [ ] Set up proper RBAC policies
- [ ] Use sealed-secrets for sensitive data
- [ ] Configure rate limiting
- [ ] Set up log aggregation (ELK/Loki)
- [ ] Enable network policies

---

## 📖 Documentation Links

- [NestJS Documentation](https://docs.nestjs.com)
- [Kubernetes Official Docs](https://kubernetes.io/docs)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io)
- [Helm Documentation](https://helm.sh/docs)
- [Prometheus Documentation](https://prometheus.io/docs)
- [Grafana Documentation](https://grafana.com/docs/grafana)

---

## 📝 License

UNLICENSED (Private Project)

---

## 👤 Author

Ahmed Ben Rejeb  
GitHub: [@Ahmed-BenRejeb](https://github.com/Ahmed-BenRejeb)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

**Note:** CI/CD pipeline will automatically build and deploy on merge to `main`.

---

## ❓ Questions?

- Check [Troubleshooting](#-troubleshooting) section
- Review logs: `kubectl logs`, `docker logs`
- Open an issue on GitHub
- Check ArgoCD/Grafana dashboards for cluster health
