import { describe, it, expect } from 'vitest';
import { PatientSchema, VitalSignsSchema } from '@/lib/validations/patient';

describe('Zod Validation Schemas', () => {
  it('should pass valid PatientSchema payload', () => {
    const validData = {
      nationalId: '1100400123450',
      prefix: 'นาย',
      firstName: 'สมชาย',
      lastName: 'ดีใจ',
      dateOfBirth: '1995-10-20',
      gender: 'MALE',
      phone: '0812345678',
      address: '123/4 หมู่ 5 กรุงเทพมหานคร',
    };
    const result = PatientSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail PatientSchema when Thai ID checksum is invalid', () => {
    const invalidData = {
      nationalId: '1100400123459', // Bad checksum
      prefix: 'นาย',
      firstName: 'สมชาย',
      lastName: 'ดีใจ',
      dateOfBirth: '1995-10-20',
      gender: 'MALE',
      phone: '0812345678',
      address: '123/4 หมู่ 5 กรุงเทพมหานคร',
    };
    const result = PatientSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should validate VitalSignsSchema range limits', () => {
    const validVitals = {
      bpSys: 120,
      bpDia: 80,
      pulse: 72,
      temp: 36.6,
      weight: 70,
      height: 175,
    };
    expect(VitalSignsSchema.safeParse(validVitals).success).toBe(true);

    const invalidVitals = {
      bpSys: 300, // Invalid blood pressure
      bpDia: 80,
      pulse: 72,
      temp: 36.6,
      weight: 70,
      height: 175,
    };
    expect(VitalSignsSchema.safeParse(invalidVitals).success).toBe(false);
  });
});
