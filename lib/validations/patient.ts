import { z } from 'zod';
import { validateThaiNationalID } from '@/lib/utils/thai-id';

export const PatientSchema = z.object({
  nationalId: z
    .string()
    .min(13, 'รหัสบัตรประชาชนต้องมี 13 หลัก')
    .max(13, 'รหัสบัตรประชาชนต้องมี 13 หลัก')
    .refine((id) => validateThaiNationalID(id), {
      message: 'รหัสบัตรประชาชนไม่ถูกต้องตามรูปแบบเช็คซัม',
    }),
  prefix: z.string().min(1, 'กรุณาเลือกคำนำหน้าชื่อ'),
  firstName: z.string().min(1, 'กรุณาระบุชื่อจริง'),
  lastName: z.string().min(1, 'กรุณาระบุนามสกุล'),
  dateOfBirth: z.string().or(z.date()),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicDiseases: z.array(z.string()).default([]),
  phone: z.string().regex(/^0\d{8,9}$/, 'หมายเลขโทรศัพท์ไม่ถูกต้อง (เช่น 0812345678)'),
  emergencyContact: z.string().optional(),
  address: z.string().min(5, 'กรุณาระบุที่อยู่ให้ครบถ้วน'),
});

export type PatientSchemaType = z.infer<typeof PatientSchema>;

export const AppointmentSchema = z.object({
  patientId: z.string().uuid(),
  doctorId: z.string().uuid(),
  scheduledAt: z.string().or(z.date()),
  reason: z.string().min(2, 'กรุณาระบุสาเหตุการรับบริการ'),
});

export const VitalSignsSchema = z.object({
  bpSys: z.number().min(50).max(250),
  bpDia: z.number().min(30).max(150),
  pulse: z.number().min(30).max(220),
  temp: z.number().min(32.0).max(43.0),
  weight: z.number().min(1.0).max(300.0),
  height: z.number().min(30.0).max(250.0),
});

export const PrescriptionItemSchema = z.object({
  medicationId: z.string().uuid(),
  quantity: z.number().int().positive('จำนวนต้องมากกว่า 0'),
  dosage: z.string().min(1, 'กรุณาระบุวิธีใช้ยา'),
  unitPrice: z.number().positive(),
});

export const PrescriptionSchema = z.object({
  appointmentId: z.string().uuid(),
  patientId: z.string().uuid(),
  items: z.array(PrescriptionItemSchema).min(1, 'ต้องมียาอย่างน้อย 1 รายการ'),
  notes: z.string().optional(),
});
