export interface NaranjoQuestions {
  q1_previousReports: boolean;
  q2_appearedAfterDrug: boolean;
  q3_improvedOnWithdrawal: boolean;
  q4_reappearedOnReexposure: boolean;
  q5_alternativeCauses: boolean;
  q6_placeboResponse: boolean;
  q7_toxicConcentration: boolean;
  q8_doseProportionality: boolean;
  q9_similarReactionHistory: boolean;
  q10_objectiveConfirmation: boolean;
}

/**
 * Pure Naranjo Algorithm Causality Score Calculator
 */
export function calculateNaranjoScore(q: NaranjoQuestions): { score: number; causality: string } {
  let score = 0;
  if (q.q1_previousReports) score += 1;
  if (q.q2_appearedAfterDrug) score += 2;
  if (q.q3_improvedOnWithdrawal) score += 1;
  if (q.q4_reappearedOnReexposure) score += 2;
  if (!q.q5_alternativeCauses) score += 2; else score -= 1;
  if (q.q6_placeboResponse) score -= 1;
  if (q.q7_toxicConcentration) score += 1;
  if (q.q8_doseProportionality) score += 1;
  if (q.q9_similarReactionHistory) score += 1;
  if (q.q10_objectiveConfirmation) score += 1;

  let causality = 'DOUBTFUL';
  if (score >= 9) causality = 'DEFINITE';
  else if (score >= 5) causality = 'PROBABLE';
  else if (score >= 1) causality = 'POSSIBLE';

  return { score, causality };
}
