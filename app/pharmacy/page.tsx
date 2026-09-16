'use client';

import React, { useState } from 'react';
import { dispensePrescriptionAction } from '@/app/actions/clinical';
import { Pill, CheckCircle2, AlertCircle, Printer } from 'lucide-react';

export default function PharmacyPage() {
  const [patientHn, setPatientHn] = useState('HN-690916-0001');
  const [patientName, setPatientName] = useState('ประณีต สุขใจ');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleDispense = async () => {
    setLoading(true);
    setStatus(null);

    const res = await dispensePrescriptionAction(patientHn);
    setLoading(false);

    if (res.success) {
      setStatus({
        type: 'success',
        message: 'ยืนยันการตัดสต๊อกและจัดยาเรียบร้อย! คิวถูกส่งไปยังจุดชำระเงิน (Cashier) แล้ว',
      });
    } else {
      setStatus({
        type: 'error',
        message: res.error || 'เกิดข้อผิดพลาดในการจัดยา',
      });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-500 text-white flex items-center justify-center">
              <Pill className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ห้องยาและคลังยา (Pharmacy & Dispensing)</h1>
              <p className="text-slate-500 text-sm">ตรวจสอบใบสั่งยา ตัดสต๊อกอัตโนมัติ และพิมพ์ฉลากยา</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
            คิวรอจัดยา: 1 คิว
          </span>
        </div>

        {status && (
          <div
            className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
              status.type === 'success'
                ? 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            )}
            <span>{status.message}</span>
          </div>
        )}

        {/* Patient Prescribed Details Card */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase">ผู้ป่วย</span>
              <button
                type="button"
                onClick={() => {
                  setPatientHn('HN-690916-0001');
                  setPatientName('ประณีต สุขใจ');
                }}
                className="block text-left"
              >
                <h3 className="text-xl font-bold text-slate-900 hover:text-indigo-600">
                  {patientName} ({patientHn})
                </h3>
              </button>
            </div>
            <div className="text-right">
              <span className="text-xs font-semibold text-slate-400 uppercase">แพทย์ผู้ตรวจ</span>
              <p className="text-sm font-bold text-slate-800">นพ. สมชาย ดีใจ</p>
            </div>
          </div>

          <div className="p-3 bg-red-50 text-red-800 rounded-lg text-xs font-medium border border-red-200">
            ⚠️ ประวัติแพ้ยาของผู้ป่วย: Penicillin (ตรวจสอบความปลอดภัยก่อนส่งมอบยา)
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 text-xs text-slate-500 uppercase border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3">รหัสยา</th>
                  <th className="px-4 py-3">ชื่อยา / ยาสามัญ</th>
                  <th className="px-4 py-3 text-center">จำนวนสั่ง</th>
                  <th className="px-4 py-3">วิธีใช้ยา</th>
                  <th className="px-4 py-3 text-center">คงเหลือในสต๊อก</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">MED-PARA-500</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">Paracetamol 500mg</p>
                    <p className="text-xs text-slate-400">Acetaminophen</p>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">20 เม็ด</td>
                  <td className="px-4 py-3 text-xs text-slate-700">1 เม็ด หลังอาหาร 3 มื้อ</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-emerald-600">1,500 เม็ด (เพียงพอ)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-mono text-xs font-semibold">MED-AMOX-500</td>
                  <td className="px-4 py-3">
                    <p className="font-bold text-slate-900">Amoxicillin 500mg</p>
                    <p className="text-xs text-slate-400">Amoxicillin Trihydrate</p>
                  </td>
                  <td className="px-4 py-3 text-center font-bold text-slate-900">21 แคปซูล</td>
                  <td className="px-4 py-3 text-xs text-slate-700">1 แคปซูล ก่อนอาหาร 3 มื้อ (ทานจนหมด)</td>
                  <td className="px-4 py-3 text-center text-xs font-semibold text-emerald-600">400 แคปซูล (เพียงพอ)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => alert('กำลังพิมพ์ฉลากยา...')}
            className="w-1/3 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition border border-slate-300 flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5 text-slate-600" /> พิมพ์ฉลากยา
          </button>
          <button
            type="button"
            onClick={handleDispense}
            disabled={loading}
            className="w-2/3 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl transition shadow-md shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? 'กำลังจัดยา...' : 'ยืนยันการจัดยา'}
          </button>
        </div>
      </div>
    </div>
  );
}
