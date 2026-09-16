'use client';

import React, { useState } from 'react';
import { createDataRequestAction } from '@/app/actions/clinical';
import { ShieldAlert, CheckCircle2, FileText } from 'lucide-react';

export default function DataRequestPage() {
  const [requestType, setRequestType] = useState<'DATA_EXPORT' | 'DATA_ERASURE'>('DATA_EXPORT');
  const [nationalId, setNationalId] = useState('1100400123450');
  const [phone, setPhone] = useState('0867890123');
  const [reason, setReason] = useState('ขอดาวน์โหลดข้อมูลเวชประวัติสำหรับการเปลี่ยนสถานที่รักษา');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'warning' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    const res = await createDataRequestAction({
      nationalId,
      phone,
      type: requestType,
      reason,
    });

    setLoading(false);

    if (res.success) {
      if (requestType === 'DATA_ERASURE') {
        setStatusMsg({
          type: 'warning',
          text: 'บันทึกคำขอแล้ว: ตามพระราชบัญญัติสถานพยาบาล ข้อมูลเวชประวัติการรักษาจะถูกจัดเก็บตามข้อกำหนดทางกฎหมาย 10 ปี ก่อนดำเนินการทำลายข้อมูลถาวร',
        });
      } else {
        setStatusMsg({
          type: 'success',
          text: 'บันทึกคำขอแล้ว: เจ้าหน้าที่จะจัดส่งไฟล์ข้อมูลส่วนบุคคล (PDF/JSON) ให้ท่านทางอีเมลภายใน 7 วันทำการ',
        });
      }
    } else {
      setStatusMsg({
        type: 'error',
        text: res.error || 'เกิดข้อผิดพลาดในการส่งคำขอสิทธิ PDPA',
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      <div className="bg-white p-8 rounded-xl shadow-md border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              ศูนย์บริการคำขอสิทธิข้อมูลส่วนบุคคล (PDPA Data Portal)
            </h1>
            <p className="text-slate-600 text-sm">
              ผู้ป่วยสามารถยื่นคำขอเพื่อดาวน์โหลดข้อมูลส่วนบุคคล หรือยื่นคำขอให้ลบข้อมูลส่วนบุคคลตามสิทธิ PDPA
            </p>
          </div>
        </div>

        {statusMsg && (
          <div
            className={`request-status p-4 rounded-lg mb-6 text-sm font-medium flex items-center gap-2 ${
              statusMsg.type === 'warning'
                ? 'bg-amber-50 text-amber-800 border border-amber-200'
                : statusMsg.type === 'error'
                ? 'bg-red-50 text-red-800 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">ประเภทคำขอ</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRequestType('DATA_EXPORT')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition ${
                  requestType === 'DATA_EXPORT'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-200'
                    : 'border-slate-300 hover:bg-slate-50'
                }`}
              >
                ขอดาวน์โหลดข้อมูล (Data Export)
              </button>
              <button
                type="button"
                onClick={() => setRequestType('DATA_ERASURE')}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition ${
                  requestType === 'DATA_ERASURE'
                    ? 'border-red-600 bg-red-50 text-red-700 font-bold ring-2 ring-red-200'
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
              name="nationalId"
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
              name="phone"
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
              name="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="ระบุเหตุผลเบื้องต้น..."
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'กำลังส่งคำขอ...' : 'ขอดาวน์โหลดข้อมูลส่วนบุคคล (ยื่นคำขอ PDPA)'}
          </button>
        </form>
      </div>
    </div>
  );
}
