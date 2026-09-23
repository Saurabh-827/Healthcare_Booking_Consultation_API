# Security Checklist & Threat Model

## 1. Threat Model (STRIDE Methodology)
*   **Spoofing:** Mitigated via strong JWT-based authentication. Tokens are signed with secure environment variables.
*   **Tampering:** Mitigated via strict `Zod` schema validation for all incoming request payloads, preventing malformed data injection.
*   **Repudiation:** Mitigated via comprehensive `AuditLog` tracking for all critical system and Admin actions.
*   **Information Disclosure:** Mitigated using `Helmet.js` to mask server headers, secure error handling (stripping stack traces in production), and `bcrypt` for password hashing.
*   **Denial of Service (DoS):** Mitigated via `express-rate-limit` (backed by Redis) to prevent API abuse and brute-force attacks.
*   **Elevation of Privilege:** Mitigated via strict Role-Based Access Control (RBAC) middlewares isolating Patient, Doctor, and Admin routes.

## 2. Security Implementation Checklist
*   [x] **Authentication:** JWT tokens verify user identity securely.
*   [x] **Authorization:** `authorizeRole` middleware enforces endpoint-level access control.
*   [x] **Input Validation:** Zod validates UUIDs, emails, dates, and enums before controller logic executes.
*   [x] **Concurrency / Race Conditions:** Pessimistic locking (`LOCK.UPDATE`) implemented on `AvailabilitySlot` fetching to prevent double-booking.
*   [x] **Idempotency:** `x-idempotency-key` header implemented on Payment and Booking routes to safely handle retries and prevent double-charging.
*   [x] **Data Protection:** Passwords securely hashed. SQL Injection prevented natively via Sequelize ORM parameter binding.
*   [x] **Headers & Protection:** Helmet.js integrated for secure HTTP headers (XSS protection, no-sniff, etc.).