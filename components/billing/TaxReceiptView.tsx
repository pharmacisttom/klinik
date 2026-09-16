'use client';

import React from 'react';
import { Receipt, Printer, Building2, CheckCircle2 } from 'lucide-react';

interface TaxReceiptViewProps {
  taxReceipt: {
    taxReceiptNumber: string;
    clinicTaxId: string;
    branchNo: string;
    patientTaxId?: string | null;
    medicalAmount: number;
    taxableAmount: number;
    vatAmount: number;
    netTotal: number;
    issuedAt: Date | string;
    invoice: {
      invoiceNumber: string;
      paymentMethod?: string | null;
      patient: {
        prefix: string;
        firstName: string;
        lastName: string;
        hn: string;
        nationalId: string;
        address: string;
      };
      prescription?: {
        items: Array<{
          id: string;
          quantity: number;
          unitPrice: number;
          totalPrice: number;
          dosage: string;
          medication: {
            name: string;
            category: string;
            unit: string;
          };
        }>;
      } | null;
    };
  };
}

export default function TaxReceiptView({ taxReceipt }: TaxReceiptViewProps) {
  const handlePrint = () => {
    window.print();
  };

  const { patient } = taxReceipt.invoice;

  return (
    <div className="bg-white p-8 max-w-3xl mx-auto border border-slate-300 rounded-xl shadow-lg print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <div className="flex items-center gap-2 text-slate-600 text-sm font-semibold">
          <Receipt className="w-5 h-5 text-indigo-600" />
          <span>ใบเสร็จรับเงิน/ใบกำกับภาษีถูกต้องตามประมวลรัษฎากร</span>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          <Printer className="w-4 h-4" />
          <span>พิมพ์ใบเสร็จรับเงิน (Print Tax Receipt)</span>
        </button>
      </div>

      <div className="border border-slate-300 p-8 text-slate-900 leading-relaxed font-sans text-sm">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-slate-300 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 text-indigo-700 font-extrabold text-lg">
              <Building2 className="w-5 h-5" />
              <span>ทอมวิส คลินิกเวชกรรม (TOMVIS CLINIC)</span>
            </div>
            <p className="text-xs text-slate-600 mt-1">
              123/45 ถนนสุขุมวิท แขวงคลองเตย เขตคลองเตย กรุงเทพมหานคร 10110
            </p>
            <p className="text-xs text-slate-600">
              เลขประจำตัวผู้เสียภาษีอากร: <strong>{taxReceipt.clinicTaxId}</strong> (สาขาที่ {taxReceipt.branchNo})
            </p>
          </div>

          <div className="text-right">
            <h1 className="text-lg font-extrabold text-slate-900">ใบเสร็จรับเงิน / ใบกำกับภาษี</h1>
            <p className="text-xs font-semibold text-slate-500">RECEIPT / TAX INVOICE</p>
            <p className="text-xs font-bold text-indigo-600 mt-2">เลขที่: {taxReceipt.taxReceiptNumber}</p>
            <p className="text-xs text-slate-500">วันที่: {new Date(taxReceipt.issuedAt).toLocaleDateString('th-TH')}</p>
          </div>
        </div>

        {/* Customer Details */}
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 text-xs">
          <div>
            <div className="text-slate-500 font-semibold mb-1">ชื่อผู้ซื้อ / ผู้รับบริการ (Patient / Customer):</div>
            <div className="font-bold text-slate-900 text-sm">
              {patient.prefix}{patient.firstName} {patient.lastName} (HN: {patient.hn})
            </div>
            <div className="text-slate-600 mt-0.5">{patient.address}</div>
          </div>
          <div className="text-right">
            <div className="text-slate-500 font-semibold mb-1">เลขประจำตัวผู้เสียภาษี / PID:</div>
            <div className="font-bold text-slate-800">{taxReceipt.patientTaxId || patient.nationalId}</div>
            <div className="text-slate-500 mt-2">
              วิธีชำระเงิน: <strong className="text-slate-900">{taxReceipt.invoice.paymentMethod || 'CASH'}</strong>
            </div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="w-full text-left border-collapse text-xs mb-6">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-300">
              <th className="p-3">#</th>
              <th className="p-3">รายการ (Description)</th>
              <th className="p-3 text-center">ประเภทภาษี</th>
              <th className="p-3 text-center">จำนวน</th>
              <th className="p-3 text-right">ราคา/หน่วย</th>
              <th className="p-3 text-right">จำนวนเงิน (บาท)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {taxReceipt.invoice.prescription?.items.map((item, idx) => {
              const isVatExempt = item.medication.category !== 'Cosmetics' && item.medication.category !== 'Supplements';
              return (
                <tr key={item.id}>
                  <td className="p-3 text-slate-400">{idx + 1}</td>
                  <td className="p-3 font-medium text-slate-900">
                    {item.medication.name}
                    <div className="text-[10px] text-slate-400">{item.dosage}</div>
                  </td>
                  <td className="p-3 text-center">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${isVatExempt ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                      {isVatExempt ? 'ยกเว้น VAT (ม.81)' : 'VAT 7%'}
                    </span>
                  </td>
                  <td className="p-3 text-center">{item.quantity} {item.medication.unit}</td>
                  <td className="p-3 text-right">{item.unitPrice.toFixed(2)}</td>
                  <td className="p-3 text-right font-semibold">{item.totalPrice.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary Calculations */}
        <div className="flex justify-between items-end border-t border-slate-300 pt-4">
          <div className="text-[11px] text-slate-500 max-w-xs space-y-1">
            <div className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>ค่าบริการทางการแพทย์ ได้รับยกเว้นภาษีมูลค่าเพิ่ม</span>
            </div>
            <p>ตามมาตรา 81(1)(เว) แห่งประมวลรัษฎากร</p>
          </div>

          <div className="w-64 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ค่าตรวจรักษา/ยากลุ่มยกเว้น VAT:</span>
              <span>฿{taxReceipt.medicalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>สินค้าคิดภาษีมูลค่าเพิ่ม (Before VAT):</span>
              <span>฿{taxReceipt.taxableAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ภาษีมูลค่าเพิ่ม (VAT 7%):</span>
              <span>฿{taxReceipt.vatAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm text-slate-900 pt-2 border-t border-slate-300">
              <span>จำนวนเงินสุทธิ (Net Total):</span>
              <span className="text-indigo-700">฿{taxReceipt.netTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer Signatures */}
        <div className="mt-12 pt-8 flex justify-between items-end text-xs text-slate-500">
          <div className="text-center">
            <div>ผู้รับเงิน...................................................</div>
            <div className="mt-1">(เจ้าหน้าที่การเงิน)</div>
          </div>
          <div className="text-center">
            <div>ผู้จ่ายเงิน...................................................</div>
            <div className="mt-1">({patient.prefix}{patient.firstName} {patient.lastName})</div>
          </div>
        </div>
      </div>
    </div>
  );
}
