import { prisma } from '@/lib/prisma';

export interface ReportColumnConfig {
  field: string;
  label: string;
  transform?: 'DATE_TH' | 'CURRENCY' | 'MASK_CID' | 'MASK_PHONE' | 'JSON_PARSE' | 'UPPERCASE';
}

export interface ReportFilterConfig {
  startDate?: string;
  endDate?: string;
  status?: string;
  category?: string;
  searchTerm?: string;
}

export interface ReportTemplateDefinition {
  id: string;
  name: string;
  description: string;
  entity: 'PATIENT' | 'APPOINTMENT' | 'PRESCRIPTION' | 'INVOICE' | 'CONTROLLED_DRUG' | 'COLD_CHAIN' | 'NCD_REGISTRY';
  columns: ReportColumnConfig[];
  defaultFilters?: ReportFilterConfig;
}

/**
 * Intelligent Standard Healthcare Report Templates
 */
export class StandardReportTemplates {
  static FDA_SCHEDULE_4_5: ReportTemplateDefinition = {
    id: 'fda-schedule-4-5',
    name: 'รายงานสรุปการจ่ายวัตถุออกฤทธิ์ฯ (อย.ส.4 / อย.ส.5)',
    description: 'รายงานประจำเดือนสำหรับส่งสำนักงานคณะกรรมการอาหารและยา (อย.)',
    entity: 'CONTROLLED_DRUG',
    columns: [
      { field: 'createdAt', label: 'วันที่/เวลาจ่ายยา', transform: 'DATE_TH' },
      { field: 'medication.name', label: 'ชื่อยาและขนาดบรรจุ' },
      { field: 'medication.controlCategory', label: 'ประเภทวัตถุออกฤทธิ์' },
      { field: 'patient.hn', label: 'HN ผู้ป่วย' },
      { field: 'patient.nationalId', label: 'เลขบัตรประชาชนผู้รับยา', transform: 'MASK_CID' },
      { field: 'quantity', label: 'จำนวนที่จ่าย' },
      { field: 'balanceAfter', label: 'คงเหลือยกไป' },
      { field: 'doctor.name', label: 'แพทย์ผู้สั่งจ่าย' },
    ],
  };

  static NCD_CHRONIC_CONTROL: ReportTemplateDefinition = {
    id: 'ncd-chronic-control',
    name: 'รายงานติดตามผู้ป่วยโรคเรื้อรัง (DM/HT Registry Report)',
    description: 'รายงานสรุปผลการควบคุมระดับน้ำตาล HbA1c และความดันโลหิต',
    entity: 'NCD_REGISTRY',
    columns: [
      { field: 'patient.hn', label: 'HN' },
      { field: 'patient.firstName', label: 'ชื่อผู้ป่วย' },
      { field: 'patient.lastName', label: 'นามสกุล' },
      { field: 'diseaseCode', label: 'รหัสโรค (ICD-10-TM)' },
      { field: 'diseaseName', label: 'ชื่อโรค' },
      { field: 'lastHbA1cVal', label: 'ระดับ HbA1c ล่าสุด (%)' },
      { field: 'lastEgfrVal', label: 'ค่า eGFR (mL/min)' },
      { field: 'nextDueDate', label: 'วันนัดติดตามครั้งถัดไป', transform: 'DATE_TH' },
    ],
  };

  static REVENUE_TAX_SUMMARY: ReportTemplateDefinition = {
    id: 'revenue-tax-summary',
    name: 'รายงานภาษีและรายรับประจำวัน (Revenue Dept Tax Summary)',
    description: 'รายงานแสดงรายรับแยกค่ารักษาพยาบาล (ยกเว้น VAT) และเวชสำอาง (7% VAT)',
    entity: 'INVOICE',
    columns: [
      { field: 'createdAt', label: 'วันที่ออกใบเสร็จ', transform: 'DATE_TH' },
      { field: 'invoiceNumber', label: 'เลขที่ใบแจ้งชำระเงิน' },
      { field: 'patient.hn', label: 'HN ผู้ป่วย' },
      { field: 'netAmount', label: 'จำนวนเงินรวม (บาท)', transform: 'CURRENCY' },
      { field: 'paymentMethod', label: 'ช่องทางชำระเงิน' },
      { field: 'status', label: 'สถานะการชำระ' },
    ],
  };
}

/**
 * Intelligent Custom Report Generation Algorithm
 */
export async function buildCustomReport(entity: string, columns: ReportColumnConfig[], filters: ReportFilterConfig) {
  let rawData: any[] = [];

  const dateWhere: any = {};
  if (filters.startDate) dateWhere.gte = new Date(filters.startDate);
  if (filters.endDate) dateWhere.lte = new Date(filters.endDate);

  switch (entity) {
    case 'PATIENT':
      rawData = await prisma.patient.findMany({
        where: filters.startDate || filters.endDate ? { createdAt: dateWhere } : {},
        orderBy: { createdAt: 'desc' },
      });
      break;

    case 'APPOINTMENT':
      rawData = await prisma.appointment.findMany({
        where: filters.startDate || filters.endDate ? { scheduledAt: dateWhere } : {},
        include: { patient: true, doctor: true },
        orderBy: { scheduledAt: 'desc' },
      });
      break;

    case 'INVOICE':
      rawData = await prisma.invoice.findMany({
        where: filters.startDate || filters.endDate ? { createdAt: dateWhere } : {},
        include: { patient: true },
        orderBy: { createdAt: 'desc' },
      });
      break;

    case 'CONTROLLED_DRUG':
      rawData = await prisma.controlledDrugLog.findMany({
        where: filters.startDate || filters.endDate ? { createdAt: dateWhere } : {},
        include: { patient: true, doctor: true, medication: true },
        orderBy: { createdAt: 'desc' },
      });
      break;

    case 'NCD_REGISTRY':
      rawData = await prisma.chronicRegistry.findMany({
        include: { patient: true },
        orderBy: { diagnosedAt: 'desc' },
      });
      break;

    case 'COLD_CHAIN':
      rawData = await prisma.coldChainLog.findMany({
        where: filters.startDate || filters.endDate ? { checkedAt: dateWhere } : {},
        orderBy: { checkedAt: 'desc' },
      });
      break;

    default:
      rawData = [];
  }

  // Transform and extract selected dynamic columns
  const reportRows = rawData.map((row) => {
    const formattedRow: Record<string, any> = {};

    columns.forEach((col) => {
      let rawVal = getNestedProperty(row, col.field);

      if (col.transform) {
        switch (col.transform) {
          case 'DATE_TH':
            rawVal = rawVal ? new Date(rawVal).toLocaleDateString('th-TH') : '-';
            break;
          case 'CURRENCY':
            rawVal = typeof rawVal === 'number' ? rawVal.toLocaleString('th-TH', { minimumFractionDigits: 2 }) : '0.00';
            break;
          case 'MASK_CID':
            rawVal = rawVal ? `${rawVal.slice(0, 5)}****${rawVal.slice(-4)}` : '-';
            break;
          case 'MASK_PHONE':
            rawVal = rawVal ? `${rawVal.slice(0, 3)}-***-${rawVal.slice(-4)}` : '-';
            break;
          case 'UPPERCASE':
            rawVal = rawVal ? String(rawVal).toUpperCase() : '';
            break;
        }
      }

      formattedRow[col.label] = rawVal ?? '-';
    });

    return formattedRow;
  });

  return reportRows;
}

function getNestedProperty(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => (prev && prev[curr] !== undefined ? prev[curr] : undefined), obj);
}
