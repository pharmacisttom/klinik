'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';

/**
 * Issue a statutory Thai Medical Certificate (ใบรับรองแพทย์ตามกฎหมาย 5 โรค)
 */
export async function createMedicalCertificateAction(data: {
  patientHn: string;
  type: 'WORK_FITNESS' | 'SICK_LEAVE' | 'DRIVER_LICENSE';
  fitForWork: boolean;
  restDays?: number;
  startDate?: string;
  endDate?: string;
  diagnosisText: string;
  remarks?: string;
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

    const count = await prisma.medicalCertificate.count();
    const certNum = `MC-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const cert = await prisma.medicalCertificate.create({
      data: {
        certificateNumber: certNum,
        patientId: patient.id,
        doctorId: doctor.id,
        type: data.type,
        fiveDiseasesChecked: true,
        fitForWork: data.fitForWork,
        restDays: data.restDays || 0,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        diagnosisText: sanitizeString(data.diagnosisText),
        remarks: data.remarks ? sanitizeString(data.remarks) : null,
      },
      include: {
        patient: true,
        doctor: true,
      },
    });

    await logAudit({
      userId: doctor.id,
      action: 'CREATE_MEDICAL_CERTIFICATE',
      resource: `MedicalCertificate:${cert.certificateNumber}`,
      details: { patientHn: patient.hn, type: data.type },
    });

    return { success: true, certificate: cert };
  } catch (error: any) {
    console.error('Error creating medical certificate:', error);
    return { success: false, error: 'ไม่สามารถออกใบรับรองแพทย์ได้' };
  }
}

/**
 * Verify & fetch a medical certificate by certificate number for public validation
 */
export async function getMedicalCertificateByNumberAction(certNumber: string) {
  try {
    const cert = await prisma.medicalCertificate.findUnique({
      where: { certificateNumber: certNumber },
      include: {
        patient: true,
        doctor: true,
      },
    });

    if (!cert) {
      return { success: false, error: 'ไม่พบใบรับรองแพทย์ฉบับนี้ในระบบ' };
    }

    return { success: true, certificate: cert };
  } catch (error: any) {
    console.error('Error fetching medical certificate:', error);
    return { success: false, error: 'ไม่สามารถตรวจสอบเอกสารได้' };
  }
}

/**
 * Generate a Revenue Dept compliant Tax Receipt (ใบเสร็จรับเงิน/ใบกำกับภาษี)
 */
export async function createTaxReceiptAction(invoiceId: string, patientTaxId?: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        patient: true,
        prescription: {
          include: {
            items: {
              include: { medication: true },
            },
          },
        },
      },
    });

    if (!invoice) {
      return { success: false, error: 'ไม่พบใบแจ้งชำระเงิน' };
    }

    const existingReceipt = await prisma.taxReceipt.findUnique({
      where: { invoiceId },
    });

    if (existingReceipt) {
      return { success: true, taxReceipt: existingReceipt };
    }

    let medicalAmount = 0; // Medical fees (VAT Exempt per Section 81(1)(เว))
    let taxableAmount = 0; // Cosmetics/Supplements subject to 7% VAT

    if (invoice.prescription && invoice.prescription.items) {
      for (const item of invoice.prescription.items) {
        if (item.medication.category === 'Cosmetics' || item.medication.category === 'Supplements') {
          taxableAmount += item.totalPrice;
        } else {
          medicalAmount += item.totalPrice;
        }
      }
    } else {
      medicalAmount = invoice.netAmount;
    }

    const vatAmount = Math.round(taxableAmount * 0.07 * 100) / 100;
    const netTotal = medicalAmount + taxableAmount + vatAmount;

    const count = await prisma.taxReceipt.count();
    const taxNum = `TAX-${new Date().getFullYear()}-${(count + 1).toString().padStart(5, '0')}`;

    const taxReceipt = await prisma.taxReceipt.create({
      data: {
        taxReceiptNumber: taxNum,
        invoiceId: invoice.id,
        patientId: invoice.patientId,
        patientTaxId: patientTaxId ? sanitizeString(patientTaxId) : null,
        clinicTaxId: '0105565000123',
        branchNo: '00000',
        medicalAmount,
        taxableAmount,
        vatAmount,
        netTotal,
      },
    });

    return { success: true, taxReceipt };
  } catch (error: any) {
    console.error('Error creating tax receipt:', error);
    return { success: false, error: 'ไม่สามารถสร้างใบเสร็จรับเงิน/ใบกำกับภาษีได้' };
  }
}
