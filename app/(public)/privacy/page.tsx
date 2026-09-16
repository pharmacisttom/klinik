import React from 'react';

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-800">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">
        นโยบายความเป็นส่วนตัว (Privacy Policy) - Klinik Medical System
      </h1>
      <p className="text-sm text-slate-500 mb-8">ปรับปรุงล่าสุด: 16 กันยายน 2569</p>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">1. การเก็บรวบรวมข้อมูลส่วนบุคคล</h2>
        <p>
          ระบบ Klinik ดำเนินการเก็บรวบรวมข้อมูลส่วนบุคคลและข้อมูลสุขภาพ (PHI - Patient Health Information)
          ภายใต้พระราชบัญญัติคุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA) เพื่อประโยชน์ในการให้บริการรักษาพยาบาล
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>ข้อมูลระบุตัวตน: ชื่อ-นามสกุล, เลขประจำตัวประชาชน 13 หลัก, วันเดือนปีเกิด, เพศ</li>
          <li>ข้อมูลการติดต่อ: หมายเลขโทรศัพท์, ที่อยู่, บุคคลติดต่อฉุกเฉิน</li>
          <li>ข้อมูลสุขภาพ: ประวัติการแพ้ยา, โรคประจำตัว, สัญญาณชีพ, ประวัติการรักษาพยาบาล, รายการยาที่ได้รับ</li>
        </ul>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">2. วัตถุประสงค์ในการประมวลผลข้อมูล</h2>
        <p>
          ข้อมูลส่วนบุคคลของท่านจะถูกนำไปใช้เพื่อการวินิจฉัย การสั่งจ่ายยา การจัดทำใบเสร็จรับเงิน
          การติดต่อเพื่อใกล้นัดหมาย และการปรับปรุงคุณภาพการบริการทางการแพทย์เท่านั้น
        </p>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">3. สิทธิของผู้บริโภคตามกฎหมาย PDPA</h2>
        <p>ท่านมีสิทธิตามกฎหมายดังต่อไปนี้:</p>
        <ul className="list-disc pl-6 space-y-2">
          <li>สิทธิในการเข้าถึงและขอรับสำเนาข้อมูลส่วนบุคคลของตนเอง</li>
          <li>สิทธิในการขอแก้ไขข้อมูลให้ถูกต้องและเป็นปัจจุบัน</li>
          <li>
            สิทธิในการขอให้ลบหรือทำลายข้อมูล (โดยอยู่ภายใต้เงื่อนไขการจัดเก็บเวชระเบียนตามกฎหมายการแพทย์ 10 ปี)
          </li>
          <li>สิทธิในการถอนความยินยอมในการประมวลผลข้อมูล</li>
        </ul>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">4. ช่องทางการติดต่อเจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO)</h2>
        <p>หากท่านมีข้อสงสัยหรือต้องการใช้สิทธิ PDPA สามารถติดต่อได้ที่:</p>
        <div className="bg-slate-100 p-4 rounded-lg">
          <p className="font-medium">เจ้าหน้าที่คุ้มครองข้อมูลส่วนบุคคล (DPO Office - Klinik)</p>
          <p>อีเมล: dpo@klinik.local | โทรศัพท์: 02-123-4567</p>
        </div>
      </section>
    </div>
  );
}
