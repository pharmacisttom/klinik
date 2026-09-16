# 📜 API Contract & Integration Specification: Tomvis Clinic

**Document ID:** `docs/API_CONTRACT_SPECIFICATION.md`  
**Version:** 1.0.0 (API Contract Standard)  
**Contract Source of Truth:** OpenAPI 3.1 / Zod Shared Schemas (`@tomvis/contracts`)  
**Response Format:** Envelope Wrapped JSON (ISO 8601 Timestamps, UTF-8 Thai Support)  

---

## SECTION A: `@tomvis/contracts` PACKAGE STRUCTURE

```
packages/contracts/
├── src/
│   ├── index.ts                        # Master Package Export
│   ├── schemas/
│   │   ├── common.ts                   # Envelope, Pagination & Base Schemas
│   │   ├── patient.ts                  # Patient Demographics & CID Schemas
│   │   ├── appointment.ts              # Queue & Calendar Schemas
│   │   ├── clinical.ts                 # SOAP & ICD-10-TM Schemas
│   │   ├── prescription.ts             # Rx, TMT & Controlled Drug Schemas
│   │   └── billing.ts                  # Invoice, Tax Receipt & PromptPay Schemas
│   ├── errors/
│   │   └── error-codes.ts              # Thai Error Catalog Definitions
│   └── validators/
│       └── thai.ts                     # Thai CID, Phone & Tax ID Validators
├── package.json
└── tsconfig.json
```

---

## SECTION B: ZOD SCHEMA DEFINITIONS (`packages/contracts/src/schemas/patient.ts`)

```typescript
import { z } from 'zod';

// Thai CID Modulus 11 Validator
export function validateThaiCID(cid: string): boolean {
  if (!cid || cid.length !== 13 || !/^\d+$/.test(cid)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cid.charAt(i), 10) * (13 - i);
  }
  return (11 - (sum % 11)) % 10 === parseInt(cid.charAt(12), 10);
}

export const AddressSchema = z.object({
  houseNo: z.string().min(1, 'กรุณาระบุบ้านเลขที่'),
  subdistrict: z.string().min(1, 'กรุณาระบุแขวง/ตำบล'),
  district: z.string().min(1, 'กรุณาระบุเขต/อำเภอ'),
  province: z.string().min(1, 'กรุณาระบุจังหวัด'),
  postalCode: z.string().regex(/^\d{5}$/, 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก'),
});

export const AllergySchema = z.object({
  medicationName: z.string().min(1),
  reaction: z.string().min(1),
  severity: z.enum(['MILD', 'MODERATE', 'SEVERE', 'LIFE_THREATENING']),
});

export const PatientSchema = z.object({
  id: z.string().uuid(),
  hn: z.string().regex(/^HN-\d{6}-\d{4}$/, 'รูปแบบ HN ไม่ถูกต้อง'),
  prefix: z.enum(['นาย', 'นาง', 'นางสาว', 'ด.ช.', 'ด.ญ.']),
  firstName: z.string().min(1, 'กรุณาระบุชื่อ').max(100),
  lastName: z.string().min(1, 'กรุณาระบุนามสกุล').max(100),
  nationalId: z.string().regex(/^\d{13}$/, 'เลขประจำตัวประชาชนต้องเป็นตัวเลข 13 หลัก').refine(validateThaiCID, {
    message: 'เลขประจำตัวประชาชนไม่ถูกต้องตามมาตรฐาน มอดุลัส 11',
  }),
  dateOfBirth: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.enum(['A', 'B', 'AB', 'O', 'UNKNOWN']).optional(),
  phone: z.string().regex(/^0\d{8,9}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง'),
  email: z.string().email('อีเมลไม่ถูกต้อง').optional(),
  address: AddressSchema,
  allergies: z.array(AllergySchema).default([]),
  chronicDiseases: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Patient = z.infer<typeof PatientSchema>;

export const CreatePatientSchema = PatientSchema.omit({
  id: true,
  hn: true,
  createdAt: true,
  updatedAt: true,
});

export type CreatePatient = z.infer<typeof CreatePatientSchema>;
```

---

## SECTION C: API RESPONSE ENVELOPE STANDARD

### 1. Success Response Envelope (`HTTP 200 / 201`)

```json
{
  "ok": true,
  "data": {
    "hn": "HN-260916-0001",
    "prefix": "นาย",
    "firstName": "ประณีต",
    "lastName": "สุขใจ",
    "gender": "MALE"
  },
  "meta": {
    "requestId": "req-8f4b1092-23c1-419b-a012",
    "timestamp": "2026-09-16T21:42:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 145,
      "totalPages": 8
    }
  }
}
```

### 2. Error Response Envelope (`HTTP 4xx / 5xx`)

```json
{
  "ok": false,
  "error": {
    "code": "PATIENT_CID_DUPLICATE",
    "message": "มีข้อมูลผู้ป่วยรหัสประจำตัวประชาชนนี้ในระบบแล้ว",
    "details": {
      "field": "nationalId",
      "value": "1100400123450"
    }
  },
  "meta": {
    "requestId": "req-99a4c821-4f12-421b-8e10",
    "timestamp": "2026-09-16T21:42:00.000Z"
  }
}
```

---

## SECTION D: THAI ERROR CATALOG MATRIX

| Error Code | HTTP | TH Message (ข้อความภาษาไทย) | EN Message | Retryable | User Action |
| :--- | :---: | :--- | :--- | :---: | :--- |
| `VALIDATION_ERROR` | **422** | ข้อมูลระบุไม่ถูกต้อง กรุณาตรวจสอบ | Invalid Request Input | ❌ No | ตรวจสอบช่องป้อนข้อมูล |
| `UNAUTHORIZED` | **401** | เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่ | Authentication Required | ❌ No | ล็อกอินใหม่อีกครั้ง |
| `FORBIDDEN_PHI` | **403** | คุณไม่มีสิทธิ์เข้าถึงข้อมูลสุขภาพผู้ป่วย | Access Denied (PHI) | ❌ No | ติดต่อผู้ดูแลระบบ/DPO |
| `PATIENT_NOT_FOUND` | **404** | ไม่พบข้อมูลผู้ป่วยในระบบ | Patient Not Found | ❌ No | ตรวจสอบ HN หรือ CID |
| `PATIENT_CID_DUPLICATE`| **409** | มีผู้ป่วยรหัสประจำตัวนี้ในระบบแล้ว | Duplicate National ID | ❌ No | ใช้ระบบค้นหาหรือยุบรวม HN |
| `DRUG_ALLERGY_WARNING` | **409** | ผู้ป่วยมีประวัติแพ้ยานี้อย่างรุนแรง | Severe Drug Allergy Flag | ❌ No | เปลี่ยนรายการสั่งจ่ายยา |
| `COLD_CHAIN_EXCURSION` | **422** | อุณหภูมิตู้เย็นเกินมาตรฐาน 2°C–8°C | Refrigerator Temperature Alert | ⚠️ Yes | ตรวจสอบตู้เย็นและแจ้งเภสัชกร |
| `IDEMPOTENCY_CONFLICT` | **409** | คำขอนี้กำลังถูกประมวลผลหรือซ้ำซ้อน | Duplicate Request Processing | ❌ No | รอสักครู่แล้วตรวจสอบผล |
| `RATE_LIMIT_EXCEEDED` | **429** | การส่งคำขอถี่เกินไป กรุณารอ 60 วินาที | Rate Limit Exceeded | ⚠️ Yes | รอตาม Retry-After header |
| `INTERNAL_SERVER_ERROR`| **500** | เกิดข้อผิดพลาดทางเทคนิคในระบบ | System Failure | ⚠️ Yes | ลองใหม่อีกครั้ง หรือแจ้ง IT |

---

## SECTION E: IDEMPOTENCY & FILE UPLOADS API FLOW

### 1. Idempotency Key Handling (`Idempotency-Key` Header)
- **POST Requests:** Mutations (Creating Payments, Invoices, Prescriptions) require an `Idempotency-Key: uuid-v4` HTTP Header.
- **Cache Duration:** Key & Response Envelope cached in Redis for **24 hours**.
- **Conflict Handling:** Duplicate execution with different request payload returns `HTTP 409 Conflict`.

### 2. S3 Presigned File Upload Flow
1. Client requests presigned upload URL:
   `POST /api/v1/files/presign`  
   `Body: { filename: "xray.pdf", mimeType: "application/pdf", size: 1048576, purpose: "LAB_REPORT" }`
2. Backend responds with `{ uploadUrl: "https://s3.ap-southeast-1.amazonaws.com/...", fileId: "file-99a0" }`.
3. Client uploads directly to S3 via `PUT uploadUrl`.
4. Client notifies backend on completion:
   `POST /api/v1/files/file-99a0/complete`.

---

## SECTION F: RATE LIMITING & CONTRACT DRIFT CI

### HTTP Response Rate Limit Headers:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1704067200
Retry-After: 60
```

### Automated CI Drift Detection Script (`scripts/verify-api-contract.sh`)

```bash
#!/bin/bash
set -e

echo "🔍 Verifying OpenAPI Contract Drift between NestJS backend and @tomvis/contracts..."
npx openapi-typescript http://localhost:4000/docs/openapi.yaml -o packages/contracts/src/types/openapi.ts

if git diff --exit-code packages/contracts/src/types/openapi.ts; then
  echo "✅ API Contract is 100% in sync!"
else
  echo "❌ API Contract drift detected! Please commit updated openapi.ts types."
  exit 1
fi
```
