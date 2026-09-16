import { describe, it, expect } from 'vitest';
import { validateThaiNationalID } from '../../lib/utils/thai-id';
import { generateHN, validateHNFormat } from '../../lib/utils/hn-generator';
import { formatTHB, formatThaiDate } from '../../lib/utils/formatters';

describe('Utility Functions Unit Tests', () => {
  describe('Thai National ID Validator', () => {
    it('should validate correct 13-digit Thai ID checksum', () => {
      // Valid test ID with correct checksum (check digit 0)
      expect(validateThaiNationalID('1100400123450')).toBe(true);
    });

    it('should reject invalid 13-digit Thai ID checksum', () => {
      expect(validateThaiNationalID('1100400123457')).toBe(false);
    });

    it('should reject non-13 digit strings or invalid input', () => {
      expect(validateThaiNationalID('123')).toBe(false);
      expect(validateThaiNationalID('11004001234567')).toBe(false);
      expect(validateThaiNationalID('abc1234567890')).toBe(false);
    });
  });

  describe('HN Generator & Formatter', () => {
    it('should generate HN with correct pattern HN-YYMMDD-XXXX', () => {
      const mockDate = new Date('2026-09-16'); // 2569 BE
      const hn = generateHN(1, mockDate);
      expect(hn).toBe('HN-690916-0001');
      expect(validateHNFormat(hn)).toBe(true);
    });

    it('should pad sequence number correctly', () => {
      const mockDate = new Date('2026-09-16');
      const hn = generateHN(42, mockDate);
      expect(hn).toBe('HN-690916-0042');
    });
  });

  describe('Date & Currency Formatters', () => {
    it('should format THB currency correctly', () => {
      expect(formatTHB(1250.5)).toContain('1,250.50');
    });

    it('should format Thai Buddhist Era date string', () => {
      const date = new Date('2026-09-16');
      const formatted = formatThaiDate(date);
      expect(formatted).toContain('2569');
      expect(formatted).toContain('ก.ย.');
    });
  });
});
