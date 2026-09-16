import { describe, it, expect } from 'vitest';
import { calculateNaranjoScore } from '@/lib/clinical/naranjo-calculator';

describe('Pharmacy Safety: Naranjo ADR Causality Algorithm', () => {
  it('should calculate PROBABLE causality when Naranjo score is between 5 and 8', () => {
    const res = calculateNaranjoScore({
      q1_previousReports: true,      // +1
      q2_appearedAfterDrug: true,     // +2
      q3_improvedOnWithdrawal: true, // +1
      q4_reappearedOnReexposure: false, // 0
      q5_alternativeCauses: false,   // +2
      q6_placeboResponse: false,     // 0
      q7_toxicConcentration: false,  // 0
      q8_doseProportionality: false, // 0
      q9_similarReactionHistory: false, // 0
      q10_objectiveConfirmation: false, // 0
    });

    expect(res.score).toBe(6);
    expect(res.causality).toBe('PROBABLE');
  });

  it('should calculate DEFINITE causality when Naranjo score is >= 9', () => {
    const res = calculateNaranjoScore({
      q1_previousReports: true,      // +1
      q2_appearedAfterDrug: true,     // +2
      q3_improvedOnWithdrawal: true, // +1
      q4_reappearedOnReexposure: true, // +2
      q5_alternativeCauses: false,   // +2
      q6_placeboResponse: false,     // 0
      q7_toxicConcentration: true,   // +1
      q8_doseProportionality: false, // 0
      q9_similarReactionHistory: false, // 0
      q10_objectiveConfirmation: false, // 0
    });

    expect(res.score).toBe(9);
    expect(res.causality).toBe('DEFINITE');
  });
});
