# Architecture Document: HealthCare Booking & Consultation API

## 1. System Overview & Tech Stack

This document outlines the architecture for the HealthCare Booking & Consultation API, designed to handle 100k daily consultations with high availability (99.95%) and strict latency requirements (p95 < 200ms for reads, < 500ms for writes).

| Component | Technology | Reason |
|---|---|---|
| Runtime | Node.js + TypeScript | Non-blocking I/O for high concurrency |
| Framework | Express.js | Lightweight, middleware-friendly |
| Database | PostgreSQL 15 | ACID compliance, relational integrity |
| Caching & Queues | Redis + BullMQ | Sub-ms reads, async job processing |
| Auth | JWT + bcrypt | Stateless, scalable authentication |
| Validation | Zod | Runtime type-safe schema validation |
| Observability | Prometheus + Winston | Metrics, structured logging |
| Containerization | Docker + Docker Compose | Reproducible environments |
| CI/CD | GitHub Actions | Automated test + build pipeline |

---

## 2. High-Level Architecture & Data Flow

```
Client
  │
  ▼
Nginx / Load Balancer (SSL Termination)
  │
  ▼
Express API Server
  ├── Rate Limiter (Redis-backed)
  ├── Helmet (Security Headers)
  ├── Zod Validation
  ├── JWT Auth + RBAC
  │
  ├──▶ PostgreSQL (Writes: Bookings, Payments, Prescriptions)
  ├──▶ Redis Cache (Reads: Doctor availability, slots)
  └──▶ BullMQ Worker (Async: Email notifications)
```

**Request Flow:**
1. Client hits Load Balancer → SSL terminated
2. Rate Limiter checks Redis → blocks abuse
3. Zod validates request body/params
4. JWT middleware authenticates + RBAC authorizes
5. Controller → Service → Repository → PostgreSQL
6. Heavy tasks (email) pushed to BullMQ queue
7. Worker processes queue asynchronously

---

## 3. Booking Flow — Sequence Diagram

```
Patient          API Server          PostgreSQL              BullMQ
  │                  │                    │                     │
  │── POST /appointments/book ───────────▶│                     │
  │   (x-idempotency-key header)          │                     │
  │                  │                    │                     │
  │                  │── Check idempotency_key in DB ──────────▶│
  │                  │◀─ Already exists? Return cached 200 ─────│
  │                  │                    │                     │
  │                  │── BEGIN TRANSACTION ───────────────────▶ │
  │                  │                    │                     │
  │                  │── SELECT * FROM AvailabilitySlots        │
  │                  │   WHERE id = slot_id                     │
  │                  │   FOR UPDATE (Pessimistic Lock) ────────▶│
  │                  │◀─ slot row locked ─────────────────────  │
  │                  │                    │                     │
  │                  │  [slot.status !== 'available']           │
  │                  │── ROLLBACK ────────────────────────────▶ │
  │◀─ 409 Conflict ──│                    │                     │
  │                  │                    │                     │
  │                  │  [slot.status === 'available']           │
  │                  │── INSERT INTO Appointments ─────────────▶│
  │                  │── UPDATE slot SET status='booked' ──────▶│
  │                  │── COMMIT TRANSACTION ───────────────────▶│
  │                  │                    │                     │
  │                  │─────────────────────────── Queue Email ─▶│
  │◀─ 201 Created ───│                    │              Worker processes async
```

---

## 4. ER Diagram

![ER Diagram](./images/er-diagram.png)

**Core Table Relationships:**

```
users (id, email, password, role, first_name, last_name)
  │
  ├──▶ Doctors (id, user_id FK, speciality, experience_years)
  │         │
  │         └──▶ AvailabilitySlots (id, doctor_id FK, start_time, end_time, status)
  │                     │
  │                     └──▶ Appointments (id, patient_id FK, doctor_id FK, slot_id FK,
  │                                        appointment_date, status, idempotency_key)
  │                                │
  │                                ├──▶ Payments (id, appointment_id FK, amount,
  │                                │              status, idempotency_key)
  │                                │
  │                                └──▶ Prescriptions (id, appointment_id FK,
  │                                                    symptoms, diagnosis, medicines)
  │
  └──▶ AuditLogs (id, user_id FK, action, entity, entity_id, details)
```

---

## 5. Caching, Data Partitioning & Concurrency

- **Caching Strategy:** Doctor profiles and availability slots cached in Redis. Cache invalidated on slot booking or schedule update.
- **Concurrency (Double Booking Prevention):** PostgreSQL `SELECT ... FOR UPDATE` (Pessimistic Locking) on `AvailabilitySlots` during booking transaction. Only one request can lock a row at a time.
- **Data Partitioning:** `AuditLogs` and `Appointments` tables partitioned by `created_at` (monthly) for long-term query performance at scale.

---

## 6. Transaction Management & Sagas

**Booking Saga Steps:**
1. `Reserve Slot` — Lock + mark slot as `booked`
2. `Create Appointment` — Insert appointment record
3. `Process Payment` — Charge patient (separate idempotent call)
4. `Send Notification` — Async email via BullMQ

**Compensating Transactions (Rollback):**
- Payment fails → Appointment stays `pending`, slot reverted to `available`
- DB error mid-transaction → Full rollback via `sequelize.transaction()`

**Idempotency:** `x-idempotency-key` header required on Booking + Payment routes. Duplicate keys return cached response — no double charging.

---

## 7. Retry & Backoff Strategies

- **Email/Notification failures:** BullMQ built-in retry with exponential backoff. Failed jobs move to Dead Letter Queue (DLQ) after 3 attempts.
- **External Payment Gateway:** Exponential backoff — 1s → 2s → 4s → fail with alert.
- **Database connection drops:** Sequelize connection pool auto-reconnects with configurable retry limits.

---

## 8. Security & Threat Modeling

See [SECURITY.md](./SECURITY.md) for full STRIDE threat model and checklist.

**Summary:**
- JWT authentication, no fallback secrets — app crashes if `JWT_SECRET` missing
- RBAC middleware on every protected route
- Helmet.js for secure HTTP headers
- Zod input validation before any DB operation
- bcrypt (salt rounds: 10) for password hashing
- Redis-backed rate limiting (global + auth-specific)
- AuditLog table for compliance tracking

---

## 9. Observability

- **Metrics:** Prometheus (`/metrics` endpoint) — HTTP request count, p95 latency histograms
- **Logging:** Winston structured JSON logs → `logs/all.log` + `logs/error.log`
- **HTTP Logging:** Morgan middleware piped to Winston
- **Health Check:** `GET /health` endpoint for load balancer probes

---

## 10. Backup & Disaster Recovery (DR) Strategy

| Strategy | Implementation |
|---|---|
| Database Backups | Daily `pg_dump` snapshots to S3-compatible storage |
| Point-in-Time Recovery | PostgreSQL WAL archiving enabled |
| Redis Persistence | RDB snapshots every 60s + AOF logging |
| Multi-AZ Deployment | Primary DB + read replica in separate availability zones |
| Failover | Automated failover via pgBouncer / RDS Multi-AZ |
| RTO Target | < 30 minutes |
| RPO Target | < 5 minutes data loss |
| DR Testing | Monthly failover drills |
