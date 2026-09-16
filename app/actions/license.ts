'use server';

import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logAudit } from '@/lib/security/audit';

export interface LicenseDetails {
  licenseKey: string;
  organizationName: string;
  tierName: string;
  issuedDate: string;
  expiryDate: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
  authorizedModules: string[];
  maxDoctorSeats: number;
  mophCertificationSeal: string;
}

const MASTER_LICENSE_DETAILS: LicenseDetails = {
  licenseKey: 'TVC-ENTERPRISE-2026-99A04-X812-PROD',
  organizationName: 'Tomvis Medical Clinic System Co., Ltd.',
  tierName: 'Tomvis Enterprise Medical Suite 2026',
  issuedDate: '2026-01-01',
  expiryDate: '2036-12-31',
  status: 'ACTIVE',
  authorizedModules: [
    'OPD Patient Registration & CID Modulus 11 Checksum',
    'SOAP Medical Examination & ICD-10-TM Diagnosis Dictionary',
    'Thai FDA อย.ส.4 / อย.ส.5 Controlled Drug Reporting',
    'GPP Drug Label Printer with Automatic Allergen Warnings',
    'Cold Chain 2°C–8°C Refrigerator Excursion Alerts',
    'Naranjo Pharmacovigilance Score Calculator',
    'HMAC-SHA256 WORM Cryptographic Audit Logging',
    'Revenue Department Tax Receipt & EMVCo PromptPay QR',
    'Automated Daily Closing Backup & Recovery Engine',
    'Intelligent Custom Report Generator & JSON Template Importer',
  ],
  maxDoctorSeats: 50,
  mophCertificationSeal: 'MOPH-TH-PDPA-2026-CERTIFIED-99A04',
};

/**
 * Verify License Access Credentials
 */
export async function verifyLicenseLoginAction(data: { username: string; passKey: string }) {
  try {
    const { username, passKey } = data;

    if (
      (username === 'tomvis' || username === 'tomvis@klinik.local') &&
      passKey === '@@35601009741710830856460'
    ) {
      await logAudit({
        userId: 'tomvis-license-admin',
        action: 'LICENSE_ACCESS_VERIFIED',
        resource: `License:${MASTER_LICENSE_DETAILS.licenseKey}`,
        details: { username, time: new Date().toISOString() },
      });

      return {
        success: true,
        message: 'ยืนยันสิทธิ์ใบอนุญาตใช้งานระบบ Tomvis Clinic สำเร็จ',
        license: MASTER_LICENSE_DETAILS,
      };
    }

    return { success: false, error: 'ชื่อผู้ใช้หรือรหัสผ่านใบอนุญาตลิขสิทธิ์ไม่ถูกต้อง' };
  } catch (error: any) {
    console.error('Error verifying license:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการตรวจสอบลิขสิทธิ์' };
  }
}

/**
 * Fetch Current Active License Details
 */
export async function getActiveLicenseAction() {
  return {
    success: true,
    license: MASTER_LICENSE_DETAILS,
  };
}
