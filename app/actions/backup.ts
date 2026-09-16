'use server';

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { logAudit } from '@/lib/security/audit';

export interface BackupMetadata {
  fileName: string;
  createdAt: string;
  sizeBytes: number;
  sha256: string;
  status: string;
}

/**
 * Execute Clinic Daily Closing Backup Action
 */
export async function createClinicBackupAction(): Promise<{ success: boolean; metadata?: BackupMetadata; error?: string }> {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath)) {
      return { success: false, error: 'ไม่พบไฟล์ฐานข้อมูลสำหรับสำรองข้อมูล' };
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const backupFileName = `tomvis_clinic_backup_${dateStr}_${timeStr}.db`;
    const destPath = path.join(backupDir, backupFileName);

    // Copy DB file
    fs.copyFileSync(dbPath, destPath);

    // Calculate SHA-256
    const fileBuffer = fs.readFileSync(destPath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const sha256Hash = hashSum.digest('hex');

    const metadata: BackupMetadata = {
      fileName: backupFileName,
      createdAt: now.toISOString(),
      sizeBytes: fs.statSync(destPath).size,
      sha256: sha256Hash,
      status: 'VERIFIED',
    };

    fs.writeFileSync(path.join(backupDir, `${backupFileName}.json`), JSON.stringify(metadata, null, 2));

    await logAudit({
      userId: 'admin-user',
      action: 'DAILY_CLINIC_CLOSING_BACKUP',
      resource: `Backup:${backupFileName}`,
      details: { sizeBytes: metadata.sizeBytes, sha256: sha256Hash },
    });

    return { success: true, metadata };
  } catch (error: any) {
    console.error('Error executing backup:', error);
    return { success: false, error: 'เกิดข้อผิดพลาดในการสำรองข้อมูล' };
  }
}

/**
 * List all available backups
 */
export async function getBackupsListAction(): Promise<{ success: boolean; backups?: BackupMetadata[]; error?: string }> {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    if (!fs.existsSync(backupDir)) {
      return { success: true, backups: [] };
    }

    const files = fs.readdirSync(backupDir);
    const metadataFiles = files.filter((f) => f.endsWith('.json'));

    const backups: BackupMetadata[] = metadataFiles.map((file) => {
      const content = fs.readFileSync(path.join(backupDir, file), 'utf8');
      return JSON.parse(content);
    });

    // Sort newest first
    backups.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return { success: true, backups };
  } catch (error: any) {
    console.error('Error fetching backups list:', error);
    return { success: false, error: 'ไม่สามารถดึงรายการสำรองข้อมูลได้' };
  }
}

/**
 * Restore system database from a selected backup
 */
export async function restoreClinicBackupAction(backupFileName: string): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const backupDir = path.join(process.cwd(), 'backups');
    const backupPath = path.join(backupDir, backupFileName);
    const metaPath = path.join(backupDir, `${backupFileName}.json`);
    const dbPath = path.join(process.cwd(), 'prisma', 'dev.db');

    if (!fs.existsSync(backupPath)) {
      return { success: false, error: 'ไม่พบไฟล์สำรองข้อมูลที่ระบุ' };
    }

    // SHA-256 verification
    if (fs.existsSync(metaPath)) {
      const metadata: BackupMetadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const fileBuffer = fs.readFileSync(backupPath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const calculatedHash = hashSum.digest('hex');

      if (calculatedHash !== metadata.sha256) {
        return { success: false, error: 'ไฟล์สำรองข้อมูลชำรุดเสียหาย (Checksum Mismatch)' };
      }
    }

    // Safety pre-restore snapshot
    const safetyFileName = `pre_restore_safety_${Date.now()}.db`;
    fs.copyFileSync(dbPath, path.join(backupDir, safetyFileName));

    // Overwrite DB
    fs.copyFileSync(backupPath, dbPath);

    await logAudit({
      userId: 'admin-user',
      action: 'RESTORE_DATABASE',
      resource: `Backup:${backupFileName}`,
      details: { safetySnapshot: safetyFileName },
    });

    return { success: true, message: `กู้คืนข้อมูลจากชุดสำรอง ${backupFileName} สำเร็จแล้ว` };
  } catch (error: any) {
    console.error('Error restoring database:', error);
    return { success: false, error: 'ไม่สามารถกู้คืนข้อมูลได้' };
  }
}
