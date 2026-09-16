import { z } from 'zod';

/**
 * Validates Thai 13-digit National ID checksum
 */
export function validateThaiNationalId(id: string): boolean {
  if (!/^\d{13}$/.test(id)) return false;

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(id.charAt(i), 10) * (13 - i);
  }

  const checkDigit = (11 - (sum % 11)) % 10;
  return checkDigit === parseInt(id.charAt(12), 10);
}

/**
 * Patient Schema supporting Thai CID, Passport & Alien ID (เลขต่างด้าว 13 หลัก)
 */
export const patientSchema = z.object({
  idType: z.enum(['THAI_CID', 'PASSPORT', 'ALIEN_ID']).default('THAI_CID'),
  nationalId: z.string().min(1, 'กรุณากรอกเลขประจำตัว'),
  passportNo: z.string().optional(),
  prefix: z.string().min(1, 'กรุณาระบุคำนำหน้านาม'),
  firstName: z.string().min(1, 'กรุณากรอกชื่อ'),
  lastName: z.string().min(1, 'กรุณากรอกนามสกุล'),
  dateOfBirth: z.string().min(1, 'กรุณากรอกวันเกิด'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  bloodGroup: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicDiseases: z.array(z.string()).default([]),
  phone: z.string().min(9, 'เบอร์โทรศัพท์ต้องมีอย่างน้อย 9 หลัก'),
  emergencyContact: z.string().optional(),
  address: z.string().min(5, 'กรุณากรอกที่อยู่'),
  isNewborn: z.boolean().default(false),
  isDeceased: z.boolean().default(false),
}).refine(
  (data) => {
    if (data.idType === 'THAI_CID') {
      return validateThaiNationalId(data.nationalId);
    } else if (data.idType === 'ALIEN_ID') {
      return /^[06]\d{12}$/.test(data.nationalId);
    }
    return true;
  },
  {
    message: 'เลขประจำตัวประชาชน หรือเลขประจำตัวคนต่างด้าวไม่ถูกต้องตามมาตรฐาน',
    path: ['nationalId'],
  }
);

export const PatientSchema = patientSchema;
export type PatientSchemaType = z.infer<typeof patientSchema>;

export const VitalSignsSchema = z.object({
  bpSys: z.number().min(50).max(250),
  bpDia: z.number().min(30).max(150),
  pulse: z.number().min(30).max(220),
  temp: z.number().min(34).max(43),
  weight: z.number().min(1).max(300),
  height: z.number().min(30).max(250),
});
