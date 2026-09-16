'use server';

import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';
import { sendLineAlert } from '@/lib/notifications/line';

export async function logColdChainTempAction(data: {
  fridgeId?: string;
  tempCelsius: number;
  inspectorName: string;
}) {
  try {
    const isAlarm = data.tempCelsius < 2.0 || data.tempCelsius > 8.0;

    const log = await prisma.coldChainLog.create({
      data: {
        fridgeId: data.fridgeId || 'FRIDGE-MAIN-01',
        tempCelsius: data.tempCelsius,
        isAlarm,
        inspectorName: data.inspectorName,
      },
    });

    if (isAlarm) {
      await sendLineAlert({
        title: '⚠️ แจ้งเตือนอุณหภูมิตู้เย็นคลังยาผิดปกติ (Cold Chain Alert)',
        message: `ตู้เย็น ${data.fridgeId || 'FRIDGE-MAIN-01'} วัดได้ ${data.tempCelsius}°C (อยู่นอกช่วงมาตรฐาน 2°C–8°C) โดย ${data.inspectorName}`,
        level: 'CRITICAL',
      });
    }

    await logAudit({
      userId: 'system-user',
      action: 'LOG_COLD_CHAIN_TEMP',
      resource: `ColdChainLog:${log.id}`,
      details: { tempCelsius: data.tempCelsius, isAlarm },
    });

    return { success: true, log, isAlarm };
  } catch (error: any) {
    console.error('Error logging cold chain temp:', error);
    return { success: false, error: 'ไม่สามารถบันทึกอุณหภูมิตู้เย็นได้' };
  }
}

export async function getColdChainLogsAction() {
  try {
    const logs = await prisma.coldChainLog.findMany({
      orderBy: { checkedAt: 'desc' },
      take: 50,
    });
    return { success: true, logs };
  } catch (error: any) {
    console.error('Error fetching cold chain logs:', error);
    return { success: false, error: 'ไม่สามารถดึงข้อมูลอุณหภูมิตู้เย็นได้' };
  }
}
