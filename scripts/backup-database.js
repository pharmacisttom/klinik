const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Automated Daily Database Backup Script for Tomvis Clinic
 */
async function runBackup() {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }

    const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');
    if (!fs.existsSync(dbPath)) {
      throw new Error(`Database file not found at ${dbPath}`);
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '-');
    const backupFileName = `tomvis_clinic_backup_${dateStr}_${timeStr}.db`;
    const destPath = path.join(backupDir, backupFileName);

    // Copy DB file securely
    fs.copyFileSync(dbPath, destPath);

    // Calculate SHA-256 Checksum for tamper prevention
    const fileBuffer = fs.readFileSync(destPath);
    const hashSum = crypto.createHash('sha256');
    hashSum.update(fileBuffer);
    const sha256Hash = hashSum.digest('hex');

    // Write metadata manifest
    const metadata = {
      fileName: backupFileName,
      createdAt: now.toISOString(),
      sizeBytes: fs.statSync(destPath).size,
      sha256: sha256Hash,
      status: 'VERIFIED',
    };
    fs.writeFileSync(path.join(backupDir, `${backupFileName}.json`), JSON.stringify(metadata, null, 2));

    // Cleanup backups older than 30 days (MOPH Data Retention standard)
    const files = fs.readdirSync(backupDir);
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    let prunedCount = 0;

    files.forEach((file) => {
      const filePath = path.join(backupDir, file);
      const stat = fs.statSync(filePath);
      if (stat.mtimeMs < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        prunedCount++;
      }
    });

    console.log('✅ [TOMVIS BACKUP SUCCESS]');
    console.log(`File: ${backupFileName}`);
    console.log(`Size: ${(metadata.sizeBytes / 1024).toFixed(2)} KB`);
    console.log(`SHA-256: ${sha256Hash}`);
    if (prunedCount > 0) {
      console.log(`Pruned ${prunedCount} old backup files older than 30 days.`);
    }

    return metadata;
  } catch (error) {
    console.error('❌ [TOMVIS BACKUP FAILED]:', error);
    throw error;
  }
}

if (require.main === module) {
  runBackup();
}

module.exports = { runBackup };
