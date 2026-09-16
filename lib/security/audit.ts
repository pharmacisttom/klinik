import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type AuditAction =
  | 'VIEW_PATIENT_RECORD'
  | 'CREATE_PATIENT'
  | 'UPDATE_PATIENT'
  | 'DELETE_PATIENT_REQUEST'
  | 'CREATE_PRESCRIPTION'
  | 'DISPENSE_MEDICATION'
  | 'CREATE_INVOICE'
  | 'PROCESS_PAYMENT'
  | 'EXPORT_PDPA_DATA'
  | 'VIEW_MEDICAL_REPORT';

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
    const log = await prisma.auditLog.create({
      data: {
        userId,
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
