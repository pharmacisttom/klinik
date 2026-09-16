'use client';

import React, { useState } from 'react';
import { processPaymentAction } from '@/app/actions/clinical';
import { CreditCard, QrCode, CheckCircle2, Receipt, AlertCircle } from 'lucide-react';
import { formatTHB } from '@/lib/utils/formatters';

export default function CashierPage() {
  const [patientHn, setPatientHn] = useState('HN-690916-0001');
  const [patientName, setPatientName] = useState('ประณีต สุขใจ');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'QR_PROMPTPAY'>('QR_PROMPTPAY');
  const [invoiceNo, setInvoiceNo] = useState<string | null>(null);
  const [paid, setPaid] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = 155.0; // 20 Paracetamol (50) + 21 Amoxicillin (105)
  const doctorFee = 300.0;
  const netTotal = subtotal + doctorFee;

  const handleProcessPayment = async () => {
    setLoading(true);
    setError(null);

    const res = await processPaymentAction({
      patientHn,
      paymentMethod,
    });

    setLoading(false);

    if (res.success) {
      setPaid(true);
      setInvoiceNo(res.invoiceNo || 'INV-2569-0042');
    } else {
      setError(res.error || 'เกิดข้อผิดพลาดในการชำระเงิน');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">การเงินและชำระเงิน (Cashier & Billing)</h1>
              <p className="text-slate-500 text-sm">คำนวณราคารวม ออกใบเสร็จรับเงิน และรองรับสแกน QR PromptPay</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-100 text-amber-800 rounded-full">
            {paid ? 'สถานะ: ชำระเงินแล้ว' : 'สถานะ: รอชำระเงิน'}
          </span>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-center gap-3 text-sm font-medium">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {paid && (
          <div className="invoice-success p-6 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-xl font-bold">ชำระเงินสำเร็จแล้ว!</h3>
            <p className="text-sm text-emerald-700">
              ออกใบเสร็จรับเงิน เลขที่: <span className="font-mono font-bold">{invoiceNo}</span>
            </p>
            <button
              type="button"
              onClick={() => alert('กำลังพิมพ์ใบเสร็จรับเงิน...')}
              className="px-6 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow"
            >
              พิมพ์ใบเสร็จรับเงิน (Print Receipt)
            </button>
          </div>
        )}

        {!paid && (
          <>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-slate-500 uppercase">
                  สรุปค่าใช้จ่ายผู้ป่วย: {patientName} ({patientHn})
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setPatientHn('HN-690916-0001');
                    setPatientName('ประณีต สุขใจ');
                  }}
                  className="text-xs font-bold text-amber-700 hover:underline"
                >
                  เลือก ประณีต สุขใจ
                </button>
              </div>

              <div className="space-y-3 text-sm border-b border-slate-200 pb-4">
                <div className="flex justify-between">
                  <span>ค่ายาทั้งหมด (Prescription Items)</span>
                  <span className="font-semibold text-slate-900">{formatTHB(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ค่าบริการทางการแพทย์และตรวจรักษา (Doctor Consultation Fee)</span>
                  <span className="font-semibold text-slate-900">{formatTHB(doctorFee)}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4">
                <span className="text-base font-bold text-slate-900">ยอดเงินสุทธิที่ต้องชำระ (Net Amount)</span>
                <span className="text-3xl font-extrabold text-amber-600">{formatTHB(netTotal)}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">ช่องทางการชำระเงิน</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('QR_PROMPTPAY')}
                  className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition ${
                    paymentMethod === 'QR_PROMPTPAY'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-amber-600" />
                  <span>สแกน QR PromptPay</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`p-4 rounded-xl border flex items-center justify-center gap-2 font-semibold text-sm transition ${
                    paymentMethod === 'CASH'
                      ? 'border-amber-500 bg-amber-50 text-amber-800 ring-2 ring-amber-200'
                      : 'border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Receipt className="w-5 h-5 text-slate-600" />
                  <span>เงินสด (Cash)</span>
                </button>
              </div>
            </div>

            {paymentMethod === 'QR_PROMPTPAY' && (
              <div className="bg-slate-900 text-white p-6 rounded-2xl text-center space-y-3">
                <p className="text-xs text-amber-400 font-semibold uppercase">Thai QR Payment PromptPay</p>
                <div className="w-44 h-44 bg-white p-3 mx-auto rounded-xl shadow-lg flex items-center justify-center">
                  <div className="w-full h-full border-4 border-slate-900 flex items-center justify-center text-slate-900 font-bold text-xs">
                    [QR PromptPay ฿{netTotal.toFixed(2)}]
                  </div>
                </div>
                <p className="text-sm font-mono text-slate-300">พร้อมเพย์ คลินิกเวชกรรม: 02-123-4567</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleProcessPayment}
              disabled={loading}
              className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl transition shadow-md shadow-amber-500/20 text-lg disabled:opacity-50"
            >
              {loading ? 'กำลังประมวลผลชำระเงิน...' : `ชำระเงิน ${formatTHB(netTotal)}`}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
