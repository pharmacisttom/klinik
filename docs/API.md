# Server Actions & API Endpoint Documentation

## 1. Authentication & Security Middleware

All Server Actions check session role authorization and log access to Patient Health Information (PHI).

| Route / Action | Allowed Roles | Description |
| :--- | :--- | :--- |
| `POST /api/login` | Public | Authenticate user and issue secure HTTP-only session cookie |
| `POST /api/otp` | Public | Trigger 2FA OTP verification code |
| `GET /api/cron/daily-backup` | Vercel Cron | Automated database backup trigger |

---

## 2. Patient Management Actions

### `createPatient(payload: PatientSchemaType)`
- **Required Role**: `NURSE`, `ADMIN`
- **Audit Action**: `CREATE_PATIENT`
- **Response**: `{ success: true, patient: Patient }`

### `searchPatientByNationalId(nationalId: string)`
- **Required Role**: `DOCTOR`, `NURSE`, `PHARMACIST`, `CASHIER`, `ADMIN`
- **Audit Action**: `VIEW_PATIENT_RECORD`
- **Response**: `Patient` object with masked sensitive data unless authorized.

---

## 3. Examination & Consultation Actions

### `saveConsultationNotes(appointmentId: string, notes: ConsultationPayload)`
- **Required Role**: `DOCTOR`
- **Audit Action**: `UPDATE_PATIENT`
- **Behavior**: Saves ICD-10 code, diagnosis description, and updates appointment status to `COMPLETED`.

---

## 4. Pharmacy & Dispensing Actions

### `dispensePrescription(prescriptionId: string)`
- **Required Role**: `PHARMACIST`
- **Audit Action**: `DISPENSE_MEDICATION`
- **Behavior**: Runs Prisma transaction to deduct medication stock quantity and update status to `DISPENSED`.

---

## 5. Billing & Invoicing Actions

### `processPayment(invoiceId: string, method: 'CASH' | 'QR_PROMPTPAY')`
- **Required Role**: `CASHIER`
- **Audit Action**: `PROCESS_PAYMENT`
- **Response**: `{ success: true, receiptNumber: string }`
