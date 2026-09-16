/**
 * Intelligent Minor Procedure & Wound Care Clinical Algorithm
 */

export interface EquipmentChecklistItem {
  id: string;
  name: string;
  category: 'STERILE_KIT' | 'SUTURE_THREAD' | 'ANESTHETIC' | 'ANTISEPTIC' | 'DRESSING';
  isRequired: boolean;
  stockChecked: boolean;
  lotNumber?: string;
}

export interface Icd9ProcedureCode {
  code: string;
  nameTh: string;
  nameEn: string;
  category: string;
  estimatedTimeMin: number;
}

export class ProcedureClinicalAlgorithm {
  // ICD-9-CM Standard Procedure Codes for Thai OPD Clinics
  static ICD9_PROCEDURE_CODES: Icd9ProcedureCode[] = [
    { code: '86.59', nameTh: 'การเย็บปิดบาดแผล (Suture of skin and subcutaneous tissue)', nameEn: 'Wound Suture', category: 'SUTURING', estimatedTimeMin: 20 },
    { code: '86.22', nameTh: 'การตัดแต่งขอบแผลและเนื้อตาย (Debridement of wound/tissue)', nameEn: 'Wound Debridement', category: 'DEBRIDEMENT', estimatedTimeMin: 15 },
    { code: '86.04', nameTh: 'การเจาะระบายหนองหรือสิ่งคัดหลั่ง (Incision and drainage of skin)', nameEn: 'Incision & Drainage (I&D)', category: 'DRAINAGE', estimatedTimeMin: 15 },
    { code: '93.57', nameTh: 'การทำแผลและเปลี่ยนผ้าปิดแผล (Dressing of wound)', nameEn: 'Wound Dressing', category: 'DRESSING', estimatedTimeMin: 10 },
    { code: '86.11', nameTh: 'การตัดชิ้นเนื้อเพื่อส่งตรวจทางพยาธิวิทยา (Biopsy of skin)', nameEn: 'Skin Biopsy', category: 'PATHOLOGY', estimatedTimeMin: 20 },
    { code: '86.30', nameTh: 'การผ่าตัดก้อนกะตุ่ม/ไฝ/ตุ่มเนื้อ (Excision of skin lesion)', nameEn: 'Lesion Excision', category: 'EXCISION', estimatedTimeMin: 30 },
  ];

  // Standard Equipment Checklist for Minor Procedure Room
  static STANDARD_EQUIPMENT_CHECKLIST: EquipmentChecklistItem[] = [
    { id: 'eq-1', name: 'ชุดทำแผลและเย็บแผลสเตอไรล์ (Sterile Suturing Set)', category: 'STERILE_KIT', isRequired: true, stockChecked: true },
    { id: 'eq-2', name: 'ถุงมือสเตอไรล์เบอร์ 6.5 / 7.0 / 7.5 (Sterile Gloves)', category: 'STERILE_KIT', isRequired: true, stockChecked: true },
    { id: 'eq-3', name: 'ไหมเย็บแผล Nylon 3-0 / 4-0 / 5-0 (Non-absorbable Suture)', category: 'SUTURE_THREAD', isRequired: true, stockChecked: true, lotNumber: 'LOT-NYL-2026A' },
    { id: 'eq-4', name: 'ยาชาเฉพาะที่ Lidocaine 2% (w/ or w/o Adrenaline)', category: 'ANESTHETIC', isRequired: true, stockChecked: true, lotNumber: 'LOT-LIDO-2026B' },
    { id: 'eq-5', name: 'เข็มและกระบอกฉีดยา Syringe 3ml / 5ml + Needle 24G', category: 'ANESTHETIC', isRequired: true, stockChecked: true },
    { id: 'eq-6', name: 'น้ำเกลือล้างแผล Normal Saline 0.9% 500ml', category: 'ANTISEPTIC', isRequired: true, stockChecked: true },
    { id: 'eq-7', name: 'น้ำยาฆ่าเชื้อ Povidone Iodine 10% / Chlorhexidine 2%', category: 'ANTISEPTIC', isRequired: true, stockChecked: true },
    { id: 'eq-8', name: 'ผ้าก๊อซสเตอไรล์ 3x3 / 4x4 + พลาสเตอร์ปิดแผล Micropore', category: 'DRESSING', isRequired: true, stockChecked: true },
  ];

  /**
   * Calculate Maximum Safe Dose for Local Anesthetic Lidocaine 2%
   * Lidocaine 2% = 20 mg/ml
   * Max Dose without Adrenaline: 4.5 mg/kg
   * Max Dose with Adrenaline: 7.0 mg/kg
   */
  static calculateLidocaineMaxDose(weightKg: number, withAdrenaline: boolean = false): { maxMg: number; maxMl: number } {
    const safeKg = weightKg > 0 ? weightKg : 60;
    const mgPerKg = withAdrenaline ? 7.0 : 4.5;
    const maxMg = Math.round(safeKg * mgPerKg);
    const maxMl = Math.round((maxMg / 20) * 10) / 10;
    return { maxMg, maxMl };
  }

  /**
   * Evaluate Tetanus Vaccine (บาดพยัก) Prophylaxis Need based on Wound Type
   */
  static evaluateTetanusRequirement(isDirtyWound: boolean, lastTetanusYears: number): { needsTetanusToxoid: boolean; recommendation: string } {
    if (isDirtyWound) {
      if (lastTetanusYears >= 5) {
        return {
          needsTetanusToxoid: true,
          recommendation: '⚠️ แผลสกปรก/ฉีดวัคซีนเกิน 5 ปี: แนะนำฉีด Tetanus Toxoid (TT) 1 เข็ม + TIG (ถ้าไม่เคยฉีดครบ 3 เข็ม)',
        };
      }
    } else {
      if (lastTetanusYears >= 10) {
        return {
          needsTetanusToxoid: true,
          recommendation: '⚠️ แผลสะอาด/ฉีดวัคซีนเกิน 10 ปี: แนะนำกระตุ้น Tetanus Toxoid (TT) 1 เข็ม',
        };
      }
    }
    return {
      needsTetanusToxoid: false,
      recommendation: '✓ ประวัติวัคซีนบาดพยักยังอยู่ในช่วงคุ้มกัน (ไม่ต้องฉีดเพิ่ม)',
    };
  }
}
