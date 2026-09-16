import { prisma } from '@/lib/prisma';

export interface InteractionAlert {
  severity: 'CRITICAL' | 'MAJOR' | 'MODERATE';
  med1Name: string;
  med2Name: string;
  description: string;
  actionRequired: string;
}

/**
 * Common Critical Drug-Drug Interactions Matrix
 */
const INTERACTION_MATRIX = [
  {
    class1: 'NSAID',
    class2: 'ANTICOAGULANT',
    severity: 'CRITICAL' as const,
    description: 'เพิ่มความเสี่ยงภาวะเลือดออกในทางเดินอาหารอย่างรุนแรง (Major Gastrointestinal Bleeding)',
    actionRequired: 'หลีกเลี่ยงการใช้ร่วมกัน หรือพิจารณาให้ PPI ป้องกันกระเพาะอาหาร',
  },
  {
    class1: 'BENZODIAZEPINE',
    class2: 'OPIOID',
    severity: 'CRITICAL' as const,
    description: 'ความเสี่ยงสูงสุดต่อการกดการหายใจ (Severe Respiratory Depression) และการเสียชีวิต',
    actionRequired: 'ห้ามใช้ร่วมกันโดยเด็ดขาด ยกเว้นอยู่ในความดูแลของวิสัญญีแพทย์',
  },
  {
    class1: 'PENICILLIN',
    class2: 'ALLERGY',
    severity: 'CRITICAL' as const,
    description: 'แพ้ยากลุ่มเพนิซิลลินขั้นรุนแรง (Anaphylactic Shock)',
    actionRequired: 'เปลี่ยนไปใช้ Macrolides หรือ Antibiotic กลุ่มอื่น',
  },
];

/**
 * Check drug-drug interactions for proposed medications
 */
export async function checkDrugInteractions(medicationIds: string[]): Promise<InteractionAlert[]> {
  const meds = await prisma.medication.findMany({
    where: { id: { in: medicationIds } },
    select: { id: true, name: true, genericName: true, drugClass: true },
  });

  const alerts: InteractionAlert[] = [];

  for (let i = 0; i < meds.length; i++) {
    for (let j = i + 1; j < meds.length; j++) {
      const med1 = meds[i];
      const med2 = meds[j];

      const c1 = (med1.drugClass || '').toUpperCase();
      const c2 = (med2.drugClass || '').toUpperCase();

      for (const rule of INTERACTION_MATRIX) {
        if (
          (c1 === rule.class1 && c2 === rule.class2) ||
          (c1 === rule.class2 && c2 === rule.class1)
        ) {
          alerts.push({
            severity: rule.severity,
            med1Name: med1.name,
            med2Name: med2.name,
            description: rule.description,
            actionRequired: rule.actionRequired,
          });
        }
      }
    }
  }

  return alerts;
}

/**
 * Pediatric Weight-based Dose Calculator (คำนวณขนาดยาเด็กตามน้ำหนัก mg/kg)
 */
export function calculatePediatricDose(data: {
  weightKg: number;
  targetMgPerKgDay: number;
  dosesPerDay: number; // e.g. 3 = tid, 4 = qid
  concentrationMgPerMl?: number; // e.g. Syrup 125mg/5ml = 25mg/ml
}) {
  const totalDailyMg = data.weightKg * data.targetMgPerKgDay;
  const singleDoseMg = totalDailyMg / data.dosesPerDay;

  let singleDoseMl: number | null = null;
  if (data.concentrationMgPerMl && data.concentrationMgPerMl > 0) {
    singleDoseMl = Math.round((singleDoseMg / data.concentrationMgPerMl) * 10) / 10;
  }

  return {
    weightKg: data.weightKg,
    totalDailyMg: Math.round(totalDailyMg * 10) / 10,
    singleDoseMg: Math.round(singleDoseMg * 10) / 10,
    singleDoseMl,
  };
}
