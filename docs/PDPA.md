# PDPA Compliance & Legal Hold Framework

## 1. Overview of Personal Data Protection Act (PDPA) Compliance

Klinik is built to satisfy all requirements of Thailand's **Personal Data Protection Act B.E. 2562 (2019)** regarding Patient Health Information (PHI).

---

## 2. Consent Management Architecture

- **Consent Form**: Captured digitally during patient onboarding.
- **Data Categories**:
  1. *Core Medical Treatment & EMR Records*: Mandatory for medical service provision.
  2. *Marketing & Appointment SMS*: Optional consent, revocable anytime.
- **Consent Storage**: Stored in `Consent` table with timestamp, IP address, and status.

---

## 3. Patient Data Access & Deletion Rights

Patients can exercise their PDPA rights through `/pdpa/data-request`:

1. **Right to Access / Data Portability (Data Export)**:
   - Request returns encrypted JSON/PDF summary of patient demographics, diagnosis history, prescriptions, and financial invoices.

2. **Right to Erasure vs. Medical Record Retention (Legal Hold)**:
   - **Conflict**: PDPA Section 33 allows data erasure requests; however, **The Sanatorium Act B.E. 2541** and Medical Council of Thailand guidelines require medical clinics to retain patient medical records for **at least 10 years** from the last visit.
   - **Resolution Policy**: When a patient submits a Data Erasure request, the account is marked as `isArchived: true` with a `REJECTED_LEGAL_HOLD` status notice. Physical deletion is locked until the mandatory 10-year legal hold retention period expires.

---

## 4. Breach Notification Procedure

In the event of a suspected or confirmed data breach:

```
[Breach Detected] 
       │
       ▼
[Containment & Assessment (< 2 Hours)]
       │
       ▼
[Notify DPO & Executive Team]
       │
       ▼
[Report to PDPC Office within 72 Hours]
       │
       ▼
[Notify Affected Patients if High Risk]
```

- **DPO Contact**: `dpo@klinik.local`
- **Audit Logs**: Inspect `AuditLog` table filtered by suspicious timestamp and IP address.
