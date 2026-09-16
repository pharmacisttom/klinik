'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';

export async function getControlledDrugLogsAction(category?: string) {
  try {
    const logs = await prisma.controlledDrugLog.findMany({
      where: category && category !== 'ALL'
        ? { medication: { controlCategory: category } }
        : {},
      include: {
        medication: true,
        patient: true,
        doctor: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return { success: true, logs };
  } catch (error: any) {
    console.error('Error fetching controlled drug logs:', error);
    return { success: false, error: 'ไม่สามารถดึงข้อมูลสมุดบัญชียาควบคุม (ข.ด.9 / ข.ด.11) ได้' };
  }
}

export async function getDrugLotsAction() {
  try {
    const lots = await prisma.drugLot.findMany({
      include: {
        medication: true,
      },
      orderBy: { expiryDate: 'asc' },
    });

    return { success: true, lots };
  } catch (error: any) {
    console.error('Error fetching drug lots:', error);
    return { success: false, error: 'ไม่สามารถดึงข้อมูล Lot และวันหมดอายุได้' };
  }
}
