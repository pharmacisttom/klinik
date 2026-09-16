import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';

function getEncryptionKey(): Buffer {
  const envKey = process.env.DATA_ENCRYPTION_KEY;
  if (!envKey) {
    // Default fallback 32-byte key for local dev environment
    return Buffer.from('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef', 'hex');
  }
  return Buffer.from(envKey, 'hex');
}

/**
 * Encrypt sensitive patient field values at rest using AES-256-GCM
 */
export function encryptData(text: string): string {
  if (!text) return text;
  const key = getEncryptionKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');

  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

/**
 * Decrypt sensitive patient field values
 */
export function decryptData(cipherText: string): string {
  if (!cipherText || !cipherText.includes(':')) return cipherText;

  try {
    const key = getEncryptionKey();
    const [ivHex, authTagHex, encryptedText] = cipherText.split(':');

    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('Decryption error:', err);
    return '[Encrypted Data - Decryption Failed]';
  }
}
