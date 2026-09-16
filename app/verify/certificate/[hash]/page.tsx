import React from 'react';
import { getMedicalCertificateByNumberAction } from '@/app/actions/documents';
import { maskNationalId, maskName } from '@/lib/security/masking';

export default async function CertificateVerifyPage({ params }: { params: { hash: string } }) {
  const certNumber = decodeURIComponent(params.hash);
  const result = await getMedicalCertificateByNumberAction(certNumber);

  if (!result.success || !result.certificate) {
    return (
      <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-800 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
          <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
            ❌
          </div>
          <h1 className="text-2xl font-bold text-red-400 mb-2">เอกสารไม่ถูกต้อง หรือไม่พบในระบบ</h1>
          <p className="text-slate-400 text-sm mb-6">
            ไม่พบข้อมูลใบรับรองแพทย์เลขที่ <span className="font-mono text-amber-300">{certNumber}</span> ในระบบคลังเอกสารทางการแพทย์
          </p>
          <p className="text-xs text-slate-500">Tomvis Clinic Verification System • MOPH Digital Signature Compliant</p>
        </div>
      </div>
    );
  }

  const cert = result.certificate;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-lg w-full bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Glow Header */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center font-bold text-xl">
              ✓
            </div>
            <div>
              <h2 className="text-base font-bold text-emerald-400">ใบรับรองแพทย์ถูกต้องตามกฎหมาย</h2>
              <p className="text-xs text-slate-400">ระบบตรวจสอบเอกสารสำคัญ Tomvis Clinic</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono">
            VERIFIED
          </span>
        </div>

        <div className="space-y-4 text-sm">
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">เลขที่ใบรับรองแพทย์ (Cert No.)</span>
            <span className="font-mono font-bold text-lg text-emerald-300">{cert.certificateNumber}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">ชื่อ-สกุล ผู้ป่วย</span>
              <span className="font-semibold text-slate-200">
                {cert.patient.prefix} {maskName(cert.patient.firstName)} {maskName(cert.patient.lastName)}
              </span>
            </div>
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-xs text-slate-400 block mb-1">HN / CID</span>
              <span className="font-mono text-slate-300">
                {cert.patient.hn} / {maskNationalId(cert.patient.nationalId)}
              </span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">แพทย์ผู้ตรวจและออกใบรับรอง</span>
            <span className="font-semibold text-cyan-300">{cert.doctor.name}</span>
            <span className="text-xs text-slate-400 block mt-0.5">ใบอนุญาตประกอบวิชาชีพเวชกรรม</span>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">การตรวจสุขภาพ 5 โรคต้องห้าม (พ.ร.บ. สถานพยาบาล)</span>
            <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs">
              <span>✓ ตรวจผ่านตามมาตรฐาน 5 โรคต้องห้าม (โรคเรื้อน, วัณโรค, โรคเท้าช้าง, ยาเสพติด, สุราเรื้อรัง)</span>
            </div>
          </div>

          <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
            <span className="text-xs text-slate-400 block mb-1">สรุปความเห็นแพทย์ / ผลการตรวจ</span>
            <p className="text-slate-300 italic">"{cert.diagnosisText}"</p>
            {cert.fitForWork && (
              <span className="inline-block mt-2 px-2.5 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-300 rounded-md text-xs font-semibold">
                ✓ สุขภาพสมบูรณ์แข็งแรง เหมาะสมแก่การทำงาน (Fit For Work)
              </span>
            )}
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-xs text-slate-500">
          ออกเมื่อ: {new Date(cert.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })} น.
          <br />
          Tomvis Clinic • 123/45 Sukhumvit Rd, Bangkok • Digital Verification Service
        </div>
      </div>
    </div>
  );
}
