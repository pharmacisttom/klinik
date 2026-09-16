import { describe, it, expect, beforeEach } from 'vitest';
import { checkDrugAllergies } from '@/lib/clinical/allergy-check';
import { prisma } from '@/lib/prisma';

describe('Clinical Safety: Drug Allergy Hard-Stop Engine', () => {
  let samplePatientId: string;
  let amoxMedId: string;
  let paraMedId: string;

  beforeEach(async () => {
    const patient = await prisma.patient.findFirst({
      where: { hn: 'HN-690916-0001' },
    });
    if (patient) {
      samplePatientId = patient.id;
    }

    const amox = await prisma.medication.findFirst({
      where: { code: 'MED-AMOX-500' },
    });
    if (amox) {
      amoxMedId = amox.id;
    }

    const para = await prisma.medication.findFirst({
      where: { code: 'MED-PARA-500' },
    });
    if (para) {
      paraMedId = para.id;
    }
  });

  it('should trigger a Hard-Stop when prescribing Amoxicillin to a Penicillin allergic patient', async () => {
    if (!samplePatientId || !amoxMedId) return;

    const result = await checkDrugAllergies(samplePatientId, [amoxMedId]);
    expect(result.isSafe).toBe(false);
    expect(result.hardStops.length).toBeGreaterThan(0);
    expect(result.hardStops[0]).toContain('HARD-STOP');
  });

  it('should allow prescribing Paracetamol to a Penicillin allergic patient safely', async () => {
    if (!samplePatientId || !paraMedId) return;

    const result = await checkDrugAllergies(samplePatientId, [paraMedId]);
    expect(result.isSafe).toBe(true);
    expect(result.hardStops.length).toBe(0);
  });
});
