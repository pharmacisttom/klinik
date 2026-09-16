import { describe, it, expect } from 'vitest';
import { maskNationalId, maskPhone, maskEmail } from '@/lib/security/masking';

describe('Security & PDPA: PHI Field-Level Data Masking', () => {
  it('should obscure Thai National ID to prevent visual PHI exposure', () => {
    const masked = maskNationalId('1100400123450');
    expect(masked).toBe('11004****3450');
  });

  it('should obscure Phone Number to prevent visual PHI exposure', () => {
    const masked = maskPhone('0812345678');
    expect(masked).toBe('081-***-5678');
  });

  it('should obscure Email Address to prevent visual PHI exposure', () => {
    const masked = maskEmail('doctor.somchai@klinik.local');
    expect(masked).toBe('d***i@klinik.local');
  });
});
