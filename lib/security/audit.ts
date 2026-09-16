import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditAction =
  | 'VIEW_PATIENT_RECORD'
  | 'CREATE_PATIENT'
  | 'UPDATE_PATIENT'
  | 'RECORD_VITALS'
  | 'DOCTOR_CONSULTATION'
  | 'DELETE_PATIENT_REQUEST'
  | 'CREATE_PRESCRIPTION'
  | 'DISPENSE_MEDICATION'
  | 'CREATE_INVOICE'
  | 'COLLECT_PAYMENT'
  | 'PROCESS_PAYMENT'
  | 'EXPORT_PDPA_DATA'
  | 'REQUEST_DATA_ERASURE'
  | 'VIEW_MEDICAL_REPORT'
  | (string & {});

export interface AuditLogParams {
  userId: string;
  action: AuditAction;
  resource: string;
  ipAddress?: string;
  details?: Record<string, unknown>;
}

/**
 * Log all Patient Health Information (PHI) access for PDPA Compliance
 */
export async function logAudit({
  userId,
  action,
  resource,
  ipAddress = '127.0.0.1',
  details,
}: AuditLogParams) {
  try {
    let validUserId = userId;

    // Check if user exists, otherwise fallback to admin/system user
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      let systemUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
      });

      if (!systemUser) {
        systemUser = await prisma.user.create({
          data: {
            id: userId,
            email: `audit.${Date.now()}@klinik.local`,
            name: 'System Audit User',
            passwordHash: 'hash',
            role: 'ADMIN',
          },
        });
      }
      validUserId = systemUser.id;
    }

    const log = await prisma.auditLog.create({
      data: {
        userId: validUserId,
        action,
        resource,
        ipAddress,
        details: details ? JSON.stringify(details) : undefined,
      },
    });
    return log;
  } catch (error) {
    console.error('Failed to record PDPA audit log:', error);
    return null;
  }
}
