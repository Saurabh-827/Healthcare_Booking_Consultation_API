# Security Checklist & Threat Model

## 1. Threat Model (STRIDE Methodology)
*   **Spoofing:** Mitigated via strong JWT-based authentication. Tokens are signed with secure environment variables.
*   **Tampering:** Mitigated via strict `Zod` schema validation for all incoming request payloads, preventing malformed data injection.
*   **Repudiation:** Mitigated via comprehensive `AuditLog` tracking for all critical system and Admin actions.
*   **Information Disclosure:** Mitigated using `Helmet.js` to mask server headers, secure error handling (stripping stack traces in production), and `bcrypt` for password hashing.
*   **Denial of Service (DoS):** Mitigated via `express-rate-limit` (backed by Redis) to prevent API abuse and brute-force attacks.
*   **Elevation of Privilege:** Mitigated via strict Role-Based Access Control (RBAC) middlewares isolating Patient, Doctor, and Admin routes.

## 2. Security Implementation Checklist
*   [x] **Authentication:** JWT tokens verify user identity securely. App crashes on startup if `JWT_SECRET` is missing — no fallback.
*   [x] **Authorization:** `authorizeRole` middleware enforces endpoint-level access control.
*   [x] **Input Validation:** Zod validates UUIDs, emails, dates, and enums before controller logic executes.
*   [x] **Concurrency / Race Conditions:** Pessimistic locking (`LOCK.UPDATE`) implemented on `AvailabilitySlot` fetching to prevent double-booking.
*   [x] **Idempotency:** `x-idempotency-key` header implemented on Payment and Booking routes to safely handle retries and prevent double-charging.
*   [x] **Data Protection:** Passwords securely hashed with bcrypt (10 salt rounds). SQL Injection prevented natively via Sequelize ORM parameter binding.
*   [x] **Headers & Protection:** Helmet.js integrated for secure HTTP headers (XSS protection, no-sniff, HSTS, etc.).
*   [x] **Audit Trail:** Every sensitive action (prescription creation, role changes) logged asynchronously to `AuditLogs` table.

## 3. Attack Surface Analysis

| Surface | Risk | Mitigation |
|---|---|---|
| `POST /auth/register` & `POST /auth/login` | Brute force, credential stuffing | Strict rate limiting (authRateLimiter), bcrypt hashing |
| `POST /appointments/book` | Double booking, race conditions | Pessimistic locking + idempotency key |
| `POST /payments/pay` | Double charging | Idempotency key + DB unique constraint |
| `GET /admin/*` | Privilege escalation | RBAC — Admin role required, JWT verified |
| `POST /availability/create` | Unauthorized slot creation | Doctor/Admin role required via RBAC |
| All write endpoints | SQL Injection, malformed data | Sequelize ORM parameterized queries + Zod validation |
| JWT tokens | Token forgery | Mandatory `JWT_SECRET` env var, no hardcoded fallback |

## 4. Data Classification

| Data Type | Classification | Protection |
|---|---|---|
| Passwords | Critical | bcrypt hashed (10 rounds), never returned in API responses |
| JWT Secrets | Critical | Environment variables only, app crashes if missing |
| Medical Records (Prescriptions) | Sensitive / PII | DB access controlled via RBAC, Doctor-only write access |
| Audit Logs | Internal | Admin-only read access, append-only writes |
| Email addresses | PII | Never logged in plaintext, used only for notifications |
| Payment amounts | Sensitive | Stored as `numeric(10,2)`, accessible only to involved parties |

## 5. Dependency Scanning

*   `npm audit` runs automatically in CI pipeline on every push to `main`
*   All dependencies pinned to specific versions in `package-lock.json`
*   Recommended: Add Snyk or GitHub Dependabot for automated vulnerability alerts on new CVEs
