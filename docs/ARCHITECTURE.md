# System Architecture & Technical Specifications

## 1. High-Level Architecture Overview

Klinik follows a modern Serverless / Micro-monolith architecture utilizing Next.js 14 App Router, PostgreSQL, Prisma ORM, and Edge Middleware.

```
+-----------------------------------------------------------------------+
|                             CLIENT LAYER                              |
|   Web Browsers (Desktop/Tablet)  |  Patient Self-Service Portal       |
+-----------------------------------------------------------------------+
                                   |
                                   v HTTPS (TLS 1.3) + CSP Headers
+-----------------------------------------------------------------------+
|                    NEXT.JS 14 EDGE MIDDLEWARE                         |
|  - Rate Limiter (Upstash Redis)  |  - CSRF Sanitizer                  |
|  - Security Headers (HSTS, CSP)  |  - Session Authenticator           |
+-----------------------------------------------------------------------+
                                   |
                                   v
+-----------------------------------------------------------------------+
|                      SERVER ACTIONS & API ROUTES                      |
|  - Patient Action Handler        |  - Examination & Diagnosis Engine  |
|  - Pharmacy Dispenser            |  - PDPA Audit Logger               |
+-----------------------------------------------------------------------+
                                   |
                                   v Connection Pooling (PgBouncer)
+-----------------------------------------------------------------------+
|                         DATABASE LAYER                                |
|  PostgreSQL (Supabase/Neon)  |  Prisma ORM  |  AES-256 Encrypted PHI   |
+-----------------------------------------------------------------------+
```

## 2. Security Infrastructure

### 2.1 Access Control (RBAC)
Role-Based Access Control is enforced on every Server Action and API Route:
- `ADMIN`: Full access to clinic settings, staff management, audit logs.
- `DOCTOR`: Access to patient records, consultation forms, ICD-10 diagnosis, prescription ordering.
- `NURSE`: Patient intake, vital signs recording, queue management.
- `PHARMACIST`: Prescription queue inspection, stock deduction, drug dispensing.
- `CASHIER`: Invoice generation, payment collection, receipt issuing.
- `PATIENT`: Access to own medical history, consent preferences, PDPA export portal.

### 2.2 Data Encryption & Protection
- **In Transit**: All client-server communication is strictly enforced via TLS 1.3.
- **At Rest**: Sensitive fields (e.g. National ID, phone numbers) can be encrypted with AES-256-GCM via `lib/security/encryption.ts`.
- **SQL Injection**: Prevented by parameterized query generation in Prisma ORM.
- **XSS Prevention**: DOMPurify HTML sanitization applied on rich text inputs.

## 3. Technology Stack Summary
- **Framework**: Next.js 14.2.x (React 18)
- **Database ORM**: Prisma 5.x
- **State Management**: React Query / TanStack Query
- **Validation**: Zod 3.x
- **Testing**: Vitest (Unit/Integration), Playwright (E2E)
- **Rate Limiting**: Upstash Redis `@upstash/ratelimit`
