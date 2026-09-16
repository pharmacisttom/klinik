'use client';

import React from 'react';
import { Award, CheckSquare, Printer } from 'lucide-react';

interface MedicalCertificateViewProps {
  certificate: {
    certificateNumber: string;
    type: string;
    fiveDiseasesChecked: boolean;
    fitForWork: boolean;
    restDays: number;
    startDate?: Date | string | null;
    endDate?: Date | string | null;
    diagnosisText: string;
    remarks?: string | null;
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

export default function MedicalCertificateView({ certificate }: MedicalCertificateViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const age = new Date().getFullYear() - new Date(certificate.patient.dateOfBirth).getFullYear();

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto border border-slate-300 rounded-xl shadow-lg print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <Award className="w-5 h-5 text-emerald-600" />
          <span>แบบฟอร์มใบรับรองแพทย์มาตรฐานแพทยสภา</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์ใบรับรองแพทย์ (Print)</span>
        </button>
      </div>

      <div className="border-4 border-double border-slate-800 p-8 text-slate-900 leading-relaxed font-sans">
        {/* Header */}
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
          <h1 className="text-xl font-bold tracking-tight">ทอมวิส คลินิกเวชกรรม (TOMVIS CLINIC)</h1>
          <p className="text-xs text-slate-600 mt-0.5">
            ใบอนุญาตให้ประกอบกิจการสถานพยาบาล เลขที่ 10105001234
          </p>
          <p className="text-xs text-slate-600">
            123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110 โทร. 02-123-4567
          </p>
          <div className="text-lg font-extrabold mt-4 tracking-wider underline">
            ใบรับรองแพทย์ (MEDICAL CERTIFICATE)
          </div>
          <div className="text-xs font-semibold text-slate-500 mt-1">
            เลขที่เอกสาร: {certificate.certificateNumber}
          </div>
        </div>

        {/* Doctor Part */}
        <div className="mb-4 text-sm">
          <p>
            ข้าพเจ้า <strong>{certificate.doctor.name}</strong> ใบอนุญาตประกอบวิชาชีพเวชกรรม เลขที่ <strong>ว. 45678</strong>
          </p>
          <p className="mt-1">
            ได้ทำการตรวจร่างกาย <strong>{certificate.patient.prefix}{certificate.patient.firstName} {certificate.patient.lastName}</strong>
            &nbsp;เลขบัตรประจำตัวประชาชน <strong>{certificate.patient.nationalId}</strong>
            &nbsp;อายุ <strong>{age}</strong> ปี
          </p>
          <p className="mt-1">
            ที่อยู่ <strong>{certificate.patient.address}</strong>
          </p>
        </div>

        {/* 5 Excluded Diseases Checklist */}
        <div className="my-6 p-4 bg-slate-50 border border-slate-300 rounded-lg text-xs space-y-2">
          <div className="font-bold text-slate-800 text-sm mb-1">
            ผลการตรวจคัดกรองโรคต้องห้าม 5 โรค (ตาม พ.ร.บ. สถานพยาบาล พ.ศ. 2541):
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>1. โรคเรื้อนในระยะติดต่อหรือปรากฏอาการ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>2. วัณโรคในระยะอันตราย</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>3. โรคเท้าช้างในระยะปรากฏอาการ</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>4. ติดยาเสพติดให้โทษ</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <CheckSquare className="w-4 h-4 text-emerald-600" />
              <span>5. โรคพิษสุราเรื้อรัง</span>
            </div>
          </div>
        </div>

        {/* Diagnosis & Opinion */}
        <div className="space-y-3 text-sm">
          <div>
            <strong className="text-slate-800">การวินิจฉัยโรค / ความเห็นของแพทย์:</strong>
            <p className="mt-1 p-3 bg-slate-50 border border-slate-200 rounded min-h-[60px]">
              {certificate.diagnosisText}
            </p>
          </div>

          {certificate.restDays > 0 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded text-amber-900">
              เห็นสมควรให้หยุดพักรักษาตัวเป็นเวลา <strong>{certificate.restDays}</strong> วัน ตั้งแต่วันที่{' '}
              <strong>{certificate.startDate ? new Date(certificate.startDate).toLocaleDateString('th-TH') : '-'}</strong> ถึงวันที่{' '}
              <strong>{certificate.endDate ? new Date(certificate.endDate).toLocaleDateString('th-TH') : '-'}</strong>
            </div>
          )}

          {certificate.remarks && (
            <div className="text-xs text-slate-600">
              หมายเหตุ: {certificate.remarks}
            </div>
          )}
        </div>

        {/* Signatures */}
        <div className="mt-12 pt-8 flex justify-between items-end border-t border-slate-300">
          <div className="text-center text-xs text-slate-500">
            <div>ลงลายมือชื่อผู้รับการตรวจ...................................................</div>
            <div className="mt-1">({certificate.patient.prefix}{certificate.patient.firstName} {certificate.patient.lastName})</div>
          </div>

          <div className="text-center text-xs text-slate-700">
            <div>ลงชื่อ...................................................แพทย์ผู้ตรวจ</div>
            <div className="font-bold text-slate-900 mt-1">({certificate.doctor.name})</div>
            <div>แพทย์ผู้ประกอบวิชาชีพเวชกรรม</div>
            <div className="text-slate-500 text-[10px] mt-2">
              วันที่ออกเอกสาร: {new Date(certificate.createdAt).toLocaleDateString('th-TH')}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
