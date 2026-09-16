import React from 'react';
import { prisma } from '@/lib/prisma';
import { maskNationalId } from '@/lib/security/masking';

export default async function PrintMedicalCertificatePage({ params }: { params: { id: string } }) {
  const cert = await prisma.medicalCertificate.findUnique({
    where: { id: params.id },
    include: { patient: true, doctor: true },
  });

  if (!cert) {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        ไม่พบใบรับรองแพทย์ฉบับนี้ในระบบ
      </div>
    );
  }

  const verifyUrl = `http://localhost:3000/verify/certificate/${encodeURIComponent(cert.certificateNumber)}`;

  return (
    <div className="min-h-screen bg-white text-slate-900 p-8 font-sans max-w-4xl mx-auto border border-slate-300 my-6 shadow-lg print:border-none print:shadow-none print:my-0">
      {/* Header */}
      <div className="text-center border-b-2 border-slate-900 pb-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">ใบรับรองแพทย์ (Medical Certificate)</h1>
        <p className="text-sm font-semibold text-slate-700 mt-1">
          คลินิกเวชกรรม ตอมวิส (Tomvis Medical Clinic) • ใบอนุญาตเลขที่ 1010500123
        </p>
        <p className="text-xs text-slate-500">123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110 • โทร 02-123-4567</p>
      </div>

      {/* Cert Meta */}
      <div className="flex justify-between items-center text-xs mb-6 bg-slate-100 p-3 rounded-lg border border-slate-300">
        <div>
          <span className="font-bold text-slate-700">เลขที่ใบรับรอง (Cert No.): </span>
          <span className="font-mono font-bold text-slate-900">{cert.certificateNumber}</span>
        </div>
        <div>
          <span className="font-bold text-slate-700">วันที่ออกเอกสาร: </span>
          <span>{new Date(cert.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 text-sm leading-relaxed text-slate-800">
        <p>
          ข้าพเจ้า <span className="font-bold text-slate-900 underline">{cert.doctor.name}</span> ใบอนุญาตประกอบวิชาชีพเวชกรรมเลขที่ <span className="font-mono font-bold">ว.45678</span>
          ได้ทำการตรวจร่างกายของผู้ป่วยดังมีรายนามต่อไปนี้:
        </p>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-slate-500">ชื่อ-สกุล ผู้ป่วย: </span>
              <span className="font-bold text-slate-900">{cert.patient.prefix} {cert.patient.firstName} {cert.patient.lastName}</span>
            </div>
            <div>
              <span className="text-slate-500">HN / เลขประจำตัวประชาชน: </span>
              <span className="font-mono font-bold text-slate-900">{cert.patient.hn} / {maskNationalId(cert.patient.nationalId)}</span>
            </div>
          </div>
          <div>
            <span className="text-slate-500">ที่อยู่ผู้ป่วย: </span>
            <span>{cert.patient.address}</span>
          </div>
        </div>

        <div className="pt-2">
          <h2 className="font-bold text-slate-900 text-sm mb-2">ผลการตรวจร่างกายและสรุปความเห็นของแพทย์:</h2>
          <div className="p-4 border border-slate-300 rounded-xl bg-slate-50 italic">
            "{cert.diagnosisText}"
          </div>
        </div>

        {cert.fiveDiseasesChecked && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl text-xs space-y-1.5 text-emerald-900">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <span>✓ การรับรองมาตรฐาน 5 โรคต้องห้าม (ตาม พ.ร.บ. สถานพยาบาล & กรมการขนส่งทางบก DLT):</span>
            </div>
            <p className="text-emerald-800 pl-4">
              ขอรับรองว่าผู้ป่วยปราศจากอาการของโรคต้องห้ามทั้ง 5 โรค ได้แก่: 1. โรคเรื้อน 2. วัณโรคในระยะอันตราย 3. โรคเท้าช้าง
              4. โรคติดยาเสพติดให้โทษ 5. โรคพิษสุราเรื้อรัง
            </p>
          </div>
        )}

        {cert.fitForWork && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-xs font-semibold text-blue-900">
            ✓ สรุปความเห็น: ผู้ป่วยมีสุขภาพร่างกายสมบูรณ์แข็งแรง เหมาะสมแก่การทำงานหรือประกอบอาชีพ (Fit For Work)
          </div>
        )}
      </div>

      {/* Signature & QR Code Footer */}
      <div className="mt-12 pt-6 border-t border-slate-300 flex justify-between items-end">
        <div className="text-center space-y-2">
          <div className="w-24 h-24 bg-slate-100 border border-slate-300 rounded-lg p-2 flex flex-col items-center justify-center mx-auto">
            <span className="text-[10px] font-mono font-bold text-slate-500 block mb-1">SCAN VERIFY</span>
            <div className="w-16 h-16 bg-slate-900 text-white text-[8px] flex items-center justify-center text-center p-1 font-mono">
              [ QR CODE ]
            </div>
          </div>
          <span className="text-[10px] text-slate-500 block">สแกนเพื่อตรวจสอบความถูกต้องเอกสาร</span>
        </div>

        <div className="text-center space-y-1">
          <div className="w-48 border-b border-dashed border-slate-900 mx-auto mb-2 h-12 flex items-end justify-center">
            <span className="font-serif italic text-sm text-slate-700">Dr. Somchai Jaidee</span>
          </div>
          <p className="text-xs font-bold text-slate-900">({cert.doctor.name})</p>
          <p className="text-[11px] text-slate-600">แพทย์ผู้ตรวจและออกใบรับรองแพทย์</p>
        </div>
      </div>
    </div>
  );
}
