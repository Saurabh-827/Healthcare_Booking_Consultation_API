# HealthCare Booking & Consultation API 🏥

A highly scalable, production-ready RESTful API built for a telemedicine platform. Designed to handle **100k+ daily consultations** with strict latency requirements (p95 < 200ms reads, < 500ms writes), ensuring high availability, security, and HIPAA-style compliance.

---

## 🚀 Key Features

- **Modular Architecture:** Service-oriented design using Node.js, TypeScript, and Express with `tsyringe` Dependency Injection.
- **Doctor Availability & Booking:** Full `AvailabilitySlot` lifecycle — Doctors/Admins create slots, Patients book them.
- **Pessimistic Locking:** `SELECT ... FOR UPDATE` on slot rows during booking to prevent double-booking race conditions.
- **Idempotency (Saga Pattern):** `x-idempotency-key` header on Booking & Payment routes prevents double-charging on retries.
- **Input Validation:** `Zod` schema validation on all write endpoints — UUIDs, emails, datetimes validated before DB.
- **RBAC:** Granular role-based access control separating `Admin`, `Doctor`, and `Patient` permissions.
- **Async Workers:** Email notifications offloaded to **BullMQ + Redis** background workers with retry & DLQ.
- **Rate Limiting:** Redis-backed distributed rate limiting (global + strict auth-specific limits).
- **Observability:** Prometheus metrics (`/metrics`), structured JSON logging via Winston & Morgan.
- **Audit Compliance:** `AuditLogs` table tracks every sensitive action asynchronously.
- **Security:** Helmet.js headers, bcrypt password hashing, JWT with no fallback secrets.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| Runtime | Node.js (v24+) |
| Language | TypeScript |
| Framework | Express.js |
| Database | PostgreSQL 15 (via Sequelize ORM) |
| Caching & Queues | Redis (BullMQ + express-rate-limit) |
| Validation | Zod |
| Auth | JWT + bcrypt |
| Security Headers | Helmet.js |
| Observability | Prometheus + Winston + Morgan |
| Testing | Jest & Supertest |
| CI/CD | GitHub Actions |
| Containerization | Docker + Docker Compose |

---

## ⚙️ Local Development Setup

### 1. Prerequisites

- Node.js (v24.x)
- Docker & Docker Compose

### 2. Clone and Install

```bash
git clone https://github.com/Saurabh-827/Healthcare_Booking_Consultation_API.git
cd Healthcare_Booking_Consultation_API
npm install
```

### 3. Environment Variables

Create a `.env` file in the root directory:

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

# Security (required — app crashes if missing)
JWT_SECRET=your_super_secret_key_min_32_chars
```

> **Note:** `JWT_SECRET` is mandatory. The app will throw a fatal error on startup if it is not set.

### 4. Start Infrastructure

```bash
docker compose up -d
```

> Wait a few seconds for PostgreSQL and Redis to fully initialize.

### 5. Run the Application

Open two terminals:

**Terminal 1 — API Server:**
```bash
npm run dev
```

**Terminal 2 — Background Worker:**
```bash
npm run worker
```

### 6. Production Docker Build

```bash
docker build -t healthcare-api .
docker run -p 3000:3000 --env-file .env healthcare-api
```

---

## 📡 API Endpoints

| Method | Endpoint | Auth | Role | Description |
|---|---|---|---|---|
| POST | `/api/v1/auth/register` | ❌ | — | Register new user |
| POST | `/api/v1/auth/login` | ❌ | — | Login, get JWT token |
| GET | `/api/v1/auth/profile` | ✅ | All | Get own profile |
| GET | `/api/v1/doctors` | ❌ | — | Search/filter doctors |
| POST | `/api/v1/doctors/onboard` | ✅ | Admin | Onboard a new doctor |
| GET | `/api/v1/availability` | ❌ | — | Get available slots by doctor + date |
| POST | `/api/v1/availability/create` | ✅ | Doctor/Admin | Create availability slot |
| POST | `/api/v1/appointments/book` | ✅ | Patient | Book a slot (idempotent) |
| POST | `/api/v1/payments/pay` | ✅ | Patient | Process payment (idempotent) |
| POST | `/api/v1/prescriptions` | ✅ | Doctor | Create prescription |
| GET | `/api/v1/admin/analytics` | ✅ | Admin | Platform dashboard stats |
| GET | `/api/v1/admin/audit-logs` | ✅ | Admin | Recent audit logs |
| GET | `/health` | ❌ | — | Health check |
| GET | `/metrics` | ❌ | — | Prometheus metrics |

> **Idempotent routes** require `x-idempotency-key` header (UUID format).

---

## 🧪 Testing

```bash
npm run test
```

Covers: Auth flows, appointment booking (idempotency + validation), payment processing, health check. All tests use mocked services — no live DB required.

---

## 📖 Documentation

| Document | Description |
|---|---|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design, sequence diagrams, ER diagram, DR strategy |
| [SECURITY.md](./docs/SECURITY.md) | STRIDE threat model, security checklist |
| [openapi.yaml](./openapi.yaml) | Full OpenAPI 3.0 spec |
| [Postman Collection](./docs/healthcare-booking-api.json) | Import into Postman to test all endpoints |

---

## 🔒 Security Highlights

- JWT tokens signed with mandatory `JWT_SECRET` env var — no hardcoded fallbacks
- Passwords hashed with `bcrypt` (10 salt rounds)
- `Helmet.js` sets secure HTTP headers (XSS, HSTS, no-sniff)
- Zod validates all inputs before any DB operation
- Redis-backed rate limiting on all routes (stricter on `/auth`)
- Pessimistic locking prevents double-booking race conditions
- Full audit trail via `AuditLogs` table

See [SECURITY.md](./docs/SECURITY.md) for full threat model.
