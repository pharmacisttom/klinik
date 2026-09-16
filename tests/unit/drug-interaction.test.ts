import { describe, it, expect } from 'vitest';
import { calculatePediatricDose } from '@/lib/clinical/drug-interaction';

describe('Clinical Safety: Pediatric Dose Calculator', () => {
  it('should accurately calculate mg/kg pediatric single dose and ml volume', () => {
    // Child weight = 10kg, Paracetamol target 10mg/kg/day, divided into 4 doses (qid), syrup 120mg/5ml (24mg/ml)
    const res = calculatePediatricDose({
      weightKg: 10,
      targetMgPerKgDay: 40, // 40mg/kg/day total
      dosesPerDay: 4,       // qid -> 100mg per dose
      concentrationMgPerMl: 24, // 120mg/5ml
    });

    expect(res.totalDailyMg).toBe(400);
    expect(res.singleDoseMg).toBe(100);
    expect(res.singleDoseMl).toBe(4.2);
  });
});
