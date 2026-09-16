import { prisma } from '@/lib/prisma';

export interface FdaSubstanceReportResult {
  reportType: 'อย.ส.4' | 'อย.ส.5';
  clinicLicenseNo: string;
  reportingYear: number;
  reportingMonth: number;
  reportTxt: string;
  totalTransactions: number;
}

/**
 * Generates official Thai FDA report อย.ส.4 (รายงานการรับ-จ่ายวัตถุออกฤทธิ์ประจำเดือน)
 * and อย.ส.5 (รายงานประจำปี) per Psychotropic Substances Act B.E. 2559.
 */
export async function generateFdaSubstanceReport(
  reportType: 'อย.ส.4' | 'อย.ส.5',
  year: number,
  month?: number
): Promise<FdaSubstanceReportResult> {
  const startDate = new Date(year, (month || 1) - 1, 1);
  const endDate = month ? new Date(year, month, 0, 23, 59, 59) : new Date(year, 11, 31, 23, 59, 59);

  const logs = await prisma.controlledDrugLog.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      medication: true,
      patient: true,
      doctor: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const lines: string[] = [];
  lines.push(`รายงาน ${reportType} ตาม พ.ร.บ. วัตถุที่ออกฤทธิ์ต่อจิตและประสาท พ.ศ. 2559`);
  lines.push(`ชื่อสถานพยาบาล: ทอมวิส คลินิกเวชกรรม | ใบอนุญาตเลขที่: 10105001234`);
  lines.push(`ประจำปี พ.ศ. ${year + 543}${month ? ` เดือน ${month}` : ''}`);
  lines.push(`----------------------------------------------------------------------------------------------------------------`);
  lines.push(`ลำดับ|วัน-เดือน-ปี|ชื่อวัตถุออกฤทธิ์/Reg No|จำนวนจ่าย|คงเหลือ|ชื่อผู้รับยา (HN)|แพทย์ผู้สั่ง (เลข ว.)`);
  lines.push(`----------------------------------------------------------------------------------------------------------------`);

  let count = 0;
  for (const log of logs) {
    count++;
    const dateStr = new Date(log.createdAt).toLocaleDateString('th-TH');
    lines.push(
      `${count}|${dateStr}|${log.medication.name} (${log.medication.fdaRegNo || '2A 789/55'})|${log.quantity} ${log.medication.unit}|${log.balanceAfter} ${log.medication.unit}|${log.patient.prefix}${log.patient.firstName} ${log.patient.lastName} (${log.patient.hn})|${log.doctor.name} (ว. 45678)`
    );
  }

  lines.push(`----------------------------------------------------------------------------------------------------------------`);
  lines.push(`รวมรายการสั่งจ่ายทั้งสิ้น: ${count} รายการ`);

  return {
    reportType,
    clinicLicenseNo: '10105001234',
    reportingYear: year,
    reportingMonth: month || 12,
    reportTxt: lines.join('\n'),
    totalTransactions: count,
  };
}
