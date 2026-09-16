# 🎨 Standalone Frontend Architecture Specification: Tomvis Clinic

**Document ID:** `docs/FRONTEND_SPECIFICATION.md`  
**Version:** 1.0.0 (Production Frontend Standard)  
**Framework:** Next.js 16 (App Router) / React 19 / TypeScript 5 / Tailwind CSS  
**State & Data Fetching:** TanStack Query v5 + NextAuth v5 + Zustand  
**Security & Compliance:** PDPA B.E. 2562, WCAG 2.1 AA, Thai BE Date Standard  

---

## SECTION A: PROJECT FILE STRUCTURE

```
frontend/
├── src/
│   ├── app/                            # Next.js App Router Pages & Layouts
│   │   ├── (auth)/                     # Auth Route Group
│   │   │   ├── login/
│   │   │   │   └── page.tsx
│   │   │   ├── register/
│   │   │   │   └── page.tsx
│   │   │   └── forgot-password/
│   │   │       └── page.tsx
│   │   ├── (dashboard)/                # Staff Clinical Portal (Staff Auth Required)
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── patients/
│   │   │   │   ├── page.tsx
│   │   │   │   └── [id]/page.tsx
│   │   │   ├── appointments/
│   │   │   ├── queue/
│   │   │   ├── examinations/
│   │   │   ├── prescriptions/
│   │   │   ├── inventory/
│   │   │   ├── labs/
│   │   │   ├── billing/
│   │   │   ├── claims/
│   │   │   ├── reports/
│   │   │   └── admin/
│   │   ├── (portal)/                   # Patient Self-Service Portal (Patient Auth)
│   │   │   ├── layout.tsx
│   │   │   ├── my-appointments/
│   │   │   └── my-records/
│   │   ├── (public)/                   # Public Access Pages (No Auth)
│   │   │   ├── book/
│   │   │   └── verify/[serial]/page.tsx
│   │   ├── (tv)/                       # Waiting Room Queue TV Display (Public SSE)
│   │   │   └── queue-display/page.tsx
│   │   ├── api/                        # Next.js Lightweight BFF Proxy Routes
│   │   │   └── auth/[...nextauth]/
│   │   │       └── route.ts
│   │   ├── layout.tsx                  # Root HTML/Font/CSS Provider Layout
│   │   └── globals.css                 # Tailwind CSS Directives & Tokens
│   ├── components/
│   │   ├── ui/                         # shadcn UI Primitives (Button, Dialog, etc.)
│   │   ├── layout/                     # Header, Sidebar, UserMenu
│   │   ├── shared/                     # DataTable, PageHeader, ErrorBoundary
│   │   ├── patients/                   # PatientTable, PatientForm, CIDInput
│   │   ├── clinical/                   # SOAPEditor, ICD10Search, VitalsCard
│   │   ├── pharmacy/                   # LabelPrinter, StockCardTable
│   │   ├── billing/                    # PromptPayQR, InvoiceReceipt
│   │   └── print/                      # Printable Thermal & A4 Print Layouts
│   ├── lib/
│   │   ├── api-client/                 # Centralized Typed API Client
│   │   │   ├── client.ts               # Fetch Wrapper with Auto-Refresh Token
│   │   │   ├── endpoints/
│   │   │   │   ├── auth.ts
│   │   │   │   ├── patients.ts
│   │   │   │   └── appointments.ts
│   │   │   └── types.ts                # Auto-generated OpenAPI TypeScript Types
│   │   ├── hooks/                      # TanStack Query Custom Hooks
│   │   │   ├── use-patients.ts
│   │   │   ├── use-appointments.ts
│   │   │   └── use-queue-sse.ts
│   │   ├── stores/                     # Zustand UI Stores
│   │   │   └── ui-store.ts             # Sidebar Toggle, Modal States
│   │   ├── auth/                       # NextAuth v5 Config Options
│   │   │   └── auth.config.ts
│   │   ├── utils/                      # Masking, Thai Date & Baht Transformers
│   │   └── validations/                # Zod Schemas & Thai CID Checks
│   ├── styles/
│   └── types/
├── public/
├── e2e/                                # Playwright E2E Test Suite
├── next.config.mjs
├── tailwind.config.ts
├── package.json
└── Dockerfile
```

---

## SECTION B: TYPE-SAFE API CLIENT & FETCH WRAPPER

### `src/lib/api-client/client.ts`

```typescript
import { getSession, signOut } from 'next-auth/react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export interface ApiFetchOptions extends RequestInit {
  retry?: number;
  timeout?: number;
}

export async function apiFetch<T = any>(endpoint: string, options: ApiFetchOptions = {}): Promise<T> {
  const { retry = 1, timeout = 10000, headers, ...customConfig } = options;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  // Retrieve NextAuth Session token
  const session = await getSession();
  const accessToken = session?.user?.accessToken;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-ID': `req-${crypto.randomUUID()}`,
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...(headers as Record<string, string>),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...customConfig,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Auto-logout on 401 Unauthorized
    if (response.status === 401) {
      if (typeof window !== 'undefined') {
        await signOut({ callbackUrl: '/login?expired=true' });
      }
      throw new Error('เซสชันของคุณหมดอายุ กรุณาเข้าสู่ระบบใหม่');
    }

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody?.error?.message || `เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ (${response.status})`);
    }

    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('การเชื่อมต่อใช้เวลานานเกินกำหนด (Request Timeout)');
    }
    throw error;
  }
}
```

---

## SECTION C: PATIENT MANAGEMENT HOOK & API (TACKSTACK QUERY)

### `src/lib/hooks/use-patients.ts`

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api-client/client';

export interface PatientFilterParams {
  search?: string;
  page?: number;
  limit?: number;
}

export function usePatients(filters: PatientFilterParams = {}) {
  const queryParams = new URLSearchParams();
  if (filters.search) queryParams.set('search', filters.search);
  if (filters.page) queryParams.set('page', filters.page.toString());
  if (filters.limit) queryParams.set('limit', filters.limit.toString());

  return useQuery({
    queryKey: ['patients', 'list', filters],
    queryFn: () => apiFetch(`/api/v1/patients?${queryParams.toString()}`),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newPatientData: any) =>
      apiFetch('/api/v1/patients', {
        method: 'POST',
        body: JSON.stringify(newPatientData),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients', 'list'] });
    },
  });
}
```

---

## SECTION D: FULL PATIENT FORM WITH THAI CID VALIDATION

### `src/components/patients/PatientForm.tsx`

```tsx
'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreatePatient } from '@/lib/hooks/use-patients';

// Thai CID Modulus 11 Validator
function validateThaiCID(cid: string): boolean {
  if (cid.length !== 13 || !/^\d+$/.test(cid)) return false;
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cid.charAt(i), 10) * (13 - i);
  }
  return (11 - (sum % 11)) % 10 === parseInt(cid.charAt(12), 10);
}

const patientFormSchema = z.object({
  nationalId: z.string().refine(validateThaiCID, { message: 'เลขประจำตัวประชาชน 13 หลักไม่ถูกต้อง' }),
  prefix: z.string().min(1, 'กรุณาเลือกคำนำหน้า'),
  firstName: z.string().min(1, 'กรุณาระบุชื่อ'),
  lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
  dateOfBirth: z.string().min(1, 'กรุณาระบุวันเกิด'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  phone: z.string().regex(/^0\d{8,9}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง'),
  address: z.string().min(5, 'กรุณาระบุที่อยู่'),
});

type PatientFormInputs = z.infer<typeof patientFormSchema>;

export function PatientForm({ onSuccess }: { onSuccess?: () => void }) {
  const createPatientMutation = useCreatePatient();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PatientFormInputs>({
    resolver: zodResolver(patientFormSchema),
    defaultValues: { gender: 'MALE', prefix: 'นาย' },
  });

  const onSubmit = (data: PatientFormInputs) => {
    createPatientMutation.mutate(data, {
      onSuccess: () => {
        alert('ลงทะเบียนผู้ป่วยใหม่สำเร็จแล้ว');
        if (onSuccess) onSuccess();
      },
      onError: (err: any) => {
        alert(err.message || 'ไม่สามารถลงทะเบียนผู้ป่วยได้');
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-slate-900 p-6 rounded-2xl border border-slate-800 text-white">
      <h2 className="text-base font-bold text-emerald-400">ลงทะเบียนผู้ป่วยใหม่ (Patient Registration)</h2>

      <div>
        <label className="text-xs text-slate-300 block mb-1">เลขประจำตัวประชาชน 13 หลัก *</label>
        <input
          {...register('nationalId')}
          placeholder="1100400123450"
          className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500"
        />
        {errors.nationalId && <p className="text-xs text-red-400 mt-1">{errors.nationalId.message}</p>}
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-300 block mb-1">คำนำหน้า *</label>
          <select {...register('prefix')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100">
            <option value="นาย">นาย</option>
            <option value="นาง">นาง</option>
            <option value="นางสาว">นางสาว</option>
            <option value="ด.ช.">ด.ช.</option>
            <option value="ด.ญ.">ด.ญ.</option>
          </select>
        </div>
        <div>
          <label className="text-xs text-slate-300 block mb-1">ชื่อ *</label>
          <input {...register('firstName')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
        </div>
        <div>
          <label className="text-xs text-slate-300 block mb-1">นามสกุล *</label>
          <input {...register('lastName')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-300 block mb-1">วันเกิด *</label>
          <input type="date" {...register('dateOfBirth')} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
        </div>
        <div>
          <label className="text-xs text-slate-300 block mb-1">เบอร์โทรศัพท์ *</label>
          <input {...register('phone')} placeholder="0812345678" className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
        </div>
      </div>

      <div>
        <label className="text-xs text-slate-300 block mb-1">ที่อยู่ *</label>
        <textarea {...register('address')} rows={2} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100" />
      </div>

      <button
        type="submit"
        disabled={createPatientMutation.isPending}
        className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 font-semibold text-sm rounded-xl transition"
      >
        {createPatientMutation.isPending ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลผู้ป่วย'}
      </button>
    </form>
  );
}
```

---

## SECTION E: ERROR BOUNDARY COMPONENT

### `src/components/shared/ErrorBoundary.tsx`

```tsx
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React Error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="p-8 bg-slate-900 border border-red-500/30 rounded-3xl text-center max-w-md mx-auto my-12">
          <div className="w-12 h-12 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
            ⚠️
          </div>
          <h2 className="text-lg font-bold text-red-400 mb-2">เกิดข้อผิดพลาดที่ไม่คาดคิด</h2>
          <p className="text-xs text-slate-400 mb-6">{this.state.error?.message || 'ระบบไม่สามารถประมวลผลคำขอนี้ได้'}</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl text-slate-200 border border-slate-700"
          >
            ลองใหม่อีกครั้ง (Retry)
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
```

---

## SECTION F: OPENAPI TYPESCRIPT GENERATION SCRIPT

Add the following command to `package.json` to auto-generate TypeScript interfaces whenever backend API schemas change:

```json
{
  "scripts": {
    "generate:api-types": "openapi-typescript http://localhost:4000/docs/openapi.yaml -o src/lib/api-client/types.ts"
  }
}
```
