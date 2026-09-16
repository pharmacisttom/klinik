import React from 'react';

export default function TermsOfServicePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 text-slate-800">
      <h1 className="text-3xl font-bold mb-6 text-emerald-700">
        ข้อตกลงและเงื่อนไขการใช้บริการ (Terms of Service)
      </h1>
      <p className="text-sm text-slate-500 mb-8">ปรับปรุงล่าสุด: 16 กันยายน 2569</p>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">1. ข้อกำหนดทั่วไป</h2>
        <p>
          ระบบ Klinik เป็นระบบสารสนเทศเพื่อการบริหารจัดการคลินิกเวชกรรมและการนัดหมายแพทย์
          การเข้าใช้บริการของท่านถือว่าท่านยอมรับข้อตกลงและเงื่อนไขนี้ทุกประการ
        </p>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">2. การนัดหมายและการเข้ารับบริการ</h2>
        <p>
          ผู้ใช้บริการต้องระบุข้อมูลส่วนบุคคลที่เป็นความจริงเพื่อความปลอดภัยในการรักษาพยาบาล
          หากมีการยกเลิกนัดหมาย กรุณาแจ้งล่วงหน้าอย่างน้อย 24 ชั่วโมง
        </p>
      </section>

      <section className="mb-8 space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">3. ข้อจำกัดความรับผิดชอบทางการแพทย์</h2>
        <p>
          คำแนะนำและข้อมูลสุขภาพบนเว็บไซต์นี้มีวัตถุประสงค์เพื่อเป็นข้อมูลเบื้องต้นเท่านั้น
          ไม่สามารถใช้ทดแทนการตรวจวินิจฉัยทางการแพทย์โดยแพทย์ผู้เชี่ยวชาญโดยตรงได้
        </p>
      </section>
    </div>
  );
}
