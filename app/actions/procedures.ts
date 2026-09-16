'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';

/**
 * Record a Minor Surgery or Procedure (บันทึกการทำผ่าตัดเล็ก/เย็บแผล/ทำแผล)
 */
export async function recordProcedureAction(data: {
  patientHn: string;
  procedureCode: string; // ICD-9-CM code (e.g. 86.59)
  procedureName: string;
  anesthesiaType?: 'LOCAL' | 'NONE' | 'SEDATION';
  consentSigned: boolean;
  notes?: string;
  vitalsBefore?: { bpSys: number; bpDia: number; pulse: number };
  vitalsAfter?: { bpSys: number; bpDia: number; pulse: number };
}) {
  try {
    const cleanHn = sanitizeString(data.patientHn);
    const patient = await prisma.patient.findUnique({
      where: { hn: cleanHn },
    });

    if (!patient) {
      return { success: false, error: `ไม่พบข้อมูลผู้ป่วย HN: ${cleanHn}` };
    }

    let doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
    if (!doctor) {
      doctor = await prisma.user.create({
        data: { email: 'doctor@klinik.local', name: 'Dr. Somchai Jaidee', passwordHash: 'hash', role: 'DOCTOR' },
      });
    }

    const procedure = await prisma.procedureRecord.create({
      data: {
        procedureCode: sanitizeString(data.procedureCode),
        procedureName: sanitizeString(data.procedureName),
        patientId: patient.id,
        doctorId: doctor.id,
        anesthesiaType: data.anesthesiaType || 'LOCAL',
        consentSigned: data.consentSigned,
        vitalSignsBefore: data.vitalsBefore ? JSON.stringify(data.vitalsBefore) : null,
        vitalSignsAfter: data.vitalsAfter ? JSON.stringify(data.vitalsAfter) : null,
        notes: data.notes ? sanitizeString(data.notes) : null,
      },
    });

    await logAudit({
      userId: doctor.id,
      action: 'RECORD_PROCEDURE',
      resource: `ProcedureRecord:${procedure.id}`,
      details: { patientHn: patient.hn, procedureCode: procedure.procedureCode },
    });

    return { success: true, procedure };
  } catch (error: any) {
    console.error('Error recording procedure:', error);
    return { success: false, error: 'ไม่สามารถบันทึกข้อมูลหัตถการได้' };
  }
}
