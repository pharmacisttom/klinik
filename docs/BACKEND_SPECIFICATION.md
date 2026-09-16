# 🛠️ Standalone Backend Architecture Specification: Tomvis Clinic

**Document ID:** `docs/BACKEND_SPECIFICATION.md`  
**Version:** 1.0.0 (Production Backend Standard)  
**Framework:** NestJS 10+ (Node.js 20 LTS) / TypeScript 5  
**Data Infrastructure:** PostgreSQL 16 (Multi-schema) + Redis 7 (BullMQ & Cache)  
**Security & Compliance:** PDPA B.E. 2562, NIST 800-63B, ISO 27001, MOPH 43-Folder  

---

## SECTION A: PROJECT FILE STRUCTURE

```
backend/
├── src/
│   ├── modules/                        # Domain Modules (Bounded Contexts)
│   │   ├── auth/                       # 1. Identity & Auth Service
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.module.ts
│   │   │   ├── dto/
│   │   │   │   ├── login.dto.ts
│   │   │   │   ├── mfa-verify.dto.ts
│   │   │   │   └── refresh-token.dto.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt-auth.guard.ts
│   │   │   │   └── roles.guard.ts
│   │   │   └── strategies/
│   │   │       └── jwt.strategy.ts
│   │   ├── patients/                   # 2. Patient Master Service
│   │   │   ├── patients.controller.ts
│   │   │   ├── patients.service.ts
│   │   │   ├── patients.module.ts
│   │   │   └── dto/
│   │   │       ├── create-patient.dto.ts
│   │   │       └── merge-patient.dto.ts
│   │   ├── appointments/               # 3. Appointment & Queue Service
│   │   ├── examinations/               # 4. Clinical EMR SOAP Service
│   │   ├── prescriptions/              # 5. E-Prescribing & Narcotic Service
│   │   ├── inventory/                  # 6. Medication Stock & Cold Chain
│   │   ├── billing/                    # 7. Billing & Tax Receipt Service
│   │   ├── claims/                     # 8. Government NHSO Claim Service
│   │   ├── labs/                       # 9. LIS Laboratory Interface
│   │   ├── reports/                    # 10. Intelligent Report Builder
│   │   ├── notifications/              # 11. SMS, LINE OA & WebPush
│   │   ├── files/                      # 12. S3 Encrypted Storage & PDFs
│   │   ├── audit/                      # 13. Cryptographic WORM Audit Log
│   │   ├── integrations/               # 14. External Government & API Adapters
│   │   └── admin/                      # 15. Master Clinic Configuration
│   ├── shared/
│   │   ├── database/                   # Prisma Data Access Module
│   │   ├── cache/                      # Redis Cache Interceptor & Client
│   │   ├── queue/                      # BullMQ Job Processors
│   │   ├── events/                     # In-Process Event Bus Manager
│   │   ├── logger/                     # Pino Structured JSON Logger
│   │   ├── errors/                     # Thai Error Catalog & Filter
│   │   ├── guards/                     # ABAC & Break-Glass Security Guards
│   │   ├── interceptors/               # Audit Trail Interceptor
│   │   └── validators/                 # Thai CID, Phone, BE Date Validators
│   ├── config/                         # Environment & Config Specs
│   ├── app.module.ts                   # Root Application Module
│   └── main.ts                         # Application Bootstrap Entry
├── prisma/
│   ├── schema.prisma                   # Multi-schema Database Schema
│   └── seed.ts                         # Development Seed Script
├── test/
│   ├── unit/                           # Jest Unit Tests
│   ├── integration/                    # Testcontainers DB Tests
│   └── e2e/                            # Supertest E2E Suite
├── docs/
│   └── openapi.yaml                    # Generated OpenAPI 3.1 Spec
├── Dockerfile
├── docker-compose.yml
└── package.json
```

---

## SECTION B: CORE CONCERNS IMPLEMENTATION

### 1. Authentication Strategy
- **Token Dual-Tier:** Short-lived JWT Access Token (15-min expiration) + Long-lived Refresh Token (7-day expiration).
- **Refresh Token Rotation:** Every refresh invalidates the current token and issues a new pair. If a revoked refresh token is reused, all user sessions are immediately blacklisted in Redis.
- **Storage:** Web BFF uses `HttpOnly, Secure, SameSite=Strict` cookies; Mobile Apps store JWT in Encrypted SharedPreferences / Keychain.
- **Audit:** All login attempts (successful or failed) write an immutable record to `AuditLog`.

### 2. Authorization & ABAC Security
- **RBAC Guard:** `@Roles('DOCTOR', 'ADMIN', 'PHARMACIST')` checks JWT role payload.
- **ABAC PHI Access Guard:** `@CheckPatientAccess()` verifies doctor-patient active clinical relationship.
- **Break-Glass Emergency Protocol:** Emergency access override requires a mandatory textual reason string and emits a critical alert to the Data Protection Officer (DPO).

### 3. Thai Custom Input Validators

#### Thai National ID (CID Modulus 11) Decorator Example:
```typescript
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsThaiCID(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isThaiCID',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string' || value.length !== 13 || !/^\d+$/.test(value)) {
            return false;
          }
          let sum = 0;
          for (let i = 0; i < 12; i++) {
            sum += parseInt(value.charAt(i), 10) * (13 - i);
          }
          const checkDigit = (11 - (sum % 11)) % 10;
          return checkDigit === parseInt(value.charAt(12), 10);
        },
        defaultMessage(args: ValidationArguments) {
          return 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้องตามมาตรฐาน มอดุลัส 11';
        },
      },
    });
  };
}
```

### 4. Standard Error Format & Thai Error Catalog

```json
{
  "ok": false,
  "error": {
    "code": "PATIENT_CID_DUPLICATE",
    "message": "มีข้อมูลผู้ป่วยรหัสประจำตัวประชาชนนี้ในระบบแล้ว",
    "details": [
      { "field": "nationalId", "issue": "Must be unique" }
    ]
  },
  "requestId": "req-99a4c821-4f12-421b-8e10",
  "timestamp": "2026-09-16T21:41:20.000Z"
}
```

---

## SECTION C: COMPLETE REST API ENDPOINTS SPECIFICATION

### 1. Identity & Auth (`/api/v1/auth`)
- `POST /api/v1/auth/login` — Authenticate user credentials & issue JWT pair.
- `POST /api/v1/auth/refresh` — Rotate refresh token & issue new access token.
- `POST /api/v1/auth/logout` — Revoke active session in Redis blacklist.
- `POST /api/v1/auth/mfa/setup` — Generate TOTP QR code.
- `POST /api/v1/auth/mfa/verify` — Verify TOTP code.

### 2. Patient Master (`/api/v1/patients`)
- `GET /api/v1/patients` — List patients with cursor-based pagination.
- `POST /api/v1/patients` — Register new patient with Thai CID validation.
- `GET /api/v1/patients/:id` — Retrieve patient details (masked for non-authorized roles).
- `PATCH /api/v1/patients/:id` — Update demographics.
- `POST /api/v1/patients/:id/merge` — Merge duplicate patient records.

### 3. Appointments & Queue (`/api/v1/appointments`, `/api/v1/queue`)
- `GET /api/v1/appointments` — Query clinic appointment calendar.
- `POST /api/v1/appointments` — Book new appointment.
- `POST /api/v1/queue/call-next` — Advance queue for current exam room.
- `GET /api/v1/queue/stream` — SSE endpoint for public OPD TV Queue display.

### 4. Clinical EMR Examinations (`/api/v1/examinations`)
- `POST /api/v1/examinations` — Create SOAP consultation record.
- `POST /api/v1/examinations/:id/vitals` — Save vital signs (BP, HR, Temp, SpO2).
- `POST /api/v1/examinations/:id/diagnoses` — Record ICD-10-TM primary/secondary DX.

### 5. Prescriptions & Pharmacy (`/api/v1/prescriptions`, `/api/v1/medications`)
- `POST /api/v1/prescriptions` — Create e-Prescription.
- `POST /api/v1/prescriptions/:id/dispense` — Dispense medication & update stock card.
- `GET /api/v1/medications/alerts/low-stock` — Fetch low inventory alerts.
- `GET /api/v1/medications/alerts/expiring` — Fetch FEFO expiring drug lots.

### 6. Billing & Tax Receipts (`/api/v1/invoices`)
- `POST /api/v1/invoices` — Create cashier billing invoice.
- `POST /api/v1/invoices/:id/payments` — Process cash or PromptPay QR payment.
- `GET /api/v1/invoices/:id/pdf` — Stream official tax receipt PDF.

### 7. Certificates & Reports (`/api/v1/certificates`, `/api/v1/reports`)
- `POST /api/v1/certificates` — Issue DLT 5-disease medical certificate.
- `GET /api/v1/certificates/verify/:serial` — Public certificate verification link.
- `GET /api/v1/reports/fda-schedule-4-5` — Export FDA อย.ส.4/5 report.

---

## SECTION D: NESTJS MODULE SAMPLE IMPLEMENTATION

### 1. DTO (`src/modules/patients/dto/create-patient.dto.ts`)

```typescript
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsDateString } from 'class-validator';
import { IsThaiCID } from '@/shared/validators/thai-cid.validator';

export class CreatePatientDto {
  @IsThaiCID()
  @IsNotEmpty()
  nationalId: string;

  @IsString()
  @IsNotEmpty()
  prefix: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsDateString()
  dateOfBirth: string;

  @IsEnum(['MALE', 'FEMALE', 'OTHER'])
  gender: string;

  @IsString()
  phone: string;

  @IsString()
  address: string;
}
```

### 2. Service (`src/modules/patients/patients.service.ts`)

```typescript
import { Injectable, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/shared/database/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { encryptData } from '@/shared/utils/encryption.util';

@Injectable()
export class PatientsService {
  constructor(private readonly prisma: PrismaService) {}

  async createPatient(dto: CreatePatientDto) {
    const existing = await this.prisma.patient.findFirst({
      where: { nationalId: dto.nationalId },
    });

    if (existing) {
      throw new ConflictException('มีข้อมูลผู้ป่วยรหัสประจำตัวประชาชนนี้ในระบบแล้ว');
    }

    const count = await this.prisma.patient.count();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const autoHn = `HN-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    return this.prisma.patient.create({
      data: {
        hn: autoHn,
        nationalId: encryptData(dto.nationalId),
        prefix: dto.prefix,
        firstName: dto.firstName,
        lastName: dto.lastName,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        phone: dto.phone,
        address: dto.address,
      },
    });
  }
}
```

### 3. Controller (`src/modules/patients/patients.controller.ts`)

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('api/v1/patients')
@UseGuards(JwtAuthGuard, RolesGuard)
export class PatientsController {
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  @Roles('ADMIN', 'NURSE', 'DOCTOR')
  async createPatient(@Body() dto: CreatePatientDto) {
    const patient = await this.patientsService.createPatient(dto);
    return { ok: true, patient };
  }
}
```

---

## SECTION E: DOCKER COMPOSE CONFIGURATION (`docker-compose.yml`)

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: tomvis-postgres
    restart: always
    environment:
      POSTGRES_USER: tomvis_admin
      POSTGRES_PASSWORD: KlinikPassword2026!
      POSTGRES_DB: tomvis_clinic_db
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    container_name: tomvis-redis
    restart: always
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  backend-api:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: tomvis-backend-api
    restart: always
    environment:
      DATABASE_URL: "postgresql://tomvis_admin:KlinikPassword2026!@postgres:5432/tomvis_clinic_db?schema=public"
      REDIS_URL: "redis://redis:6379"
      JWT_SECRET: "super-secret-jwt-key-tomvis-clinic-2026"
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis

volumes:
  postgres_data:
  redis_data:
```
