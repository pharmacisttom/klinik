'use client';

import React from 'react';
import { Pill, Printer, AlertTriangle } from 'lucide-react';

interface GppLabelViewProps {
  labelData: {
    clinicName: string;
    clinicAddress: string;
    clinicTel: string;
    dispensedDate: Date | string;
    patient: {
      prefix: string;
      firstName: string;
      lastName: string;
      hn: string;
    };
    medication: {
      name: string;
      genericName: string;
      unit: string;
      lotNumber: string;
      expiryDate: Date | string;
    };
    quantity: number;
    dosageInstructionTh: string; // e.g. "รับประทานครั้งละ 1 เม็ด วันละ 3 ครั้ง หลังอาหาร เช้า-กลางวัน-เย็น"
    auxiliaryWarnings?: string[]; // e.g. ["ทานหลังอาหารทันที", "อาจทำให้ง่วงซึม ห้ามขับขี่ยานพาหนะ"]
  };
}

export default function GppLabelView({ labelData }: GppLabelViewProps) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="bg-white p-6 max-w-md mx-auto border border-slate-300 rounded-xl shadow-lg print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-center mb-4 print:hidden">
        <div className="flex items-center gap-2 text-slate-700 text-xs font-semibold">
          <Pill className="w-4 h-4 text-emerald-600" />
          <span>ฉลากยาภาษาไทยมาตรฐาน GPP (Good Pharmacy Practice 2557)</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>พิมพ์ฉลากยา (Print Label)</span>
        </button>
      </div>

      {/* Printable Label Box */}
      <div className="border-2 border-slate-800 p-4 text-slate-900 font-sans text-xs bg-white">
        {/* Clinic Header */}
        <div className="text-center border-b border-slate-300 pb-2 mb-2">
          <div className="font-bold text-sm text-slate-900">{labelData.clinicName || 'ทอมวิส คลินิกเวชกรรม'}</div>
          <div className="text-[10px] text-slate-600">{labelData.clinicAddress || '123/45 ถนนสุขุมวิท กรุงเทพฯ'} โทร. {labelData.clinicTel || '02-123-4567'}</div>
        </div>

        {/* Patient Details */}
        <div className="flex justify-between items-center bg-slate-100 p-2 rounded mb-2">
          <div>
            <span className="text-[10px] text-slate-500 font-semibold">ผู้ป่วย: </span>
            <strong className="text-xs text-slate-900">{labelData.patient.prefix}{labelData.patient.firstName} {labelData.patient.lastName}</strong>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500">HN: </span>
            <strong className="text-xs text-slate-900">{labelData.patient.hn}</strong>
          </div>
        </div>

        {/* Drug Name & Qty */}
        <div className="my-2 border-b border-slate-200 pb-2">
          <div className="text-sm font-extrabold text-emerald-800">{labelData.medication.name}</div>
          <div className="text-[10px] text-slate-500 italic">({labelData.medication.genericName})</div>
          <div className="text-right font-bold text-xs mt-1">
            จำนวน: <span className="text-slate-900">{labelData.quantity} {labelData.medication.unit}</span>
          </div>
        </div>

        {/* Dosage Instructions in Thai */}
        <div className="my-3 p-2 bg-emerald-50 border border-emerald-200 rounded">
          <div className="text-[10px] font-bold text-emerald-900 mb-0.5">วิธีรับประทาน / คำแนะนำ:</div>
          <div className="text-xs font-extrabold text-slate-900 leading-snug">{labelData.dosageInstructionTh}</div>
        </div>

        {/* Auxiliary Warnings */}
        {labelData.auxiliaryWarnings && labelData.auxiliaryWarnings.length > 0 && (
          <div className="my-2 space-y-1">
            {labelData.auxiliaryWarnings.map((warn, idx) => (
              <div key={idx} className="flex items-center gap-1.5 p-1 bg-amber-50 border border-amber-200 rounded text-[10px] font-bold text-amber-900">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>คำเตือนพิเศษ: {warn}</span>
              </div>
            ))}
          </div>
        )}

        {/* Lot & Expiry Footer */}
        <div className="mt-3 pt-2 border-t border-slate-300 flex justify-between text-[10px] text-slate-500">
          <span>Lot: <strong className="text-slate-800">{labelData.medication.lotNumber}</strong></span>
          <span>Exp: <strong className="text-rose-600">{new Date(labelData.medication.expiryDate).toLocaleDateString('th-TH')}</strong></span>
          <span>วันที่จ่าย: {new Date(labelData.dispensedDate).toLocaleDateString('th-TH')}</span>
        </div>
      </div>
    </div>
  );
}
