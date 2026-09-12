# Task Management Application (DevOps 3-Tier Deployment Project)

A lightweight, production-style, three-tier web application built with React, Node.js/Express, and PostgreSQL. Designed specifically as a DevOps learning and deployment project, this repository provides complete source code, automated database schemas, container definitions, and Docker Compose orchestration.

---

## Architecture

The application follows a classic 3-tier architecture with clean separation of concerns:

```text
+-------------------------------------------------------------+
|                     Client Browser                          |
+-------------------------------------------------------------+
                              |
                     HTTP Port 3000 (Host)
                              v
+-------------------------------------------------------------+
|  Tier 1: Frontend (Container: task-frontend)                |
|  - Technology: React 19 + Vite (built)                      |
|  - Web Server: Nginx Alpine (Port 80 internal)              |
|  - Role: Serves static assets, SPA routing, API client      |
+-------------------------------------------------------------+
                              |
                     HTTP Port 5000 (REST)
                              v
+-------------------------------------------------------------+
|  Tier 2: Backend API (Container: task-backend)              |
|  - Technology: Node.js 20 Alpine + Express 4                |
|  - Port: 5000                                               |
|  - Role: Business logic, request validation, CORS, DB pool  |
+-------------------------------------------------------------+
                              |
               TCP Port 5432 (Internal Docker Network)
                              v
+-------------------------------------------------------------+
|  Tier 3: Database (Container: task-db)                      |
|  - Technology: PostgreSQL 15 Alpine                         |
|  - Volume: postgres_data (persistent state)                 |
|  - Role: Relational storage, triggers, schema constraints   |
+-------------------------------------------------------------+
```

---

## Technologies

- **Frontend**: React 19, JavaScript/JSX, Vite 6, Tailwind CSS, Lucide Icons
- **Backend**: Node.js 20, Express 4, `pg` (node-postgres), CORS
- **Database**: PostgreSQL 15, SQL DDL migrations, triggers, indexes
- **Containerization**: Docker, Docker Compose, Multi-stage Dockerfiles, Nginx Alpine

---

## Project Structure

```text
task-management-app/
├── frontend/                     # Tier 1: Client Application
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # Header with system health monitor
│   │   │   ├── TaskForm.jsx      # Creation form with validation
│   │   │   ├── FilterBar.jsx     # Status filters (All, Pending, Completed)
│   │   │   ├── TaskList.jsx      # List view, loading, error, empty states
│   │   │   ├── TaskItem.jsx      # Task card with toggle, timestamps, actions
│   │   │   └── EditTaskModal.jsx # In-place task editing dialog
│   │   ├── api.js                # REST API client with error handling
│   │   ├── App.jsx               # Root application component
│   │   ├── main.jsx              # React DOM entry point
│   │   └── index.css             # Global Tailwind styling
│   ├── Dockerfile                # Multi-stage build (Node build -> Nginx serve)
│   ├── nginx.conf                # Nginx SPA routing and caching configuration
│   ├── package.json              # Frontend dependencies and scripts
│   ├── vite.config.js            # Vite bundler configuration
│   └── .env.example              # Frontend environment template
│
├── backend/                      # Tier 2: REST API Service
│   ├── src/
│   │   ├── routes/
│   │   │   ├── tasks.js          # CRUD task route handlers & validation
│   │   │   └── health.js         # /health endpoint with DB connectivity check
│   │   ├── app.js                # Express app setup, CORS, error handling
│   │   ├── db.js                 # PostgreSQL pool, auto-migration & queries
│   │   └── index.js              # Server entry point & graceful shutdown
│   ├── Dockerfile                # Minimal Node 20 Alpine production image
│   ├── package.json              # Backend dependencies and scripts
│   └── .env.example              # Backend environment template
│
├── database/                     # Tier 3: Database Assets
│   └── init.sql                  # Automated table creation, indexes & triggers
│
├── docker-compose.yml            # 3-tier multi-container orchestration
├── .env.example                  # Global environment variables template
├── .gitignore                    # Git ignore file (prevents secret leaks)
└── README.md                     # Documentation and DevOps handoff guide
```

---

## Features

1. **View All Tasks**: Displays tasks ordered chronologically (newest first).
2. **Create New Task**: Accepts `title` (required, max 255 chars) and optional `description`.
3. **Filter Tasks**: Switch between **All**, **Pending**, and **Completed** with live count badges.
4. **Mark Complete / Pending**: One-click toggle between completed and pending states.
5. **Edit Task**: Update task title, description, or status through a clean modal dialog.
6. **Delete Task**: Delete unwanted tasks with user confirmation.
7. **Task Metadata**: Every task displays title, description, status badge, formatted creation date, and last updated date.
8. **Resilient UI States**: Includes loading skeletons, error banners with retry buttons, and empty-state placeholders.
9. **Live Health Monitoring**: Real-time indicator in the header checking backend availability and database connectivity.

---

## Quick Start with Docker Compose

The simplest and recommended way to run the application is using Docker Compose:

### 1. Clone and Navigate

```bash
git clone <repository-url>
cd task-management-app
```

### 2. Configure Environment

Copy the root `.env.example` file to `.env`:

```bash
cp .env.example .env
```

*(You can adjust database credentials or ports inside `.env` if desired).*

### 3. Build and Start All Containers

```bash
docker compose up --build
```

Docker Compose will:
1. Create the isolated bridge network `task-network`.
2. Create the named persistent volume `postgres_data`.
3. Start the PostgreSQL container (`task-db`), execute `/docker-entrypoint-initdb.d/init.sql`, and wait until the health check passes.
4. Build and start the Node/Express backend (`task-backend`), connect to PostgreSQL, and verify the `/health` endpoint.
5. Build and start the React/Nginx frontend (`task-frontend`) on port 3000.

### 4. Access the Application

- **Frontend UI**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/tasks](http://localhost:5000/api/tasks)
- **Health Check**: [http://localhost:5000/health](http://localhost:5000/health)

---

## Docker Management Commands

### Stop Containers (Keep Data)
```bash
docker compose down
```

### Stop Containers and Remove Volumes (Deletes Database Data)
```bash
docker compose down -v
```

### View Running Containers & Health Status
```bash
docker compose ps
```

### View Live Logs
```bash
# Follow logs for all services:
docker compose logs -f

# Follow logs for a specific service:
docker compose logs -f backend
docker compose logs -f db
docker compose logs -f frontend
```

### Rebuild a Specific Service
```bash
docker compose up --build -d backend
```

---

## Local Development (Without Docker)

If you prefer to run services directly on your host machine:

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL 14+ installed and running on port 5432

### 1. Database Setup
Create the database and run the initialization script:
```bash
createdb taskdb
psql -d taskdb -f database/init.sql
```

### 2. Start Backend API
```bash
cd backend
cp .env.example .env
npm install
npm run dev
# Backend starts on http://localhost:5000
```

### 3. Start Frontend Client
In a separate terminal window:
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
# Frontend starts on http://localhost:3000
```

---

## Environment Variables

### Global / Docker Compose (`.env`)

| Variable | Description | Example Value | Safe to Commit? |
| :--- | :--- | :--- | :--- |
| `PORT` | Backend HTTP listening port | `5000` | Yes |
| `DB_HOST` | Database hostname (`db` in Docker) | `db` | Yes |
| `DB_PORT` | PostgreSQL TCP port | `5432` | Yes |
| `DB_NAME` | Database name | `taskdb` | Yes |
| `DB_USER` | PostgreSQL user | `postgres` | Yes |
| `DB_PASSWORD` | PostgreSQL password | `postgres_secure_pass` | **NO (Secret)** |
| `CORS_ORIGIN` | Allowed client origin(s) | `http://localhost:3000` | Yes |
| `VITE_API_URL` | Base URL used by frontend API client | `http://localhost:5000` | Yes |

### Backend (`backend/.env`)

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `PORT` | Port Express listens on | `5000` | No |
| `DB_HOST` | PostgreSQL host | `localhost` (dev) / `db` (Docker) | Yes |
| `DB_PORT` | PostgreSQL port | `5432` | No |
| `DB_NAME` | PostgreSQL database name | `taskdb` | Yes |
| `DB_USER` | PostgreSQL username | `postgres` | Yes |
| `DB_PASSWORD` | PostgreSQL password | `postgres` | Yes |
| `CORS_ORIGIN` | Allowed frontend origin for CORS | `http://localhost:3000` | No |

### Frontend (`frontend/.env`)

| Variable | Description | Default | Required |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | Target backend REST API URL | `http://localhost:5000` | Yes |

---

## REST API Documentation

### 1. Health Check
- **Endpoint**: `GET /health`
- **Purpose**: Liveness and readiness probe for container orchestrators and health monitors. Checks backend process uptime and verifies live PostgreSQL ping connectivity.
- **Request Body**: None
- **Response (HTTP 200)**:
```json
{
  "status": "healthy",
  "service": "task-management-backend",
  "timestamp": "2026-09-12T06:30:00.000Z",
  "uptime": 142.85,
  "database": {
    "connected": true,
    "type": "postgresql",
    "host": "db",
    "database": "taskdb",
    "latencyMs": 2
  },
  "environment": "production"
}
```

---

### 2. List All Tasks
- **Endpoint**: `GET /api/tasks`
- **Query Parameters**:
  - `status` *(optional)*: Filter by status (`pending` or `completed`)
- **Purpose**: Retrieve tasks ordered chronologically (newest first).
- **Request Body**: None
- **Response (HTTP 200)**:
```json
[
  {
    "id": 1,
    "title": "Setup Docker containers",
    "description": "Configure frontend, backend, and postgres services",
    "status": "completed",
    "created_at": "2026-09-12T05:41:20.898Z",
    "updated_at": "2026-09-12T05:41:20.898Z"
  }
]
```

---

### 3. Get Single Task
- **Endpoint**: `GET /api/tasks/:id`
- **Purpose**: Retrieve a single task by its integer primary key.
- **Request Body**: None
- **Response (HTTP 200)**:
```json
{
  "id": 1,
  "title": "Setup Docker containers",
  "description": "Configure frontend, backend, and postgres services",
  "status": "completed",
  "created_at": "2026-09-12T05:41:20.898Z",
  "updated_at": "2026-09-12T05:41:20.898Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"error": "Task ID must be a valid number."}`
  - `404 Not Found`: `{"error": "Task with ID 999 not found."}`

---

### 4. Create Task
- **Endpoint**: `POST /api/tasks`
- **Purpose**: Create a new task record.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "title": "Configure Prometheus metrics",
  "description": "Instrument backend API endpoints",
  "status": "pending"
}
```
*Note: `title` is required (max 255 chars). `description` and `status` are optional. Default status is `pending`.*
- **Response (HTTP 201)**:
```json
{
  "id": 4,
  "title": "Configure Prometheus metrics",
  "description": "Instrument backend API endpoints",
  "status": "pending",
  "created_at": "2026-09-12T06:35:10.120Z",
  "updated_at": "2026-09-12T06:35:10.120Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: `{"error": "Field \"title\" is required and must be a non-empty string."}`

---

### 5. Update Task
- **Endpoint**: `PUT /api/tasks/:id`
- **Purpose**: Update title, description, and/or status of an existing task.
- **Request Headers**: `Content-Type: application/json`
- **Request Body**:
```json
{
  "status": "completed"
}
```
- **Response (HTTP 200)**:
```json
{
  "id": 4,
  "title": "Configure Prometheus metrics",
  "description": "Instrument backend API endpoints",
  "status": "completed",
  "created_at": "2026-09-12T06:35:10.120Z",
  "updated_at": "2026-09-12T06:36:45.890Z"
}
```
- **Error Responses**:
  - `400 Bad Request`: Invalid ID or empty update payload.
  - `404 Not Found`: `{"error": "Task with ID 999 not found."}`

---

### 6. Delete Task
- **Endpoint**: `DELETE /api/tasks/:id`
- **Purpose**: Remove a task by ID.
- **Request Body**: None
- **Response (HTTP 200)**:
```json
{
  "message": "Task deleted successfully.",
  "id": 4
}
```
- **Error Responses**:
  - `404 Not Found`: `{"error": "Task with ID 999 not found."}`

---

## Container Communication & Networking

1. **Docker Network (`task-network`)**:
   - All three containers (`task-frontend`, `task-backend`, `task-db`) attach to a shared Docker bridge network.
   - Container DNS resolution allows `backend` to resolve the database using `DB_HOST=db`.
2. **PostgreSQL Access**:
   - The backend connects over internal port `5432` to the `db` service.
   - Database credentials (`POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`) match between database and backend containers.
3. **Frontend-to-Backend Access**:
   - The React app runs inside the user's browser, communicating with the backend via `VITE_API_URL` (`http://localhost:5000`).
   - In production or Kubernetes, this URL is set to the public API ingress or load balancer domain.
4. **CORS Policy**:
   - The backend restricts allowed origins to `CORS_ORIGIN` (`http://localhost:3000`), blocking unauthorized cross-origin requests while allowing the frontend client to perform standard and preflight HTTP requests.

---

## Database Schema & Persistence

### Table Definition
```sql
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Persistence
- Docker Compose defines a named volume:
  ```yaml
  volumes:
    postgres_data:
      driver: local
  ```
- Mounted to `/var/lib/postgresql/data` inside `task-db`.
- When `task-db` is stopped or recreated (`docker compose stop` or `docker compose down`), all task rows remain preserved on disk.
- To purge database data intentionally, execute `docker compose down -v`.

---

## Troubleshooting Guide

### 1. Backend cannot connect to Database
- **Symptoms**: `/health` reports `status: degraded`, backend logs show `ECONNREFUSED`.
- **Causes**: PostgreSQL container is still initializing or crashed.
- **Solution**:
  1. Check database container status: `docker compose ps`
  2. Inspect database logs: `docker compose logs db`
  3. Ensure `depends_on` in `docker-compose.yml` uses `condition: service_healthy`.

### 2. Frontend cannot reach Backend
- **Symptoms**: Frontend displays red banner "Unable to reach backend service at http://localhost:5000".
- **Causes**: Backend container failed to start or `VITE_API_URL` is misconfigured.
- **Solution**:
  1. Verify backend is running: `curl http://localhost:5000/health`
  2. Inspect backend logs: `docker compose logs backend`
  3. Check browser console for CORS or network errors.

### 3. Port Already in Use (3000, 5000, or 5432)
- **Symptoms**: `Error response from daemon: driver failed programming external connectivity on endpoint: Bind for 0.0.0.0:5000 failed: port is already allocated`.
- **Solution**:
  1. Find the conflicting process on your host:
     - Linux/macOS: `lsof -i :5000` or `netstat -tuln | grep 5000`
  2. Terminate the conflicting process or change the host port mapping in `docker-compose.yml` (e.g., `"5001:5000"`).

### 4. Viewing Logs
- Run `docker compose logs -f --tail=100` to inspect recent output across all tiers.

---

## DevOps Deployment Information

> **Note for DevOps Engineers**: This section contains operational specifications, environment contract details, and deployment parameters for CI/CD pipelines, Kubernetes manifests, Helm charts, or cloud container services (AWS ECS, Google Cloud Run, Azure Container Apps).

### Service Specifications

| Parameter | Frontend Service | Backend API Service | Database Service |
| :--- | :--- | :--- | :--- |
| **Container Name** | `task-frontend` | `task-backend` | `task-db` |
| **Base Image** | `nginx:alpine` | `node:20-alpine` | `postgres:15-alpine` |
| **Container Internal Port** | `80` | `5000` | `5432` |
| **Default Host Port** | `3000` | `5000` | `5432` |
| **Protocol** | HTTP | HTTP / JSON REST | TCP / PostgreSQL Wire |
| **Health Check Command** | `wget -qO- http://localhost:80/` | `wget -qO- http://localhost:5000/health` | `pg_isready -U postgres -d taskdb` |
| **Health Check Interval** | 30s (timeout 3s) | 10s (timeout 5s) | 10s (timeout 5s) |
| **Run As User** | `nginx` (non-root) | `node` (UID 1000, non-root) | `postgres` (UID 70) |

### Environment Variable Classification

#### 1. Configuration Values (Safe to commit or store in ConfigMaps)
- `PORT=5000`
- `DB_HOST=db` (or Kubernetes Service DNS name, e.g. `postgres.production.svc.cluster.local`)
- `DB_PORT=5432`
- `DB_NAME=taskdb`
- `DB_USER=postgres`
- `CORS_ORIGIN=https://app.yourdomain.com`
- `VITE_API_URL=https://api.yourdomain.com`

#### 2. Secrets (DO NOT commit; inject via Secret Manager, Vault, or K8s Secrets)
- `POSTGRES_PASSWORD` / `DB_PASSWORD`: Strong master password for the database user.

### Service Dependencies & Startup Sequence

```text
[ PostgreSQL (db) ]
       | (Waits for pg_isready health check: SUCCESS)
       v
[ Express API (backend) ]
       | (Initializes tables & waits for /health: SUCCESS)
       v
[ React / Nginx (frontend) ]
```

### Storage & Persistent Volume Requirements
- **Mount Path**: `/var/lib/postgresql/data`
- **Volume Size**: Minimum 10 GiB recommended for production workloads.
- **Access Mode**: `ReadWriteOnce` (RWO).
- **Backup Recommendation**: Daily automated snapshot of the persistent volume or logical dump via `pg_dump`.

### CI/CD Build & Run Commands

#### Build Images
```bash
# Build Backend Image
docker build -t task-backend:latest ./backend

# Build Frontend Image (injecting target production API domain)
docker build \
  --build-arg VITE_API_URL=https://api.yourdomain.com \
  -t task-frontend:latest ./frontend
```

#### Run Production Containers
```bash
# Database
docker run -d --name task-db \
  --network task-network \
  -v postgres_data:/var/lib/postgresql/data \
  -e POSTGRES_DB=taskdb \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=${DB_PASSWORD} \
  postgres:15-alpine

# Backend
docker run -d --name task-backend \
  --network task-network \
  -p 5000:5000 \
  -e DB_HOST=task-db \
  -e DB_PORT=5432 \
  -e DB_NAME=taskdb \
  -e DB_USER=postgres \
  -e DB_PASSWORD=${DB_PASSWORD} \
  -e CORS_ORIGIN=https://app.yourdomain.com \
  task-backend:latest

# Frontend
docker run -d --name task-frontend \
  --network task-network \
  -p 80:80 \
  task-frontend:latest
```
