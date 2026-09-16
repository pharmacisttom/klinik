'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { PatientSchema, PatientSchemaType } from '@/lib/validations/patient';
import { generateHN } from '@/lib/utils/hn-generator';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';

export async function createPatientAction(data: PatientSchemaType) {
  try {
    // 1. Validate payload with Zod
    const validated = PatientSchema.parse(data);

    // 2. Check duplicate National ID
    const existing = await prisma.patient.findUnique({
      where: { nationalId: validated.nationalId },
    });

    if (existing) {
      return { success: false, error: 'เลขประจำตัวประชาชนนี้มีประวัติในระบบแล้ว (HN: ' + existing.hn + ')' };
    }

    // 3. Generate sequential HN
    const count = await prisma.patient.count();
    const newHn = generateHN(count + 1);

    // 4. Create Patient Record in DB
    const patient = await prisma.patient.create({
      data: {
        hn: newHn,
        nationalId: sanitizeString(validated.nationalId),
        prefix: sanitizeString(validated.prefix),
        firstName: sanitizeString(validated.firstName),
        lastName: sanitizeString(validated.lastName),
        dateOfBirth: new Date(validated.dateOfBirth),
        gender: validated.gender,
        bloodGroup: validated.bloodGroup,
        allergies: JSON.stringify(validated.allergies),
        chronicDiseases: JSON.stringify(validated.chronicDiseases),
        phone: sanitizeString(validated.phone),
        emergencyContact: validated.emergencyContact ? sanitizeString(validated.emergencyContact) : null,
        address: sanitizeString(validated.address),
      },
    });

    // 5. Log PDPA Audit Entry
    await logAudit({
      userId: 'system-receptionist',
      action: 'CREATE_PATIENT',
      resource: `Patient:${patient.hn}`,
      details: { name: `${patient.firstName} ${patient.lastName}` },
    });

    revalidatePath('/booking');
    return { success: true, patient };
  } catch (error: any) {
    console.error('Error creating patient:', error);
    return { success: false, error: error.message || 'ไม่สามารถลงทะเบียนผู้ป่วยได้' };
  }
}
