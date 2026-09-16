# 👥 Team Structure, Workflow & Monorepo Governance: Tomvis Clinic

**Document ID:** `docs/TEAM_WORKFLOW_SPECIFICATION.md`  
**Version:** 1.0.0 (Engineering Management Standard)  
**Workspace Management:** Pnpm Workspaces + Turborepo  
**CI/CD Engine:** GitHub Actions + Vercel / Railway Deployment  
**Compliance Standard:** ISO 27001, PDPA B.E. 2562 Data Governance  

---

## SECTION A: TEAM ORGANIZATIONAL STRUCTURE

### Option A: Cross-Functional Feature Teams (Recommended)

```
                               ┌──────────────────────────┐
                               │   LEAD ARCHITECT / DPO   │
                               │   (Security & Governance)│
                               └────────────┬─────────────┘
                                            │
        ┌───────────────────────────────────┼───────────────────────────────────┐
        ▼                                   ▼                                   ▼
┌──────────────────────────────┐ ┌──────────────────────────────┐ ┌──────────────────────────────┐
│  TEAM 1: CLINICAL EMR        │ │  TEAM 2: BUSINESS & PATIENT  │ │  TEAM 3: PLATFORM & MOBILE   │
├──────────────────────────────┤ ├──────────────────────────────┤ ├──────────────────────────────┤
│ - 1 Senior Full-Stack Lead   │ │ - 1 Senior Backend Lead      │ │ - 1 DevOps / Infra Specialist│
│ - 1 Clinical EMR Backend Dev │ │ - 1 Frontend Web Developer   │ │ - 1 Mobile Flutter/RN Dev    │
│ - 1 Frontend UX Developer    │ │ - 1 Billing & Claims Dev     │ │ - 1 QA Automation Engineer   │
└──────────────────────────────┘ └──────────────────────────────┘ └──────────────────────────────┘
```

#### Justification for Cross-Functional Feature Teams over Layer Teams:
1. **End-to-End Domain Ownership:** Feature teams own clinical or business outcomes completely (from database schema to UI screen), eliminating inter-team finger-pointing.
2. **Faster Cycle Time:** Eliminates wait times between isolated "Frontend-only" and "Backend-only" teams.
3. **API Contract Pairing:** Frontend and Backend engineers on the same feature team pair up front to define OpenAPI specs before writing code.

---

## SECTION B: RACI MATRIX

| Activity / Artifact | Lead Architect | Backend Lead | Frontend Lead | Mobile Dev | DevOps | QA Engineer | Product Manager |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **API Contract Specification (OpenAPI)** | **A** | **R** | **R** | **C** | I | I | C |
| **NestJS Micro-Service Logic** | A | **R** | C | I | I | I | I |
| **Next.js Web BFF Implementation** | A | C | **R** | I | I | I | C |
| **Mobile Native App (iOS/Android)** | A | C | C | **R** | I | I | C |
| **Database Migrations & RLS Policies** | **A** | **R** | I | I | C | I | I |
| **CI/CD Pipeline & Infrastructure** | A | C | C | C | **R** | I | I |
| **QA Automated & UAT Testing** | A | I | I | I | I | **R** | **A** |
| **PDPA Security & WORM Audit Verification**| **R / A**| C | C | C | C | I | I |

*Legend: R = Responsible (Does work), A = Accountable (Approves), C = Consulted (Gives input), I = Informed (Kept updated)*

---

## SECTION C: FEATURE WORKFLOW & GIT BRANCHING STRATEGY

```
  main      ─────────────────────────────────────────────────● (Production)
                                                            ▲
  release/  ──────────────────────────────────────●──────────┤ (Staging UAT)
                                                  ▲          │
  develop   ─────────●─────────────────●──────────┼──────────┘
                      \               /           │
  feature/* ───────────●──────●──────●────────────┘ (PR with 1+ Approval & Passed CI)
```

### Pull Request (PR) Quality Gates:
1. **At least 1 Senior Approval** required (2 approvals for core clinical or security migrations).
2. **100% Passed Automated Tests** (Jest, Vitest, and Playwright E2E).
3. **Zero API Contract Drift:** `verify-api-contract` CI check must pass.
4. **Zero Linting / Type Checking Errors:** `pnpm typecheck` & `pnpm lint` pass.
5. **No Secrets / Credentials Committed:** GitLeaks automated secret scanner pass.

---

## SECTION D: MONOREPO ARCHITECTURE (PNPM WORKSPACES + TURBOREPO)

### Directory Structure:

```
tomvis-clinic-monorepo/
├── apps/
│   ├── web/                            # Next.js 16 Web BFF App
│   ├── backend/                        # NestJS Standalone API App
│   └── mobile/                         # React Native Expo Mobile App
├── packages/
│   ├── contracts/                      # Shared Zod Schemas & OpenAPI Types
│   ├── ui/                             # Shared React UI Primitives
│   ├── utils/                          # Shared Thai Date, CID & Format Helpers
│   └── config/                         # Shared ESLint, Prettier & TS Configs
├── turbo.json                          # Turborepo Build Pipeline Config
├── pnpm-workspace.yaml
└── package.json
```

### `turbo.json` Configuration:

```json
{
  "$schema": "https://turbo.build/schema.json",
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "dist/**"]
    },
    "typecheck": {
      "dependsOn": ["^build"]
    },
    "test": {
      "dependsOn": ["^build"]
    },
    "lint": {},
    "dev": {
      "cache": false,
      "persistent": true
    }
  }
}
```

---

## SECTION E: CI/CD PIPELINE (`.github/workflows/ci.yml`)

```yaml
name: Tomvis Clinic CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  validate-and-test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js 20 & Pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 9

      - name: Turbo Build Cache
        uses: dtinth/setup-github-actions-caching-for-turbo@v1

      - name: Install Dependencies
        run: pnpm install --frozen-lockfile

      - name: Typecheck Workspace
        run: pnpm turbo run typecheck

      - name: Lint Workspace
        run: pnpm turbo run lint

      - name: Run Unit & Integration Tests
        run: pnpm turbo run test

      - name: Verify API Contract Drift
        run: pnpm --filter @tomvis/contracts verify-contract

  deploy-staging:
    needs: validate-and-test
    if: github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - name: Deploy Next.js Web BFF to Vercel Staging
        run: echo "Deploying Web BFF to Vercel Staging..."

      - name: Deploy NestJS API to Railway Staging
        run: echo "Deploying NestJS API to Railway Staging..."
```

---

## SECTION F: SAMPLE ARCHITECTURAL DECISION RECORD (ADR) TEMPLATE

```markdown
# ADR-001: Adoption of Pnpm Monorepo for Shared API Contracts

- **Status:** Accepted
- **Date:** 2026-09-16
- **Deciders:** Lead Architect, Backend Lead, Frontend Lead

## Context
Tomvis Clinic is transitioning from a Next.js monolith to a decoupled Next.js Web BFF + NestJS Backend API + React Native Mobile App. To prevent API contract drift and type mismatch, we need a single source of truth for Zod schemas and TypeScript types.

## Decision
We adopt **Pnpm Workspaces + Turborepo** to structure our repository as a Monorepo. All API schemas and custom validators will reside in `packages/contracts`.

## Consequences
- **Positive:** 100% type safety across Web, Mobile, and Backend apps.
- **Positive:** Change in a contract schema triggers automatic build tests in all consuming apps.
- **Negative:** Requires team to learn Turborepo pipeline caching commands.
```

---

## SECTION G: DORA ENGINEERING METRICS

| DORA Metric | Target Threshold | Monitoring Tool |
| :--- | :---: | :--- |
| **1. Deployment Frequency** | At least **2–3 deploys per day** to Staging; **1 per week** to Prod | GitHub Actions / Vercel |
| **2. Lead Time for Changes** | Less than **24 hours** from PR commit to Staging deployment | Linear / GitHub Insights |
| **3. Mean Time to Recovery (MTTR)** | Less than **15 minutes** (via Feature Flag fallback) | Sentry / Datadog |
| **4. Change Failure Rate** | Less than **1.0%** of production releases | Sentry Release Tracking |
