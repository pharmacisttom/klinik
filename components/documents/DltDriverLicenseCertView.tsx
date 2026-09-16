'use client';

import React from 'react';
import { Car, CheckSquare, Printer } from 'lucide-react';

interface DltDriverLicenseCertViewProps {
  certificate: {
    certificateNumber: string;
    createdAt: Date | string;
    patient: {
      prefix: string;
      firstName: string;
      lastName: string;
      nationalId: string;
      dateOfBirth: Date | string;
      address: string;
    };
    doctor: {
      name: string;
    };
  };
}

export default function DltDriverLicenseCertView({ certificate }: DltDriverLicenseCertViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const age = new Date().getFullYear() - new Date(certificate.patient.dateOfBirth).getFullYear();

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto border border-slate-300 rounded-xl shadow-lg print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-2 text-indigo-600 text-sm font-semibold">
          <Car className="w-5 h-5 text-indigo-600" />
          <span>ใบรับรองแพทย์สำหรับการทำใบขับขี่ (กรมการขนส่งทางบก DLT Standard)</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์ใบรับรองแพทย์ทำใบขับขี่ (Print DLT Cert)</span>
        </button>
      </div>

      <div className="border border-slate-400 p-8 text-slate-900 leading-relaxed font-sans text-sm">
        {/* Header */}
        <div className="text-center border-b border-slate-300 pb-4 mb-6">
          <h1 className="text-lg font-bold text-slate-900">ใบรับรองแพทย์สำหรับการขอรับ/ต่ออายุใบอนุญาตขับรถ</h1>
          <p className="text-xs text-slate-600">(ตามแบบมาตรฐานกรมการขนส่งทางบก และแพทยสภา พ.ศ. 2564)</p>
          <div className="text-xs font-bold text-indigo-700 mt-2">เลขที่เอกสาร: {certificate.certificateNumber}</div>
        </div>

        {/* Section 1: Patient Self Declaration */}
        <div className="mb-6 p-4 bg-slate-50 border border-slate-200 rounded-lg">
          <h2 className="font-bold text-slate-800 text-xs mb-2">ส่วนที่ 1: สำหรับผู้ขอรับใบอนุญาตขับรถ (ผู้รับการตรวจ):</h2>
          <p className="text-xs">
            ข้าพเจ้า <strong>{certificate.patient.prefix}{certificate.patient.firstName} {certificate.patient.lastName}</strong>
            &nbsp;เลขประจำตัวประชาชน <strong>{certificate.patient.nationalId}</strong> อายุ <strong>{age}</strong> ปี
          </p>
          <p className="text-xs mt-1">ที่อยู่ <strong>{certificate.patient.address}</strong></p>
          <div className="text-xs text-slate-600 mt-2 italic">
            "ขอรับรองว่าข้าพเจ้าไม่มีโรคประจำตัวร้ายแรง ไม่เคยเป็นลมชัก และข้อมูลสุขภาพข้างต้นเป็นความจริงทุกประการ"
          </div>
        </div>

        {/* Section 2: Medical Assessment */}
        <div className="space-y-4">
          <h2 className="font-bold text-slate-800 text-xs">ส่วนที่ 2: สำหรับแพทย์ผู้ทำการตรวจร่างกาย:</h2>
          <p className="text-xs">
            ข้าพเจ้า <strong>{certificate.doctor.name}</strong> ใบอนุญาตประกอบวิชาชีพเวชกรรม เลขที่ <strong>ว. 45678</strong>
          </p>
          <p className="text-xs">
            ได้ทำการตรวจร่างกายผู้ขอรับใบอนุญาตขับรถข้างต้นแล้ว ขอรับรองว่าผู้ขอรับการตรวจ:
          </p>

          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-xs space-y-2 text-emerald-950">
            <div className="font-bold text-emerald-900 mb-1">ไม่เป็นโรคต้องห้าม 5 โรคตามกฎกระทรวงกรมการขนส่งทางบก:</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-emerald-600" /><span>1. โรคเรื้อน</span></div>
              <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-emerald-600" /><span>2. วัณโรคในระยะอันตราย</span></div>
              <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-emerald-600" /><span>3. โรคเท้าช้าง</span></div>
              <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-emerald-600" /><span>4. ติดยาเสพติดให้โทษ</span></div>
              <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-emerald-600" /><span>5. โรคพิษสุราเรื้อรัง</span></div>
              <div className="flex items-center gap-1.5"><CheckSquare className="w-4 h-4 text-emerald-600" /><span>6. โรคลมชัก (Epilepsy)</span></div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded text-xs">
            <strong>สรุปความเห็นแพทย์:</strong> สภาพร่างกายสมบูรณ์แข็งแรง สายตาและการรับรู้สีปกติ เหมาะสมสำหรับการขับขี่พาหนะ
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 flex justify-between items-end border-t border-slate-300 text-xs text-slate-600">
          <div className="text-center">
            <div>ลงชื่อ...................................................ผู้ขอรับการตรวจ</div>
            <div className="mt-1">({certificate.patient.prefix}{certificate.patient.firstName} {certificate.patient.lastName})</div>
          </div>

          <div className="text-center text-slate-800">
            <div>ลงชื่อ...................................................แพทย์ผู้ตรวจ</div>
            <div className="font-bold mt-1">({certificate.doctor.name})</div>
            <div className="text-[10px] text-slate-500 mt-1">
              วันที่ออกเอกสาร: {new Date(certificate.createdAt).toLocaleDateString('th-TH')} (มีอายุ 1 เดือน)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
