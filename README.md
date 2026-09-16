# Klinik - Comprehensive Clinic Management System

**Klinik** is a state-of-the-art Medical Clinic Management & Electronic Medical Record (EMR) system built with **Next.js 14 App Router**, **Prisma**, **TypeScript**, **Tailwind CSS**, and **Vitest / Playwright**.

---

## Key Features

- 🏥 **Patient Management**: Unique HN generation (`HN-YYMMDD-XXXX`), Thai National ID 13-digit checksum validation.
- 🩺 **Doctor Consultation**: ICD-10 search & diagnosis, vital signs monitoring, prescription generation.
- 💊 **Pharmacy & Inventory**: Automated stock tracking, reorder alert thresholding, prescription dispensing.
- 💳 **Billing & Invoicing**: Automated net amount computation, PromptPay QR / cash receipt generation.
- 🔒 **Security Hardening**: Upstash Redis sliding-window rate limiting, DOMPurify sanitization, AES-256-GCM data encryption at rest.
- 🛡️ **PDPA Compliance**: Legal hold retention workflow (10-year rule), PHI access audit logging (`AuditLog`), cookie consent banner.
- 🚀 **CI/CD Pipeline**: GitHub Actions automated linting, unit testing, integration testing, and Playwright E2E testing.

---

## Quick Start Guide

### 1. Prerequisites
- Node.js 20+
- PostgreSQL database (or Supabase / Neon connection)

### 2. Environment Setup
Copy the environment template and fill in your database and Redis credentials:
```bash
cp .env.example .env
```

### 3. Install Dependencies & Generate Database Client
```bash
npm install
npx prisma generate
npx prisma db push
```

### 4. Seed Test Data
```bash
npm run db:seed
```

### 5. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Running Automated Tests

- **Unit & Integration Tests (Vitest)**:
  ```bash
  npm run test
  ```

- **End-to-End Tests (Playwright)**:
  ```bash
  npm run test:e2e
  ```

---

## Documentation Index

- [Architecture Overview](docs/ARCHITECTURE.md)
- [Database & Schema Reference](docs/DATABASE.md)
- [API & Server Actions Specification](docs/API.md)
- [คู่มือการใช้งานภาษาไทย (Thai User Manual)](docs/USER_GUIDE_TH.md)
- [PDPA Compliance Guide](docs/PDPA.md)
- [Disaster Recovery & Backup Playbook](docs/DISASTER_RECOVERY.md)
