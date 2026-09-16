# 🏗️ Architecture Blueprint: Tomvis Clinic System Decoupling

**Document ID:** `docs/ARCHITECTURE.md`  
**Version:** 2.0.0 (Production Blueprint)  
**Status:** Approved Architecture Standard  
**Target Domain:** Thai Healthcare Management, MOPH 43-Folder, FDA อย.ส.4/5, PDPA B.E. 2562 Compliance  

---

## SECTION A: RECOMMENDED ARCHITECTURE & TECHNOLOGY STACK

### 1. Backend Framework Choice: **NestJS (TypeScript)**

#### Comparative Evaluation:
| Criteria | **NestJS** (Recommended) | Hono | Fastify | Express | Elysia | tRPC Standalone |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Architectural Structure** | ⭐⭐⭐⭐⭐ (Modular DI) | ⭐⭐ (Minimal) | ⭐⭐⭐ (Plugins) | ⭐ (Unstructured) | ⭐⭐ (Minimal) | ⭐⭐⭐ (Type-bound) |
| **Thai Hiring Pool & Familiarity** | ⭐⭐⭐⭐⭐ (Very High) | ⭐⭐ (Emerging) | ⭐⭐⭐ (Moderate) | ⭐⭐⭐⭐⭐ (Legacy) | ⭐ (Niche) | ⭐⭐⭐ (Web-centric) |
| **OpenAPI Auto-Docs Generation** | ⭐⭐⭐⭐⭐ (Built-in) | ⭐⭐⭐ (Zod OpenAPI) | ⭐⭐⭐ (Swagger Plugin) | ⭐⭐ (Manual Swagger) | ⭐⭐⭐ (TypeBox) | ❌ (No Native OpenAPI) |
| **Maintainability with 8 Devs** | ⭐⭐⭐⭐⭐ (Strict Rules) | ⭐⭐⭐ (Requires Discipline)| ⭐⭐⭐ | ⭐⭐ (Chaos Risk) | ⭐⭐ | ⭐⭐⭐ |
| **Performance (Req/Sec)** | ⭐⭐⭐ (High Node.js) | ⭐⭐⭐⭐⭐ (Ultra Fast)| ⭐⭐⭐⭐ | ⭐⭐ | ⭐⭐⭐⭐⭐ (Bun) | ⭐⭐⭐⭐ |

#### Final Justification for NestJS:
1. **Developer Hiring Pool in Thailand:** NestJS and Express are the standard frameworks taught in Thai tech universities and coding bootcamps. Recruiting 4–8 Node.js/NestJS developers in Bangkok/Thailand is significantly faster than finding specialized Bun/Elysia or Hono engineers.
2. **Strict Architecture Guardrails for Mixed Teams:** Junior and mid-level developers can easily introduce spaghetti code in minimal frameworks like Express or Hono. NestJS enforces Controllers, Services, Modules, and Dependency Injection, ensuring code consistency across 8 parallel developers.
3. **Native Enterprise Decorators & Validation:** Seamless integration with `class-validator`, `zod`, NestJS Guards (RBAC/ABAC), Interceptors (Audit Logging), and automated Swagger/OpenAPI 3.1 documentation generation.

---

### 2. Frontend Framework Choice: **Next.js 16 (App Router) — Kept as Web BFF**

#### Justification:
- **Keep Next.js 16 App Router for Web Clients:** Next.js serves as an ultra-fast Backend-for-Frontend (BFF) rendering server. It handles Server-Side Rendering (SSR) for initial medical dashboard loads, manages secure HttpOnly session cookies, and handles HTML streaming.
- **Native Mobile Clients (iOS/Android):** Built separately using **Flutter**, connecting directly to the NestJS API Gateway via OpenAPI-generated Dart SDKs.

---

### 3. API Style: **Hybrid (tRPC for Web BFF + REST OpenAPI 3.1 for Mobile & Third-Party)**

#### API Protocol Matrix:
- **Primary API Style:** **REST + OpenAPI 3.1 (NestJS Swagger)**
  - *Target:* Native Mobile Apps (iOS/Android), External Laboratories, Insurance Clearinghouses, NHSO Government APIs, and Enterprise B2B Customers.
  - *Why:* Universal compatibility across language ecosystems (Dart/Flutter, Python, Java, Go).
- **Secondary (Web BFF):** **tRPC / SWR Query Hooks**
  - *Target:* Next.js Web UI internal communication.
  - *Why:* Provides end-to-end TypeScript autocomplete from NestJS DTOs to Next.js Web components without code generation steps.

---

### 4. Transport Layer Mapping per Healthcare Use Case

| Use Case | Recommended Transport | Protocol | Justification |
| :--- | :--- | :--- | :--- |
| **1. OPD Queue TV Display** | **Server-Sent Events (SSE)** | HTTP/2 SSE | Unidirectional, ultra-lightweight, automatic browser reconnection, minimal server overhead for public screens. |
| **2. System Notifications** | **Web Push / LINE Notify API** | HTTPS / Webhooks | Native mobile WebPush for patient alerts and LINE Notify API for Thai patient LINE messaging. |
| **3. Real-time Triage Chat** | **WebSockets** | Socket.IO (WSS) | Full-duplex bidirectional messaging between nurse triage and doctor consultation rooms. |
| **4. Telemedicine Consult** | **WebRTC + Signaling** | WebSockets (SFU) | Peer-to-peer high-definition encrypted audio/video streaming with WebRTC signaling server. |
| **5. Lab Device Integrations** | **MQTT / HTTP Webhooks** | MQTT over TLS | Lightweight pub/sub transport for blood analyzer machines and point-of-care laboratory hardware. |

---

### 5. Authentication & Security Architecture

```
┌─────────────────┐      Cookie (HttpOnly, Secure)      ┌──────────────────┐
│ Next.js Web BFF ├────────────────────────────────────►│ API Gateway      │
└─────────────────┘                                     │ (Kong / NGINX)   │
                                                        └────────┬─────────┘
┌─────────────────┐       Bearer JWT (Header)                    │ Validate Token
│ Mobile App / B2B├──────────────────────────────────────────────┘
└─────────────────┘                                              │
                                                                 ▼
                                                        ┌──────────────────┐
                                                        │ NestJS Micro-Svc │
                                                        └──────────────────┘
```

- **Web App Auth:** Next.js Web BFF stores session tokens in `HttpOnly, Secure, SameSite=Strict` cookies. Web BFF attaches standard signed Bearer JWTs to backend microservice requests.
- **Mobile & B2B Partner Auth:** Direct Bearer JWTs stored in iOS SecureEnclave / Android KeyStore.
- **Token Lifetimes & Rotation:**
  - **Access Token:** Short-lived JWT (15-minute expiration) containing User ID, Role, Branch ID, and Tenant ID.
  - **Refresh Token:** Long-lived (7-day expiration) stored in Redis with automatic rotation on reuse detection.
  - **Revocation Strategy:** Instant blacklisting via Redis pub/sub when user logs out or account is locked out (NIST 800-63B).

---

### 6. Data Layer & Caching Architecture

- **Shared Database (Modular Monolith Phase):** Single managed PostgreSQL cluster using **Row-Level Security (RLS)** for multi-tenant isolation.
- **ORM & Data Access:** Prisma ORM utilized exclusively inside the NestJS Backend Data Layer.
- **Read Replicas:** Database read-replicas provisioned specifically for long-running analytical reports (FDA อย.ส.4/5 exports, revenue summaries).
- **Caching Layer:** Redis cluster caching hot master data (Medication TMT codes, ICD-10-TM dictionaries, active doctor schedules).
- **Full-Text Search:** PostgreSQL Native Full-Text Search (FTS) with Thai `pg_trgm` dictionary indexes for rapid patient HN/CID/Name lookups.

---

## SECTION B: SYSTEM DECOMPOSITION (15 MODULAR SERVICES)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 NESTJS MODULAR BACKEND ENGINE                                   │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬──────────────────┤
│ 1. Identity       │ 2. Patient        │ 3. Appointment    │ 4. Clinical       │ 5. Prescription  │
│ 6. Inventory      │ 7. Billing        │ 8. Claims         │ 9. Laboratory     │ 10. Report       │
│ 11. Notification  │ 12. Integration   │ 13. File & DICOM  │ 14. Audit (WORM)  │ 15. Admin        │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴──────────────────┘
```

### Module Specifications:

#### 1. Identity Service
- **Responsibility:** User authentication, password policies (NIST 800-63B), RBAC/ABAC permission checks, MFA, session management.
- **API Surface:** `POST /api/v1/auth/login`, `POST /api/v1/auth/refresh`, `POST /api/v1/auth/mfa/verify`, `GET /api/v1/users/me`.
- **Database Schema Ownership:** `User`, `Role`, `UserBranch`, `Session`.
- **Dependencies:** Audit Service, Notification Service.
- **Events Published:** `user.authenticated`, `user.lockout_triggered`, `user.password_changed`.

#### 2. Patient Service
- **Responsibility:** Master Patient Index (MPI), Thai CID Modulus 11 validation, PII encryption at rest, duplicate record merging.
- **API Surface:** `POST /api/v1/patients`, `GET /api/v1/patients/:hn`, `POST /api/v1/patients/merge`, `GET /api/v1/patients/search`.
- **Database Schema Ownership:** `Patient`, `PatientConsent`, `PatientMergeLog`.
- **Dependencies:** Audit Service, Identity Service.
- **Events Published:** `patient.registered`, `patient.updated`, `patient.merged`.

#### 3. Appointment Service
- **Responsibility:** OPD schedule management, walk-in queue processing, room allocation, queue TV display SSE streaming.
- **API Surface:** `POST /api/v1/appointments`, `GET /api/v1/appointments/queue/today`, `GET /api/v1/queue/tv-stream` (SSE).
- **Database Schema Ownership:** `Appointment`, `QueueSlot`, `Room`.
- **Dependencies:** Patient Service, Identity Service.
- **Events Published:** `appointment.booked`, `queue.called`, `appointment.cancelled`.

#### 4. Clinical Service (EMR Core)
- **Responsibility:** SOAP examination notes, ICD-10-TM diagnosis entry, vital signs tracking, DLT medical certificates.
- **API Surface:** `POST /api/v1/clinical/soap`, `GET /api/v1/clinical/icd10tm/search`, `POST /api/v1/clinical/medical-cert`.
- **Database Schema Ownership:** `AppointmentNotes`, `DiagnosisRecord`, `MedicalCertificate`, `EmrVersionHistory`.
- **Dependencies:** Patient Service, Appointment Service.
- **Events Published:** `examination.completed`, `diagnosis.recorded`, `certificate.issued`.

#### 5. Prescription Service
- **Responsibility:** E-Prescribing, drug-allergy checking, drug-drug interaction validation, narcotic Schedule 2-4 alerts.
- **API Surface:** `POST /api/v1/prescriptions`, `POST /api/v1/prescriptions/check-interactions`, `GET /api/v1/prescriptions/:id`.
- **Database Schema Ownership:** `Prescription`, `PrescriptionItem`, `ControlledDrugLog`.
- **Dependencies:** Clinical Service, Inventory Service, Patient Service.
- **Events Published:** `prescription.created`, `controlled_drug.dispensed`, `adverse_reaction.detected`.

#### 6. Inventory Service
- **Responsibility:** Stock cards, TMT 24-digit codes, drug lot expiration (FEFO), cold chain 2°C–8°C refrigerator temperature logs.
- **API Surface:** `GET /api/v1/inventory/stock-card`, `POST /api/v1/inventory/lots`, `POST /api/v1/inventory/cold-chain/log`.
- **Database Schema Ownership:** `Medication`, `DrugLot`, `StockCard`, `ColdChainLog`.
- **Dependencies:** Audit Service.
- **Events Published:** `stock.reorder_level_reached`, `cold_chain.excursion_alert`, `lot.expired`.

#### 7. Billing Service
- **Responsibility:** Cashier invoice calculations, PromptPay dynamic QR generation, revenue tax receipts (Section 81 VAT exempt).
- **API Surface:** `POST /api/v1/billing/invoices`, `POST /api/v1/billing/promptpay/generate`, `POST /api/v1/billing/tax-receipts`.
- **Database Schema Ownership:** `Invoice`, `InvoiceItem`, `TaxReceipt`, `PaymentTransaction`.
- **Dependencies:** Prescription Service, Patient Service.
- **Events Published:** `invoice.created`, `payment.received`, `tax_receipt.generated`.

#### 8. Claims Service
- **Responsibility:** Government NHSO / Universal Coverage claim generation, Social Security clearinghouse data exporters.
- **API Surface:** `POST /api/v1/claims/nhso/export`, `GET /api/v1/claims/status`.
- **Database Schema Ownership:** `ClaimBatch`, `ClaimItem`, `InsurancePolicy`.
- **Dependencies:** Clinical Service, Billing Service.
- **Events Published:** `claim.batch_submitted`, `claim.reimbursed`.

#### 9. Lab Service
- **Responsibility:** Laboratory test ordering, sample barcode tracking, LIS HL7 / FHIR machine interfaces.
- **API Surface:** `POST /api/v1/labs/orders`, `POST /api/v1/labs/results`, `GET /api/v1/labs/patient/:hn`.
- **Database Schema Ownership:** `LabOrder`, `LabResultItem`, `LabSample`.
- **Dependencies:** Clinical Service, Patient Service.
- **Events Published:** `lab.ordered`, `lab.result_received`, `lab.critical_value_alert`.

#### 10. Report Service
- **Responsibility:** Intelligent custom report builder algorithm, FDA อย.ส.4/5 exports, NCD DM/HT registry analytics.
- **API Surface:** `POST /api/v1/reports/custom/generate`, `GET /api/v1/reports/fda-schedule-4-5/export`.
- **Database Schema Ownership:** `ReportTemplate`, `ReportJob`.
- **Dependencies:** All services (via Read Replicas).
- **Events Published:** `report.export_completed`.

#### 11. Notification Service
- **Responsibility:** Dispatching SMS, LINE Notify alerts, Web Push notifications, and emergency cold chain email alerts.
- **API Surface:** `POST /api/v1/notifications/send`, `POST /api/v1/notifications/line/webhook`.
- **Database Schema Ownership:** `NotificationLog`, `TemplateConfig`.
- **Dependencies:** Integration Service.
- **Events Published:** `notification.sent`, `notification.failed`.

#### 12. Integration Service
- **Responsibility:** External HTTP API Adapters (PromptPay gateway, e-Tax signing API, LINE Messaging API, NHSO API).
- **API Surface:** `POST /api/v1/integrations/etax/sign`, `POST /api/v1/integrations/line/push`.
- **Database Schema Ownership:** `IntegrationConfig`, `WebhookLog`.
- **Dependencies:** Security Service.
- **Events Published:** `integration.request_dispatched`, `integration.error_logged`.

#### 13. File Service
- **Responsibility:** Encrypted S3 object uploads, PDF medical certificate generation, DICOM medical image previewing.
- **API Surface:** `POST /api/v1/files/upload`, `GET /api/v1/files/medical-cert/:id/pdf`.
- **Database Schema Ownership:** `FileMetaData`.
- **Dependencies:** Storage Infrastructure.
- **Events Published:** `file.uploaded`, `file.deleted`.

#### 14. Audit Service (WORM Security)
- **Responsibility:** Write-Once-Read-Many cryptographic HMAC-SHA256 audit logging for PHI data access compliance.
- **API Surface:** `POST /api/v1/audit/log`, `GET /api/v1/audit/verify-chain`.
- **Database Schema Ownership:** `AuditLog`.
- **Dependencies:** Cryptographic Key Management.
- **Events Published:** `audit.tampering_detected`.

#### 15. Admin Service
- **Responsibility:** Clinic branch master settings, operational hours configuration, role assignment.
- **API Surface:** `GET /api/v1/admin/clinic-settings`, `PUT /api/v1/admin/clinic-settings`.
- **Database Schema Ownership:** `ClinicConfig`, `BranchMaster`.
- **Dependencies:** Identity Service.
- **Events Published:** `clinic_settings.updated`.

---

## SECTION C: BOUNDARIES & BOUNDED CONTEXTS (DDD)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                     CORE DOMAINS (Primary Value)                                 │
│  - Clinical EMR Context (SOAP, ICD-10-TM, Medical Certs)                                          │
│  - Billing & Tax Context (Invoices, Tax Receipts, PromptPay)                                     │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                 SUPPORTING DOMAINS (Operational)                                 │
│  - Patient Registry Context         - Appointment & Queue Context                                │
│  - Inventory & Cold Chain Context   - Prescription & Pharmacy Context                            │
│  - Claims & NHSO Context            - Laboratory Context                                         │
├──────────────────────────────────────────────────────────────────────────────────────────────────┤
│                                    GENERIC DOMAINS (Infrastructure)                              │
│  - Identity & Access Context        - Notification & LINE Context                                │
│  - WORM Audit Trail Context         - File & PDF Generation Context                              │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### Anti-Corruption Layers (ACL):
1. **NHSO Government Claim ACL:** Translates internal EMR diagnosis codes to standard Thai MOPH 43-Folder / 16-Folder XML formats.
2. **e-Tax Revenue Department ACL:** Converts internal billing records to Revenue Dept compliant signed JSON payloads.
3. **LINE Messaging ACL:** Wraps LINE Messaging API calls so clinical domains are completely decoupled from LINE payload formats.

---

## SECTION D: DEPLOYMENT TOPOLOGY

```
                                  [ CLOUDFLARE CDN / WAF ]
                                             │
                      ┌──────────────────────┴──────────────────────┐
                      ▼                                             ▼
       ┌──────────────────────────────┐              ┌──────────────────────────────┐
       │   Vercel Edge Platform       │              │  AWS ECS / Render Cluster    │
       │   (Next.js 16 Web BFF)       │              │  (NestJS API Backend)        │
       └──────────────┬───────────────┘              └──────────────┬───────────────┘
                      │                                             │
                      └──────────────────────┬──────────────────────┘
                                             ▼
                       ┌──────────────────────────────────────────┐
                       │           MANAGED INFRASTRUCTURE          │
                       ├────────────────────┬─────────────────────┤
                       │ AWS RDS Postgres   │ Upstash Redis       │
                       │ (Managed DB + RLS) │ (BullMQ Queues)     │
                       ├────────────────────┼─────────────────────┤
                       │ AWS S3 / R2        │ Sentry & Axiom      │
                       │ (Encrypted Storage)│ (Monitoring & Logs) │
                       └────────────────────┴─────────────────────┘
```

---

## SECTION E: PHASED MIGRATION STRATEGY (STRANGLER FIG PATTERN)

```
Phase 1: Read Extraction ──► Phase 2: Write Extraction ──► Phase 3: Billing & Reports ──► Phase 4: Full Cutover
(Auth & Patient Reads)      (Clinical SOAP Writes)       (Invoices & อย.ส.4/5)        (Retire Monolith APIs)
```

### Phase 1: Identity & Patient Read Extraction
- **Risk:** Session token mismatch during initial cutover.
- **Rollback:** Instant DNS fallback to Next.js Monolith route handlers.
- **Testing:** Automated integration tests validating JWT payload compatibility across Monolith and NestJS.

### Phase 2: Clinical SOAP Examination Write Flows
- **Risk:** Data sync delays between Monolith DB transactions and NestJS services.
- **Rollback:** Feature-flag toggle `USE_NESTJS_CLINICAL_API=false` in Next.js BFF.
- **Testing:** Parallel write validation comparing database outputs in staging environments.

### Phase 3: Billing, Invoices & FDA อย.ส.4/5 Exports
- **Risk:** Tax calculation rounding errors.
- **Rollback:** Revert billing routes to Next.js Server Actions.
- **Testing:** Automated unit testing verifying 100% precision match on VAT calculations.

### Phase 4: Full Monolith API Retirement
- **Risk:** Residual calls to legacy `/api` routes.
- **Rollback:** Keep Next.js HTTP 301 Redirect proxies active for 30 days.
- **Testing:** Comprehensive E2E Playwright test suite across all 15 services.

---

## SECTION F: TRADE-OFFS ANALYSIS MATRIX

| Dimension | Full-Stack Monolith (Current) | Decoupled Architecture (Target) |
| :--- | :--- | :--- |
| **Development Velocity (Small Team)** | ⭐⭐⭐⭐⭐ (Fast Initial MVP) | ⭐⭐⭐ (Requires API Contracts) |
| **System Scalability (10x Load)** | ⭐⭐ (Monolithic Bottlenecks) | ⭐⭐⭐⭐⭐ (Independent Scaling) |
| **Mobile App Integration** | ⭐⭐ (Requires Hacky Actions) | ⭐⭐⭐⭐⭐ (Native OpenAPI SDKs) |
| **Multi-Team Parallel Work** | ⭐⭐ (Git Merge Conflicts) | ⭐⭐⭐⭐⭐ (Strict Service Boundaries)|
| **Operational Infrastructure Cost** | ⭐⭐⭐⭐⭐ (Low Managed Cost) | ⭐⭐⭐ (Moderate Cluster Cost) |
| **PDPA Compliance Isolation** | ⭐⭐⭐ (Logical Isolation) | ⭐⭐⭐⭐⭐ (Strict RLS & Boundary Audit)|

---

## 🎯 Architectural Approval
This document constitutes the definitive architectural design standard for Tomvis Clinic. All future engineering sprints and API designs must adhere to the boundaries specified herein.
