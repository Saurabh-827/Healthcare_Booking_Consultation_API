# HealthCare Booking & Consultation API 🏥

A highly scalable, production-ready RESTful API built for a telemedicine platform. Designed to handle **100k+ daily consultations** with strict latency requirements (p95 < 200ms), ensuring high availability, security, and HIPAA-style compliance.

---

## 🚀 Key Features Implemented

- **Architecture:** Modular, service-oriented architecture using Node.js, TypeScript, and Express.
- **Dependency Injection:** Powered by `tsyringe` for loose coupling and high testability.
- **End-to-End Saga & Idempotency:** Strict idempotency for critical write operations (Booking & Payments) using PostgreSQL constraints and Redis to prevent double-charging and race conditions.
- **Admin & Onboarding Flows:** Dedicated secure workflows for Administrators to onboard new Doctors and manage their specialities/profiles.
- **Asynchronous Workers:** Heavy tasks (like Email notifications) are offloaded to **BullMQ + Redis** background workers.
- **Rate Limiting (DDoS Protection):** Distributed rate limiting using **Redis** (Global limits + Strict Auth limits).
- **RBAC (Role Based Access Control):** Granular access management separating `Admin`, `Doctor`, and `Patient` permissions.
- **Observability:** Custom metrics via **Prometheus** and structured JSON logging via **Winston & Morgan**.
- **Compliance:** Dedicated `AuditLogs` table tracking every sensitive action (e.g., Prescription creations) asynchronously.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (v24+) |
| Language | TypeScript |
| Database | PostgreSQL 15 (via Sequelize ORM) |
| Caching & Queues | Redis (via BullMQ & express-rate-limit) |
| Testing | Jest & Supertest |
| CI/CD | GitHub Actions |

---

## ⚙️ Local Development Setup

### 1. Prerequisites

Ensure you have the following installed on your system:

- Node.js (v24.x)
- Docker & Docker Compose

### 2. Clone and Install

```bash
git clone https://github.com/Saurabh-827/Healthcare_Booking_Consultation_API.git
cd Healthcare_Booking_Consultation_API
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory and configure your credentials:

```env
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=healthcare_db

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Security
JWT_SECRET=your_super_secret_key
```

### 4. Start Infrastructure (Database & Caching)

We use Docker to easily spin up the required PostgreSQL and Redis instances. Ensure the Docker daemon is running, then execute:

```bash
docker compose up -d
```

> Wait a few seconds for the database containers to fully initialize before starting the application.

### 5. Running the Application (Microservice Approach)

The system runs the API Server and Background Job Worker as separate processes. Open two terminals:

**Terminal 1 — API Server:**

```bash
npm run dev
```

> This will automatically connect to PostgreSQL, sync models, and start the server on port 3000.

**Terminal 2 — Background Worker:**

```bash
npm run worker
```

> This will initialize BullMQ to listen for background jobs like emails.

---

## 🧪 Testing

The project includes a robust test suite covering authentication flows, database constraints, and system health.

```bash
npm run test
```

---

## 📖 API Documentation & Postman

All endpoints, request payloads, and authentication tokens can be tested using the provided Postman collection.

> Import the [`healthcare-booking-api.json`](./docs/healthcare-booking-api.json) file into your Postman workspace.

---

## 🏗️ Architecture Document

For deep dives into data flow, caching strategies, sagas, and threat modeling, please refer to the [ARCHITECTURE.md](./docs/ARCHITECTURE.md).
