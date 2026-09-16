import { describe, it, expect, beforeEach } from 'vitest';
import { mergeDuplicatePatientsAction } from '@/app/actions/patient';
import { prisma } from '@/lib/prisma';

describe('Patient Registration: Duplicate Patient Merge Utility', () => {
  let primaryHn: string;
  let secondaryHn: string;

  beforeEach(async () => {
    // Create primary patient
    const p1 = await prisma.patient.create({
      data: {
        hn: `HN-TEST-PRIMARY-${Date.now()}`,
        nationalId: `11004${Math.floor(10000000 + Math.random() * 9000000)}`,
        prefix: 'นาย',
        firstName: 'สมชาย',
        lastName: 'หลัก',
        dateOfBirth: new Date('1985-01-01'),
        gender: 'MALE',
        phone: '0811112222',
        address: 'กรุงเทพฯ',
      },
    });
    primaryHn = p1.hn;

    // Create secondary duplicate patient
    const p2 = await prisma.patient.create({
      data: {
        hn: `HN-TEST-DUP-${Date.now()}`,
        nationalId: `11004${Math.floor(10000000 + Math.random() * 9000000)}`,
        prefix: 'นาย',
        firstName: 'สมชาย',
        lastName: 'ซ้ำ',
        dateOfBirth: new Date('1985-01-01'),
        gender: 'MALE',
        phone: '0811112222',
        address: 'กรุงเทพฯ',
      },
    });
    secondaryHn = p2.hn;
  });

  it('should successfully merge secondary patient record into primary patient', async () => {
    const res = await mergeDuplicatePatientsAction(primaryHn, secondaryHn);
    expect(res.success).toBe(true);

    const secondaryUpdated = await prisma.patient.findUnique({
      where: { hn: secondaryHn },
    });
    expect(secondaryUpdated?.isArchived).toBe(true);
    expect(secondaryUpdated?.archivedReason).toContain(primaryHn);
  });
});
