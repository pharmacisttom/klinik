# 🔄 Migration Strategy & Runbook: Monolith to Decoupled Architecture

**Document ID:** `docs/MIGRATION_PLAN.md`  
**Version:** 1.0.0 (Execution Blueprint)  
**Strategy:** Strangler Fig Pattern (Zero-Downtime Phased Extraction)  
**Timeline:** 18 Weeks Total (6 Phases)  
**Target Domain:** Tomvis Clinic Management System  

---

## SECTION A: CURRENT VS. TARGET ARCHITECTURAL STATE

```
CURRENT MONOLITH STATE (Phase 0)                TARGET DECOUPLED STATE (Phase 6)
┌──────────────────────────────────────┐        ┌──────────────────────────────────────┐
│  Next.js 16 Monolith                 │        │  Next.js 16 Web BFF (Vercel)         │
│  - App Router UI Pages               │        │  - Stateless Rendering UI            │
│  - Server Actions (Mutations)        │ ──►    │  - Cookie Session Management         │
│  - Direct Prisma DB Access           │        └──────────────────┬───────────────────┘
│  - Direct Session Store              │                           │ REST + Bearer JWT
└──────────────────┬───────────────────┘                           ▼
                   │                            ┌──────────────────────────────────────┐
                   ▼                            │  NestJS Backend API (Railway/AWS)    │
┌──────────────────────────────────────┐        │  - 15 Modular Micro-services         │
│  SQLite / PostgreSQL DB              │        │  - Exclusive Prisma DB Owner         │
└──────────────────────────────────────┘        └──────────────────┬───────────────────┘
                                                                   │
                                                                   ▼
                                                ┌──────────────────────────────────────┐
                                                │  PostgreSQL + Redis (BullMQ / Queue) │
                                                └──────────────────────────────────────┘
```

---

## SECTION B: STRANGLER FIG 18-WEEK PHASED PLAN

```
W1-W2        W3-W4        W5-W6        W7-W8        W9-W12        W13-W16       W17-W18
Phase 0 ──►  Phase 1 ──►  Phase 2 ──►  Phase 3 ──►  Phase 4  ──►  Phase 5  ──►  Phase 6
Infra Setup  Auth Ext.    Patient Read Patient Write Clinical EMR   Billing/Report Cleanup
```

### Phase 0: Infrastructure Setup & Preparation (Weeks 1–2)
- **Goal:** Establish NestJS backend repository, CI/CD pipeline, and `@tomvis/contracts` workspace.
- **Deliverables:**
  - Standalone NestJS repo initialized with Docker, Prisma, Pino logger, and Sentry monitoring.
  - Deploy empty NestJS backend to staging (`https://api-staging.tomvis.local/health`).
  - Publish `@tomvis/contracts` package for shared Zod schemas.
- **User Impact:** Zero user-visible changes.

---

### Phase 1: Identity & Auth Extraction (Weeks 3–4)
- **Goal:** Migrate authentication from NextAuth DB sessions to NestJS JWT issuance.
- **Deliverables:**
  - NestJS implements `/api/v1/auth/login`, `/refresh`, `/logout`, `/mfa`.
  - NextAuth on frontend configured to exchange credentials for backend NestJS Bearer JWTs.
  - Maintain dual-session token lookup in Redis during 14-day transition window.
- **Feature Flag:** `USE_BACKEND_AUTH=true`.

---

### Phase 2: Patient Read Endpoint Extraction (Weeks 5–6)
- **Goal:** Decouple patient listing, search, and demographic view endpoints.
- **Deliverables:**
  - NestJS implements `GET /api/v1/patients`, `GET /api/v1/patients/:hn`, `GET /api/v1/patients/search`.
  - Next.js Web Server Components fetch patient data via `apiFetch()` pointing to NestJS API.
  - Fallback logic to legacy Server Actions if backend API fails.
- **Feature Flag:** `USE_BACKEND_PATIENT_READ=true`.

---

### Phase 3: Patient Write & Merge Extraction (Weeks 7–8)
- **Goal:** Migrate patient registration and record merging.
- **Deliverables:**
  - NestJS implements `POST /api/v1/patients`, `PATCH /api/v1/patients/:id`, `POST /api/v1/patients/:id/merge`.
  - Frontend replaces Server Actions with API calls attaching `Idempotency-Key` headers.
- **Feature Flag:** `USE_BACKEND_PATIENT_WRITE=true`.

---

### Phase 4: Clinical EMR, Prescription & Lab Extraction (Weeks 9–12)
- **Goal:** Migrate SOAP examination records, ICD-10-TM diagnoses, e-Prescribing, and LIS orders.
- **Deliverables:**
  - NestJS implements Examinations, Prescriptions, Medications, and Lab Orders modules.
  - Connect BullMQ for asynchronous drug allergy checking and cold chain alerts.
- **Feature Flag:** `USE_BACKEND_CLINICAL=true`.

---

### Phase 5: Billing, Tax Receipts & Reports Extraction (Weeks 13–16)
- **Goal:** Migrate cashier invoices, PromptPay QR generation, tax receipts, and อย.ส.4/5 reports.
- **Deliverables:**
  - NestJS implements Billing, Claims (NHSO), and Report Builder modules.
  - PDF generation (Medical certs, Tax invoices) moved to NestJS worker threads.
- **Feature Flag:** `USE_BACKEND_BILLING=true`.

---

### Phase 6: Monolith Cleanup & Decommissioning (Weeks 17–18)
- **Goal:** Complete removal of legacy Server Actions and direct Prisma DB connections from Next.js.
- **Deliverables:**
  - Delete `prisma/` folder and `@prisma/client` dependency from Next.js Web BFF repository.
  - Revoke DB connection strings from Next.js Vercel environment variables.
  - Final penetration test, PDPA security audit, and documentation update.

---

## SECTION C: FEATURE FLAG CONFIGURATION & ADAPTER PATTERN

### `src/lib/adapters/data-source-adapter.ts`

```typescript
export const featureFlags = {
  useBackendAuth: process.env.NEXT_PUBLIC_USE_BACKEND_AUTH === 'true',
  useBackendPatientRead: process.env.NEXT_PUBLIC_USE_BACKEND_PATIENT_READ === 'true',
  useBackendPatientWrite: process.env.NEXT_PUBLIC_USE_BACKEND_PATIENT_WRITE === 'true',
  useBackendClinical: process.env.NEXT_PUBLIC_USE_BACKEND_CLINICAL === 'true',
  useBackendBilling: process.env.NEXT_PUBLIC_USE_BACKEND_BILLING === 'true',
};

export function shouldRouteToBackend(module: keyof typeof featureFlags): boolean {
  return featureFlags[module] ?? false;
}
```

---

## SECTION D: EMERGENCY ROLLBACK RUNBOOK PER PHASE

| Phase | Rollback Trigger Criteria | Reversion Step | Recovery Time (RTO) |
| :--- | :--- | :--- | :---: |
| **Phase 1 (Auth)** | Login failure rate > 1.0% | Set `NEXT_PUBLIC_USE_BACKEND_AUTH=false` in Vercel | < 2 Minutes |
| **Phase 2 (Patient Read)** | Latency p95 > 500ms | Set `NEXT_PUBLIC_USE_BACKEND_PATIENT_READ=false` | < 1 Minute |
| **Phase 3 (Patient Write)**| Unhandled HTTP 500 errors | Set `NEXT_PUBLIC_USE_BACKEND_PATIENT_WRITE=false` | < 1 Minute |
| **Phase 4 (Clinical)** | SOAP note save failures | Set `NEXT_PUBLIC_USE_BACKEND_CLINICAL=false` | < 1 Minute |
| **Phase 5 (Billing)** | Tax receipt calculation error | Set `NEXT_PUBLIC_USE_BACKEND_BILLING=false` | < 1 Minute |

### Reversion Execution Commands:

```bash
# Emergency Feature Flag Fallback Execution via Vercel CLI
vercel env add NEXT_PUBLIC_USE_BACKEND_CLINICAL false production
vercel deploy --prebuilt --prod
```

---

## SECTION E: RISK REGISTER & MITIGATION MATRIX

| Risk Item | Likelihood | Impact | Mitigation Strategy |
| :--- | :---: | :---: | :--- |
| **1. Auth Token Session Mismatch** | High | High | Dual session token lookup in Redis for 14 days during transition. |
| **2. API Network Latency Increase** | High | Medium | Implement Redis edge caching & HTTP/2 connection pooling. |
| **3. Multi-Developer Work Collision**| Medium | High | Enforce strict NestJS modular boundaries & `@tomvis/contracts` types. |
| **4. Database Data Inconsistency** | Low | Critical | Use single PostgreSQL cluster with RLS; zero data relocation. |
| **5. Rollback Execution Failure** | Low | High | Weekly automated rollback dry-runs in Staging environment. |

---

## SECTION F: TARGET SUCCESS METRICS

- **API Performance:** p95 latency < **250ms** across all NestJS core endpoints.
- **System Availability:** **99.95% Uptime** during the entire 18-week migration window.
- **Data Quality:** **Zero Data Loss** and **Zero Duplicate HN Creep**.
- **Error Rate:** Global API Error Rate < **0.1%**.
- **Developer Velocity:** Recovery to full velocity within **2 sprints** post-Phase 6 cleanup.
