'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { patientSchema, PatientSchemaType } from '@/lib/validations/patient';
import { logAudit } from '@/lib/security/audit';

export async function createPatientAction(data: PatientSchemaType) {
  try {
    const validated = patientSchema.parse(data);

    const existing = await prisma.patient.findFirst({
      where: {
        OR: [{ nationalId: validated.nationalId }, { hn: `HN-${validated.nationalId.slice(-6)}` }],
      },
    });

    if (existing) {
      return { success: false, error: 'มีผู้ป่วยรหัสประจำตัวนี้ในระบบแล้ว' };
    }

    const count = await prisma.patient.count();
    const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
    const autoHn = `HN-${dateStr}-${(count + 1).toString().padStart(4, '0')}`;

    const patient = await prisma.patient.create({
      data: {
        hn: autoHn,
        nationalId: validated.nationalId,
        idType: validated.idType,
        passportNo: validated.passportNo || null,
        prefix: validated.prefix,
        firstName: validated.firstName,
        lastName: validated.lastName,
        dateOfBirth: new Date(validated.dateOfBirth),
        gender: validated.gender,
        bloodGroup: validated.bloodGroup || null,
        allergies: JSON.stringify(validated.allergies),
        chronicDiseases: JSON.stringify(validated.chronicDiseases),
        phone: validated.phone,
        emergencyContact: validated.emergencyContact || null,
        address: validated.address,
        isNewborn: validated.isNewborn,
        isDeceased: validated.isDeceased,
      },
    });

    await logAudit({
      userId: 'system-user',
      action: 'REGISTER_PATIENT',
      resource: `Patient:${patient.hn}`,
      details: { hn: patient.hn, idType: patient.idType },
    });

    revalidatePath('/nurse/screening');
    return { success: true, patient };
  } catch (error: any) {
    console.error('Error registering patient:', error);
    return { success: false, error: error.message || 'ไม่สามารถลงทะเบียนผู้ป่วยได้' };
  }
}

/**
 * Merge duplicate patient records (การยุบรวม HN ซ้ำ)
 */
export async function mergeDuplicatePatientsAction(primaryHn: string, secondaryHn: string) {
  try {
    const primary = await prisma.patient.findUnique({ where: { hn: primaryHn } });
    const secondary = await prisma.patient.findUnique({ where: { hn: secondaryHn } });

    if (!primary || !secondary) {
      return { success: false, error: 'ไม่พบข้อมูลผู้ป่วยสำหรับยุบรวม' };
    }

    // Re-link secondary patient's appointments and prescriptions to primary patient
    await prisma.appointment.updateMany({
      where: { patientId: secondary.id },
      data: { patientId: primary.id },
    });

    await prisma.prescription.updateMany({
      where: { patientId: secondary.id },
      data: { patientId: primary.id },
    });

    await prisma.invoice.updateMany({
      where: { patientId: secondary.id },
      data: { patientId: primary.id },
    });

    // Mark secondary patient as archived
    await prisma.patient.update({
      where: { id: secondary.id },
      data: {
        isArchived: true,
        archivedReason: `ยุบรวมประวัติเข้ากับ HN: ${primary.hn}`,
      },
    });

    await logAudit({
      userId: 'system-user',
      action: 'MERGE_PATIENT_RECORDS',
      resource: `Patient:${primary.hn}`,
      details: { primaryHn, secondaryHnMerged: secondaryHn },
    });

    return { success: true, message: `ยุบรวมประวัติ ${secondaryHn} เข้ากับ ${primaryHn} สำเร็จ` };
  } catch (error: any) {
    console.error('Error merging patients:', error);
    return { success: false, error: 'ไม่สามารถยุบรวมประวัติผู้ป่วยได้' };
  }
}
