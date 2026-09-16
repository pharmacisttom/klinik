interface FailedAttemptRecord {
  count: number;
  lockoutUntil: number | null;
}

const FAILED_ATTEMPTS = new Map<string, FailedAttemptRecord>();
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 Minutes Lockout (NIST SP 800-63B)

export function recordFailedLogin(identifier: string): { isLocked: boolean; remainingAttempts: number } {
  const now = Date.now();
  const record = FAILED_ATTEMPTS.get(identifier) || { count: 0, lockoutUntil: null };

  if (record.lockoutUntil && now < record.lockoutUntil) {
    return { isLocked: true, remainingAttempts: 0 };
  }

  record.count += 1;

  if (record.count >= MAX_FAILED_ATTEMPTS) {
    record.lockoutUntil = now + LOCKOUT_DURATION_MS;
    FAILED_ATTEMPTS.set(identifier, record);
    return { isLocked: true, remainingAttempts: 0 };
  }

  FAILED_ATTEMPTS.set(identifier, record);
  return { isLocked: false, remainingAttempts: MAX_FAILED_ATTEMPTS - record.count };
}

export function resetFailedLogin(identifier: string) {
  FAILED_ATTEMPTS.delete(identifier);
}

export function isAccountLocked(identifier: string): boolean {
  const record = FAILED_ATTEMPTS.get(identifier);
  if (!record || !record.lockoutUntil) return false;

  if (Date.now() > record.lockoutUntil) {
    FAILED_ATTEMPTS.delete(identifier);
    return false;
  }
  return true;
}
