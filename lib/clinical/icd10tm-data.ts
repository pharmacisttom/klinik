export interface Icd10TmEntry {
  code: string;
  nameTh: string;
  nameEn: string;
  category: string;
  isChronic: boolean;
}

/**
 * Common ICD-10-TM (Thai Modification) Clinical Terminology Dictionary
 */
export const ICD10TM_DICTIONARY: Icd10TmEntry[] = [
  { code: 'J00', nameTh: 'โรคหวัดเฉียบพลัน (Acute Nasopharyngitis)', nameEn: 'Acute nasopharyngitis [common cold]', category: 'Respiratory', isChronic: false },
  { code: 'J02.9', nameTh: 'คออักเสบเฉียบพลัน (Acute Pharyngitis)', nameEn: 'Acute pharyngitis, unspecified', category: 'Respiratory', isChronic: false },
  { code: 'J03.9', nameTh: 'ทอนซิลอักเสบเฉียบพลัน (Acute Tonsillitis)', nameEn: 'Acute tonsillitis, unspecified', category: 'Respiratory', isChronic: false },
  { code: 'E11.9', nameTh: 'โรคเบาหวานชนิดที่ 2 ไม่มีภาวะแทรกซ้อน', nameEn: 'Type 2 diabetes mellitus without complications', category: 'Endocrine', isChronic: true },
  { code: 'I10', nameTh: 'โรคความดันโลหิตสูงชนิดปฐมภูมิ', nameEn: 'Essential (primary) hypertension', category: 'Cardiovascular', isChronic: true },
  { code: 'K21.9', nameTh: 'โรคกรดไหลย้อน (GERD)', nameEn: 'Gastro-esophageal reflux disease without esophagitis', category: 'Digestive', isChronic: false },
  { code: 'K29.7', nameTh: 'กระเพาะอาหารอักเสบ (Gastritis)', nameEn: 'Gastritis, unspecified', category: 'Digestive', isChronic: false },
  { code: 'M54.5', nameTh: 'อาการปวดหลังส่วนล่าง (Low Back Pain)', nameEn: 'Low back pain', category: 'Musculoskeletal', isChronic: false },
  { code: 'L03.9', nameTh: 'ผิวหนังและเนื้อเยื่อใต้ผิวหนังอักเสบ (Cellulitis)', nameEn: 'Cellulitis, unspecified', category: 'Dermatology', isChronic: false },
  { code: 'A09.9', nameTh: 'อุจจาระร่วงเฉียบพลัน (Acute Gastroenteritis)', nameEn: 'Gastroenteritis and colitis of unspecified origin', category: 'Infectious', isChronic: false },
  { code: 'A90', nameTh: 'ไข้เด็งกี (Dengue Fever)', nameEn: 'Dengue fever [classical dengue]', category: 'Infectious', isChronic: false },
];

/**
 * Diagnosis Type Classification (สปสช. e-Claim Standard)
 */
export const DX_TYPES = [
  { code: 1, nameTh: 'Primary Diagnosis (การวินิจฉัยหลัก)', desc: 'โรคหลักที่เป็นสาเหตุของการมารับบริการ' },
  { code: 2, nameTh: 'Comorbidity (โรคร่วม)', desc: 'โรคที่เป็นร่วมด้วยแต่ไม่ได้เป็นสาเหตุหลัก' },
  { code: 3, nameTh: 'Complication (ภาวะแทรกซ้อน)', desc: 'ภาวะแทรกซ้อนที่เกิดขึ้นระหว่างการรักษา' },
  { code: 4, nameTh: 'External Cause (สาเหตุภายนอก V-Y codes)', desc: 'สาเหตุภายนอกของการบาดเจ็บหรือได้รับพิษ' },
];

export function searchIcd10Tm(query: string): Icd10TmEntry[] {
  if (!query || query.trim() === '') return ICD10TM_DICTIONARY.slice(0, 10);
  const q = query.trim().toLowerCase();
  return ICD10TM_DICTIONARY.filter(
    (e) => e.code.toLowerCase().includes(q) || e.nameTh.toLowerCase().includes(q) || e.nameEn.toLowerCase().includes(q)
  );
}
