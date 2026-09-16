'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sanitizeString } from '@/lib/security/sanitization';

export interface QueueItem {
  id: string;
  hn: string;
  patientName: string;
  status: string;
  roomName: string;
  doctorName: string;
  updatedAt: string;
}

/**
 * Get TV Queue Data (Real-time live queue for TV screen)
 */
export async function getTvQueueDataAction() {
  try {
    const appointments = await prisma.appointment.findMany({
      where: {
        status: { in: ['WAITING', 'IN_CONSULTATION', 'PENDING_PHARMACY', 'PENDING_CASHIER'] },
      },
      include: {
        patient: true,
        doctor: true,
      },
      orderBy: { updatedAt: 'desc' },
      take: 30,
    });

    const currentlyCalling: QueueItem[] = appointments
      .filter((a) => a.status === 'IN_CONSULTATION' || a.status === 'PENDING_PHARMACY' || a.status === 'PENDING_CASHIER')
      .map((a) => {
        let room = 'ห้องตรวจ 1';
        if (a.status === 'PENDING_PHARMACY') room = 'ห้องจ่ายยา 💊';
        if (a.status === 'PENDING_CASHIER') room = 'ช่องการเงิน 💳';

        return {
          id: a.id,
          hn: a.patient.hn,
          patientName: `${a.patient.prefix || ''}${a.patient.firstName} ${a.patient.lastName}`,
          status: a.status,
          roomName: room,
          doctorName: a.doctor?.name || 'พญ. สุภาพร ใจดี',
          updatedAt: a.updatedAt.toISOString(),
        };
      });

    const waitingQueue: QueueItem[] = appointments
      .filter((a) => a.status === 'WAITING')
      .map((a) => ({
        id: a.id,
        hn: a.patient.hn,
        patientName: `${a.patient.prefix || ''}${a.patient.firstName} ${a.patient.lastName}`,
        status: a.status,
        roomName: 'คอยหน้าห้องตรวจ',
        doctorName: a.doctor?.name || 'พญ. สุภาพร ใจดี',
        updatedAt: a.updatedAt.toISOString(),
      }));

    return {
      success: true,
      currentlyCalling,
      waitingQueue,
      timestamp: new Date().toISOString(),
    };
  } catch (error: any) {
    console.error('Error fetching TV Queue:', error);
    return { success: false, error: 'ไม่สามารถโหลดข้อมูลคิวได้', currentlyCalling: [], waitingQueue: [] };
  }
}

/**
 * Call Queue Action (สำหรับแพทย์/พยาบาลกดเรียกคิว)
 */
export async function callQueueAction(appointmentId: string, roomName: string = 'ห้องตรวจ 1') {
  try {
    const cleanId = sanitizeString(appointmentId);
    const appointment = await prisma.appointment.update({
      where: { id: cleanId },
      data: {
        status: 'IN_CONSULTATION',
        updatedAt: new Date(),
      },
      include: { patient: true, doctor: true },
    });

    await logAudit({
      userId: appointment.doctorId || 'system-doctor',
      action: 'CALL_QUEUE',
      resource: `Patient:${appointment.patient.hn}`,
      details: { roomName, name: `${appointment.patient.firstName} ${appointment.patient.lastName}` },
    });

    revalidatePath('/queue/tv-display');
    revalidatePath('/queue/caller');
    return {
      success: true,
      patientName: `${appointment.patient.prefix || ''}${appointment.patient.firstName} ${appointment.patient.lastName}`,
      hn: appointment.patient.hn,
      roomName,
    };
  } catch (error: any) {
    console.error('Error calling queue:', error);
    return { success: false, error: error.message || 'ไม่สามารถเรียกคิวได้' };
  }
}
