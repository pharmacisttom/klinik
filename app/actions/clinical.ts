'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';
import { checkDrugAllergies } from '@/lib/clinical/allergy-check';

/**
 * Search patients by HN, National ID, or Name
 */
export async function searchPatientsAction(query?: string) {
  try {
    if (!query || query.trim() === '') {
      const patients = await prisma.patient.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
      });
      return { success: true, patients };
    }

    const cleanQuery = sanitizeString(query.trim());
    const patients = await prisma.patient.findMany({
      where: {
        OR: [
          { hn: { contains: cleanQuery } },
          { nationalId: { contains: cleanQuery } },
          { firstName: { contains: cleanQuery } },
          { lastName: { contains: cleanQuery } },
          { phone: { contains: cleanQuery } },
        ],
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, patients };
  } catch (error: any) {
    console.error('Error searching patients:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการค้นหาผู้ป่วย' };
  }
}

/**
 * Save Nurse Screening Vitals & Chief Complaint
 */
export async function saveScreeningAction(data: {
  patientHn: string;
  bpSys: number;
  bpDia: number;
  pulse: number;
  temp: number;
  weight: number;
  height: number;
  chiefComplaint: string;
}) {
  try {
    const cleanHn = sanitizeString(data.patientHn);
    const patient = await prisma.patient.findUnique({
      where: { hn: cleanHn },
    });

    if (!patient) {
      return { success: false, error: `ไม่พบข้อมูลผู้ป่วยรหัส HN: ${cleanHn}` };
    }

    let doctor = await prisma.user.findFirst({
      where: { role: 'DOCTOR' },
    });

    if (!doctor) {
      doctor = await prisma.user.create({
        data: {
          email: 'doctor.default@klinik.local',
          name: 'Dr. Somchai Jaidee',
          passwordHash: 'hashed_password',
          role: 'DOCTOR',
        },
      });
    }

    const vitalsJson = JSON.stringify({
      bpSys: data.bpSys,
      bpDia: data.bpDia,
      pulse: data.pulse,
      temp: data.temp,
      weight: data.weight,
      height: data.height,
    });

    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        status: { in: ['SCHEDULED', 'WAITING', 'IN_CONSULTATION'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    let appointment;
    if (existingAppointment) {
      appointment = await prisma.appointment.update({
        where: { id: existingAppointment.id },
        data: {
          vitals: vitalsJson,
          chiefComplaint: sanitizeString(data.chiefComplaint),
          status: 'WAITING',
        },
      });
    } else {
      appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(),
          reason: sanitizeString(data.chiefComplaint),
          vitals: vitalsJson,
          chiefComplaint: sanitizeString(data.chiefComplaint),
          status: 'WAITING',
        },
      });
    }

    await logAudit({
      userId: doctor.id,
      action: 'RECORD_VITALS',
      resource: `Patient:${patient.hn}`,
      details: { appointmentId: appointment.id, bp: `${data.bpSys}/${data.bpDia}`, temp: data.temp },
    });

    revalidatePath('/nurse/screening');
    revalidatePath('/doctor/consultation');
    return { success: true, appointment, patient };
  } catch (error: any) {
    console.error('Error saving screening vitals:', error);
    return { success: false, error: error.message || 'ไม่สามารถบันทึกสัญญาณชีพได้' };
  }
}

/**
 * Save Doctor Examination, ICD-10 Diagnosis & Prescriptions
 */
export async function saveConsultationAction(data: {
  patientHn: string;
  diagnosisCode: string;
  diagnosisDesc: string;
  dxType?: number;
  isChronic?: boolean;
  doctorNotes?: string;
  chiefComplaint?: string;
  items: Array<{
    medCode: string;
    qty: number;
    dosage: string;
  }>;
}) {
  try {
    const cleanHn = sanitizeString(data.patientHn);
    const patient = await prisma.patient.findUnique({
      where: { hn: cleanHn },
    });

    if (!patient) {
      return { success: false, error: `ไม่พบข้อมูลผู้ป่วยรหัส HN: ${cleanHn}` };
    }

    let appointment = await prisma.appointment.findFirst({
      where: {
        patientId: patient.id,
        status: { in: ['SCHEDULED', 'WAITING', 'IN_CONSULTATION'] },
      },
      orderBy: { createdAt: 'desc' },
    });

    let doctor = await prisma.user.findFirst({ where: { role: 'DOCTOR' } });
    if (!doctor) {
      doctor = await prisma.user.create({
        data: { email: 'doctor@klinik.local', name: 'Dr. Somchai', passwordHash: 'hash', role: 'DOCTOR' },
      });
    }

    if (!appointment) {
      appointment = await prisma.appointment.create({
        data: {
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: new Date(),
          reason: data.chiefComplaint || 'ตรวจรักษาโรคทั่วไป',
          chiefComplaint: data.chiefComplaint || 'มีไข้ ปวดศีรษะ',
          status: 'IN_CONSULTATION',
        },
      });
    }

    if (appointment.doctorNotes || appointment.diagnosisCode) {
      await prisma.emrVersionHistory.create({
        data: {
          appointmentId: appointment.id,
          doctorId: doctor.id,
          previousNotes: appointment.doctorNotes,
          previousDiagnosisCode: appointment.diagnosisCode,
        },
      });
    }

    await prisma.appointment.update({
      where: { id: appointment.id },
      data: {
        diagnosisCode: sanitizeString(data.diagnosisCode),
        diagnosisDesc: sanitizeString(data.diagnosisDesc),
        dxType: data.dxType || 1,
        isChronic: data.isChronic || false,
        doctorNotes: data.doctorNotes ? sanitizeString(data.doctorNotes) : null,
        status: 'PENDING_PHARMACY',
      },
    });

    await prisma.prescription.deleteMany({
      where: { appointmentId: appointment.id },
    });

    if (data.items.length > 0) {
      // Find medication IDs to check for allergies
      const medCodes = data.items.map((i) => i.medCode);
      const targetMeds = await prisma.medication.findMany({
        where: { code: { in: medCodes } },
        select: { id: true },
      });

      const allergyResult = await checkDrugAllergies(
        patient.id,
        targetMeds.map((m) => m.id)
      );

      if (!allergyResult.isSafe) {
        return {
          success: false,
          error: 'พบความเสี่ยงแพ้ยารุนแรง (Allergy Hard-Stop)',
          hardStops: allergyResult.hardStops,
        };
      }

      const prescription = await prisma.prescription.create({
        data: {
          appointmentId: appointment.id,
          patientId: patient.id,
          status: 'PENDING',
          notes: data.doctorNotes ? sanitizeString(data.doctorNotes) : null,
        },
      });

      for (const item of data.items) {
        let medication = await prisma.medication.findUnique({
          where: { code: item.medCode },
        });

        if (!medication) {
          medication = await prisma.medication.create({
            data: {
              code: item.medCode,
              name: item.medCode,
              genericName: item.medCode,
              category: 'General',
              unit: 'Tablet',
              pricePerUnit: 5.0,
              stockQuantity: 500,
            },
          });
        }

        const totalPrice = item.qty * medication.pricePerUnit;
        await prisma.prescriptionItem.create({
          data: {
            prescriptionId: prescription.id,
            medicationId: medication.id,
            quantity: item.qty,
            dosage: sanitizeString(item.dosage),
            unitPrice: medication.pricePerUnit,
            totalPrice,
          },
        });
      }
    }

    await logAudit({
      userId: doctor.id,
      action: 'DOCTOR_CONSULTATION',
      resource: `Patient:${patient.hn}`,
      details: { icd10: data.diagnosisCode, itemsCount: data.items.length },
    });

    revalidatePath('/doctor/consultation');
    revalidatePath('/pharmacy');
    return { success: true, appointmentId: appointment.id };
  } catch (error: any) {
    console.error('Error saving consultation:', error);
    return { success: false, error: error.message || 'ไม่สามารถบันทึกผลการตรวจได้' };
  }
}

/**
 * Dispense Prescription & Deduct Medication Inventory Stock
 */
export async function dispensePrescriptionAction(patientHn: string) {
  try {
    const cleanHn = sanitizeString(patientHn);
    const patient = await prisma.patient.findUnique({
      where: { hn: cleanHn },
    });

    if (!patient) {
      return { success: false, error: `ไม่พบข้อมูลผู้ป่วยรหัส HN: ${cleanHn}` };
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        patientId: patient.id,
        status: 'PENDING',
      },
      include: {
        items: {
          include: { medication: true },
        },
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!prescription) {
      return { success: false, error: 'ไม่พบใบสั่งยาที่รอจัดสำหรับผู้ป่วยรายนี้' };
    }

    let pharmacist = await prisma.user.findFirst({ where: { role: 'PHARMACIST' } });

    await prisma.$transaction(async (tx) => {
      for (const item of prescription.items) {
        if (item.medication.stockQuantity < item.quantity) {
          throw new Error(`ยา ${item.medication.name} มีคงเหลือในสต๊อกไม่พอ (คงเหลือ: ${item.medication.stockQuantity})`);
        }

        await tx.medication.update({
          where: { id: item.medicationId },
          data: {
            stockQuantity: { decrement: item.quantity },
          },
        });
      }

      await tx.prescription.update({
        where: { id: prescription.id },
        data: {
          status: 'DISPENSED',
          dispensedAt: new Date(),
          dispensedBy: pharmacist ? pharmacist.name : 'Pharm. Manoch Rx',
        },
      });

      if (prescription.appointment) {
        await tx.appointment.update({
          where: { id: prescription.appointment.id },
          data: { status: 'PENDING_CASHIER' },
        });
      }
    });

    await logAudit({
      userId: pharmacist ? pharmacist.id : 'system-pharmacist',
      action: 'DISPENSE_MEDICATION',
      resource: `Prescription:${prescription.id}`,
      details: { patientHn: patient.hn, itemCount: prescription.items.length },
    });

    revalidatePath('/pharmacy');
    revalidatePath('/cashier');
    return { success: true, prescriptionId: prescription.id };
  } catch (error: any) {
    console.error('Error dispensing prescription:', error);
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการตัดสต๊อกยา' };
  }
}

/**
 * Process Cashier Payment & Generate Invoice
 */
export async function processPaymentAction(data: {
  patientHn: string;
  paymentMethod: 'CASH' | 'QR_PROMPTPAY';
}) {
  try {
    const cleanHn = sanitizeString(data.patientHn);
    const patient = await prisma.patient.findUnique({
      where: { hn: cleanHn },
    });

    if (!patient) {
      return { success: false, error: `ไม่พบข้อมูลผู้ป่วยรหัส HN: ${cleanHn}` };
    }

    const prescription = await prisma.prescription.findFirst({
      where: {
        patientId: patient.id,
      },
      include: {
        items: true,
        appointment: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    let medTotal = 0;
    if (prescription && prescription.items.length > 0) {
      medTotal = prescription.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    } else {
      medTotal = 155.0;
    }

    const doctorFee = 300.0;
    const netAmount = medTotal + doctorFee;

    const count = await prisma.invoice.count();
    const invoiceNo = `INV-2569-${String(count + 1).padStart(4, '0')}`;

    let cashier = await prisma.user.findFirst({ where: { role: 'CASHIER' } });

    if (prescription) {
      await prisma.invoice.create({
        data: {
          invoiceNumber: invoiceNo,
          patientId: patient.id,
          prescriptionId: prescription.id,
          amount: medTotal + doctorFee,
          discount: 0,
          netAmount,
          status: 'PAID',
          paymentMethod: data.paymentMethod,
          paidAt: new Date(),
        },
      });

      if (prescription.appointmentId) {
        await prisma.appointment.update({
          where: { id: prescription.appointmentId },
          data: { status: 'COMPLETED' },
        });
      }
    }

    await logAudit({
      userId: cashier ? cashier.id : 'system-cashier',
      action: 'COLLECT_PAYMENT',
      resource: `Invoice:${invoiceNo}`,
      details: { netAmount, paymentMethod: data.paymentMethod },
    });

    revalidatePath('/cashier');
    return { success: true, invoiceNo, netAmount };
  } catch (error: any) {
    console.error('Error processing payment:', error);
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการชำระเงิน' };
  }
}

/**
 * Get Inventory Medications
 */
export async function getInventoryAction() {
  try {
    const medications = await prisma.medication.findMany({
      orderBy: { code: 'asc' },
    });
    return { success: true, medications };
  } catch (error: any) {
    console.error('Error fetching inventory:', error);
    return { success: false, error: 'ไม่สามารถดึงข้อมูลคลังยาได้' };
  }
}

/**
 * Add / Update Medication Stock
 */
export async function addOrUpdateMedicationAction(data: {
  code: string;
  name: string;
  genericName: string;
  category: string;
  unit: string;
  pricePerUnit: number;
  stockQuantity: number;
  reorderLevel: number;
}) {
  try {
    const code = sanitizeString(data.code);
    const medication = await prisma.medication.upsert({
      where: { code },
      update: {
        stockQuantity: { increment: data.stockQuantity },
        pricePerUnit: data.pricePerUnit,
        reorderLevel: data.reorderLevel,
      },
      create: {
        code,
        name: sanitizeString(data.name),
        genericName: sanitizeString(data.genericName),
        category: sanitizeString(data.category),
        unit: sanitizeString(data.unit),
        pricePerUnit: data.pricePerUnit,
        stockQuantity: data.stockQuantity,
        reorderLevel: data.reorderLevel,
      },
    });

    await logAudit({
      userId: 'pharmacist-admin',
      action: 'UPDATE_INVENTORY',
      resource: `Medication:${medication.code}`,
      details: { addedQty: data.stockQuantity, newTotal: medication.stockQuantity },
    });

    revalidatePath('/pharmacy/inventory');
    return { success: true, medication };
  } catch (error: any) {
    console.error('Error updating medication:', error);
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการปรับปรุงคลังยา' };
  }
}

/**
 * Get Staff Users (Admin)
 */
export async function getStaffUsersAction() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return { success: true, users };
  } catch (error: any) {
    console.error('Error fetching staff users:', error);
    return { success: false, error: 'ไม่สามารถดึงข้อมูลบุคลากรได้' };
  }
}

/**
 * Create New Staff User (Admin)
 */
export async function createStaffUserAction(data: {
  name: string;
  email: string;
  role: string;
  phone?: string;
}) {
  try {
    const email = sanitizeString(data.email);
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return { success: false, error: 'อีเมลนี้ถูกใช้งานในระบบแล้ว' };
    }

    const user = await prisma.user.create({
      data: {
        name: sanitizeString(data.name),
        email,
        passwordHash: '$2a$12$eImiTXuWVxfM37uY4JANjO5E.y/tLlh4Y./1m2P78zF9Jd0bXWJ.m', // default hash
        role: data.role,
        phone: data.phone ? sanitizeString(data.phone) : null,
      },
    });

    await logAudit({
      userId: 'admin-system',
      action: 'CREATE_STAFF_USER',
      resource: `User:${user.id}`,
      details: { name: user.name, role: user.role },
    });

    revalidatePath('/admin/users');
    return { success: true, user };
  } catch (error: any) {
    console.error('Error creating staff user:', error);
    return { success: false, error: error.message || 'ไม่สามารถสร้างบุคลากรใหม่ได้' };
  }
}

/**
 * Update Staff User Role & Record Audit Event (Admin Only)
 */
export async function updateUserRoleAction(userId: string, newRole: string) {
  try {
    const cleanUserId = sanitizeString(userId);
    const validRoles = ['ADMIN', 'DOCTOR', 'NURSE', 'PHARMACIST', 'CASHIER'];
    if (!validRoles.includes(newRole)) {
      return { success: false, error: 'บทบาทหน้าที่ไม่ถูกต้อง' };
    }

    const user = await prisma.user.findUnique({ where: { id: cleanUserId } });
    if (!user) {
      return { success: false, error: 'ไม่พบผู้ใช้งานในระบบ' };
    }

    const oldRole = user.role;
    const updatedUser = await prisma.user.update({
      where: { id: cleanUserId },
      data: { role: newRole },
    });

    await logAudit({
      userId: 'admin-system',
      action: 'UPDATE_USER_ROLE',
      resource: `User:${user.email}`,
      details: { oldRole, newRole, name: user.name },
    });

    revalidatePath('/admin/users');
    return { success: true, user: updatedUser };
  } catch (error: any) {
    console.error('Error updating user role:', error);
    return { success: false, error: error.message || 'ไม่สามารถปรับเปลี่ยนบทบาทผู้ใช้งานได้' };
  }
}

/**
 * Get Audit Logs for Admin
 */
export async function getAuditLogsAction(query?: string) {
  try {
    let whereClause = {};
    if (query && query.trim() !== '') {
      const cleanQuery = sanitizeString(query.trim());
      whereClause = {
        OR: [
          { action: { contains: cleanQuery } },
          { resource: { contains: cleanQuery } },
          { userId: { contains: cleanQuery } },
        ],
      };
    }

    const logs = await prisma.auditLog.findMany({
      where: whereClause,
      take: 50,
      orderBy: { createdAt: 'desc' },
    });

    return { success: true, logs };
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return { success: false, error: 'ไม่สามารถดึงข้อมูล Audit Log ได้' };
  }
}

/**
 * Submit PDPA Data Request (Export / Erasure)
 */
export async function createDataRequestAction(data: {
  nationalId: string;
  phone: string;
  type: 'DATA_EXPORT' | 'DATA_ERASURE';
  reason?: string;
}) {
  try {
    const cleanNationalId = sanitizeString(data.nationalId);
    const cleanPhone = sanitizeString(data.phone);

    let patient = await prisma.patient.findUnique({
      where: { nationalId: cleanNationalId },
    });

    let userId = patient?.userId;
    if (!userId) {
      let user = await prisma.user.findFirst({
        where: { phone: cleanPhone },
      });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: `patient.${cleanNationalId}@klinik.local`,
            name: `Patient ${cleanNationalId}`,
            passwordHash: 'hash',
            role: 'PATIENT',
            phone: cleanPhone,
          },
        });
      }
      userId = user.id;
    }

    const dataRequest = await prisma.dataRequest.create({
      data: {
        userId,
        type: data.type,
        status: 'PENDING',
        reason: data.reason ? sanitizeString(data.reason) : null,
      },
    });

    await logAudit({
      userId,
      action: data.type === 'DATA_EXPORT' ? 'EXPORT_PDPA_DATA' : 'REQUEST_DATA_ERASURE',
      resource: `DataRequest:${dataRequest.id}`,
      details: { nationalId: cleanNationalId, phone: cleanPhone },
    });

    revalidatePath('/pdpa/data-request');
    return { success: true, requestId: dataRequest.id };
  } catch (error: any) {
    console.error('Error creating data request:', error);
    return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการส่งคำขอ' };
  }
}
