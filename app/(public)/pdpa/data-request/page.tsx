'use client';

import React, { useState } from 'react';

export default function DataRequestPage() {
  const [requestType, setRequestType] = useState<'EXPORT' | 'ERASURE'>('EXPORT');
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requestType === 'ERASURE') {
      setStatusMsg({
        type: 'warning',
        text: 'บันทึกคำขอแล้ว: ตามพระราชบัญญัติสถานพยาบาล ข้อมูลเวชประวัติการรักษาจะถูกจัดเก็บตามข้อกำหนดทางกฎหมาย 10 ปี ก่อนดำเนินการทำลายข้อมูลถาวร',
      });
    } else {
      setStatusMsg({
        type: 'success',
        text: 'บันทึกคำขอสำเร็จ: เจ้าหน้าที่จะจัดส่งไฟล์ข้อมูลส่วนบุคคล (PDF/JSON) ให้ท่านทางอีเมลภายใน 7 วันทำการ',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          ศูนย์บริการคำขอสิทธิข้อมูลส่วนบุคคล (PDPA Data Portal)
        </h1>
        <p className="text-slate-600 text-sm mb-6">
          ผู้ป่วยสามารถยื่นคำขอเพื่อดาวน์โหลดข้อมูลส่วนบุคคล หรือยื่นคำขอให้ลบข้อมูลส่วนบุคคลตามสิทธิ PDPA
        </p>

        {statusMsg && (
          <div
            className={`p-4 rounded-lg mb-6 text-sm ${
              statusMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {statusMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ประเภทคำขอ</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRequestType('EXPORT')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium ${
                  requestType === 'EXPORT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                ขอดาวน์โหลดข้อมูล (Data Export)
              </button>
              <button
                type="button"
                onClick={() => setRequestType('ERASURE')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium ${
                  requestType === 'ERASURE'
                    ? 'border-red-600 bg-red-50 text-red-700'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                ขอให้ลบข้อมูล (Data Erasure)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              เลขประจำตัวประชาชน 13 หลัก
            </label>
            <input
              type="text"
              required
              maxLength={13}
              value={nationalId}
              onChange={(e) => setNationalId(e.target.value)}
              placeholder="1100400XXXXXX"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">หมายเลขโทรศัพท์</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812345678"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">เหตุผลในการยื่นคำขอ</label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลเบื้องต้น..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            ส่งคำขอสิทธิ PDPA
          </button>
        </form>
      </div>
    </div>
  );
}
