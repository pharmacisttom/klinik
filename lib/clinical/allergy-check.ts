import { prisma } from '@/lib/prisma';

export interface AllergyCheckResult {
  isSafe: boolean;
  warnings: string[];
  hardStops: string[];
}

/**
 * Known drug family cross-reactivity mapping
 */
const DRUG_FAMILY_MAPPING: Record<string, string[]> = {
  PENICILLIN: ['AMOXICILLIN', 'AMPICILLIN', 'AUGMENTIN', 'PENICILLIN', 'AMOXICILLIN TRIHYDRATE'],
  CEPHALOSPORIN: ['CEFALEXIN', 'CEFTRIAXONE', 'CEFIXIME', 'CEFAZOLIN'],
  NSAID: ['IBUPROFEN', 'NAPROXEN', 'MEFENAMIC ACID', 'DICLOFENAC', 'CELECOXIB'],
  SULFONAMIDE: ['CO-TRIMOXAZOLE', 'SULFAGUANIDINE', 'SULFAMETHOXAZOLE'],
  ASPIRIN: ['ASPIRIN', 'ACETYLSALICYLIC ACID'],
};

/**
 * Checks a patient's recorded allergies against a list of proposed medications.
 * Returns hardStops if a severe allergy conflict or cross-allergy family conflict is detected.
 */
export async function checkDrugAllergies(
  patientId: string,
  medicationIds: string[]
): Promise<AllergyCheckResult> {
  const patient = await prisma.patient.findUnique({
    where: { id: patientId },
    select: { allergies: true, firstName: true, lastName: true },
  });

  if (!patient || !patient.allergies) {
    return { isSafe: true, warnings: [], hardStops: [] };
  }

  let patientAllergies: string[] = [];
  try {
    patientAllergies = JSON.parse(patient.allergies);
  } catch (e) {
    patientAllergies = [patient.allergies];
  }

  if (!Array.isArray(patientAllergies) || patientAllergies.length === 0) {
    return { isSafe: true, warnings: [], hardStops: [] };
  }

  const normalizedPatientAllergies = patientAllergies.map((a) => a.trim().toUpperCase());

  const medications = await prisma.medication.findMany({
    where: { id: { in: medicationIds } },
    select: { id: true, name: true, genericName: true, drugClass: true },
  });

  const warnings: string[] = [];
  const hardStops: string[] = [];

  for (const med of medications) {
    const medNameUpper = med.name.toUpperCase();
    const genericUpper = med.genericName.toUpperCase();
    const classUpper = (med.drugClass || '').toUpperCase();

    for (const allergy of normalizedPatientAllergies) {
      // Direct exact or partial match with Name or Generic Name
      if (
        medNameUpper.includes(allergy) ||
        genericUpper.includes(allergy) ||
        allergy.includes(medNameUpper) ||
        allergy.includes(genericUpper)
      ) {
        hardStops.push(
          `⚠️ HARD-STOP: ผู้ป่วยมีประวัติแพ้ยา ${allergy} ห้ามจ่ายยา ${med.name} (${med.genericName}) โดยเด็ดขาด!`
        );
        continue;
      }

      // Cross-allergy Family match (e.g. Patient allergic to Penicillin -> Block Amoxicillin)
      const family = DRUG_FAMILY_MAPPING[allergy] || [];
      if (
        family.includes(medNameUpper) ||
        family.includes(genericUpper) ||
        classUpper === allergy ||
        (allergy === 'PENICILLIN' && classUpper === 'PENICILLIN')
      ) {
        hardStops.push(
          `🛑 CROSS-ALLERGY HARD-STOP: ผู้ป่วยแพ้ยากลุ่ม ${allergy} ตรวจพบความเสี่ยงสูงกับยา ${med.name} (ยากลุ่ม ${med.drugClass})`
        );
      }
    }
  }

  return {
    isSafe: hardStops.length === 0,
    warnings,
    hardStops,
  };
}
