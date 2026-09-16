const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Database Restore Helper for Tomvis Clinic
 */
async function runRestore(backupFileName) {
  try {
    const backupDir = path.join(__dirname, '..', 'backups');
    const backupPath = path.join(backupDir, backupFileName);
    const metaPath = path.join(backupDir, `${backupFileName}.json`);
    const dbPath = path.join(__dirname, '..', 'prisma', 'dev.db');

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file ${backupFileName} not found.`);
    }

    // Verify SHA-256 Checksum if metadata exists
    if (fs.existsSync(metaPath)) {
      const metadata = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      const fileBuffer = fs.readFileSync(backupPath);
      const hashSum = crypto.createHash('sha256');
      hashSum.update(fileBuffer);
      const calculatedHash = hashSum.digest('hex');

      if (calculatedHash !== metadata.sha256) {
        throw new Error('BACKUP INTEGRITY CORRUPTED: SHA-256 checksum mismatch!');
      }
    }

    // Step 1: Create a safety pre-restore checkpoint of current DB
    const safetyFileName = `pre_restore_safety_${Date.now()}.db`;
    fs.copyFileSync(dbPath, path.join(backupDir, safetyFileName));

    // Step 2: Overwrite target DB with backup file
    fs.copyFileSync(backupPath, dbPath);

    console.log(`✅ [RESTORE SUCCESSFUL] Restored database from ${backupFileName}`);
    console.log(`Safety snapshot created at ${safetyFileName}`);
    return { success: true, restoredFrom: backupFileName, safetySnapshot: safetyFileName };
  } catch (error) {
    console.error('❌ [RESTORE FAILED]:', error);
    throw error;
  }
}

if (require.main === module) {
  const fileArg = process.argv[2];
  if (!fileArg) {
    console.error('Usage: node scripts/restore-database.js <backupFileName>');
    process.exit(1);
  }
  runRestore(fileArg);
}

module.exports = { runRestore };
