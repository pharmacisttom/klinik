# Disaster Recovery & Backup Procedures

## 1. Targets & Objectives

- **Recovery Point Objective (RPO)**: < 1 Hour (Maximum acceptable data loss in disaster)
- **Recovery Time Objective (RTO)**: < 2 Hours (Maximum acceptable downtime)

---

## 2. Automated Backup Policy

1. **Daily Automated Full Database Backups**:
   - Triggered via Vercel Cron at `02:00 AM UTC` calling `/api/cron/daily-backup-trigger`.
   - Snapshot stored in encrypted cloud storage (S3 / Supabase Automated Backups).
   - Retention Period: **30 Days**.

2. **Transaction Log Archiving (WAL Streaming)**:
   - Point-in-time recovery (PITR) supported for the preceding 7 days.

---

## 3. Database Restore Playbook

In the event of database corruption or primary region failure:

### Step 1: Provision Clean Database Target
Provisions a new PostgreSQL instance on secondary region or backup host.

### Step 2: Restore Latest Daily Snapshot
```bash
pg_restore --host=new-db.supabase.co --port=5432 --username=postgres --dbname=klinik_db backup-2026-09-16.dump
```

### Step 3: Run Database Schema Validation
```bash
npx prisma db push
```

### Step 4: Reconnect Application Environment
Update Vercel production environment variable `DATABASE_URL` to point to restored database URL and trigger instant deployment redeploy.

---

## 4. Disaster Recovery Test Drill Checklist
- [x] Monthly automated restore test to staging database
- [x] Verification of encrypted backup integrity
- [x] Failover test for PgBouncer connection pooler
