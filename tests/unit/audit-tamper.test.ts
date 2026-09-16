import { describe, it, expect } from 'vitest';
import { computeTamperHash } from '@/lib/security/audit';

describe('Security & PDPA: Cryptographic WORM Audit Trail Immutability', () => {
  it('should generate consistent HMAC-SHA256 tamperHash for an audit entry', () => {
    const timestamp = '2026-09-16T21:00:00.000Z';
    const hash1 = computeTamperHash({
      userId: 'doc-123',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient:HN-001',
      detailsStr: '{"reason":"treatment"}',
      timestamp,
    });

    const hash2 = computeTamperHash({
      userId: 'doc-123',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient:HN-001',
      detailsStr: '{"reason":"treatment"}',
      timestamp,
    });

    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(64); // SHA-256 hex string length
  });

  it('should detect tampering when audit entry fields are modified', () => {
    const timestamp = '2026-09-16T21:00:00.000Z';
    const originalHash = computeTamperHash({
      userId: 'doc-123',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient:HN-001',
      detailsStr: '{"reason":"treatment"}',
      timestamp,
    });

    const tamperedHash = computeTamperHash({
      userId: 'doc-123',
      action: 'DELETE_PATIENT_RECORD', // Tampered action!
      resource: 'Patient:HN-001',
      detailsStr: '{"reason":"treatment"}',
      timestamp,
    });

    expect(originalHash).not.toBe(tamperedHash);
  });
});
