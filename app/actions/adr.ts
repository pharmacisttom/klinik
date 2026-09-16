'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';
import { calculateNaranjoScore, NaranjoQuestions } from '@/lib/clinical/naranjo-calculator';

export async function recordAdrReportAction(data: {
  patientHn: string;
  medicationCode: string;
  reactionDesc: string;
  severity: 'MILD' | 'MODERATE' | 'SEVERE' | 'LIFE_THREATENING';
  naranjoAnswers: NaranjoQuestions;
}) {
  try {
    const cleanHn = sanitizeString(data.patientHn);
    const patient = await prisma.patient.findUnique({ where: { hn: cleanHn } });
    if (!patient) return { success: false, error: `ไม่พบข้อมูลผู้ป่วย HN: ${cleanHn}` };

    const medication = await prisma.medication.findUnique({ where: { code: data.medicationCode } });
    if (!medication) return { success: false, error: `ไม่พบข้อมูลยา: ${data.medicationCode}` };

    const { score, causality } = calculateNaranjoScore(data.naranjoAnswers);

    const report = await prisma.adrReport.create({
      data: {
        patientId: patient.id,
        medicationId: medication.id,
        reactionDesc: sanitizeString(data.reactionDesc),
        severity: data.severity,
        naranjoScore: score,
        causality,
        reportedToFda: true,
      },
    });

    await logAudit({
      userId: 'pharmacist-user',
      action: 'RECORD_ADR_REPORT',
      resource: `AdrReport:${report.id}`,
      details: { patientHn: patient.hn, medicationCode: medication.code, naranjoScore: score, causality },
    });

    return { success: true, report, naranjoScore: score, causality };
  } catch (error: any) {
    console.error('Error recording ADR report:', error);
    return { success: false, error: 'ไม่สามารถบันทึกรายงาน ADR ได้' };
  }
}
