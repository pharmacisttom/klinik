'use client';

import React, { useState, useEffect } from 'react';
import {
  generateCustomReportAction,
  getPresetReportTemplatesAction,
  parseImportedReportTemplateAction,
} from '@/app/actions/reports';
import { ReportColumnConfig, ReportTemplateDefinition } from '@/lib/reports/report-builder';

export default function CustomReportBuilderPage() {
  const [presetTemplates, setPresetTemplates] = useState<ReportTemplateDefinition[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<string>('PATIENT');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [columns, setColumns] = useState<ReportColumnConfig[]>([
    { field: 'hn', label: 'HN' },
    { field: 'firstName', label: 'ชื่อ' },
    { field: 'lastName', label: 'นามสกุล' },
    { field: 'nationalId', label: 'เลขบัตรประชาชน', transform: 'MASK_CID' },
    { field: 'phone', label: 'เบอร์โทรศัพท์', transform: 'MASK_PHONE' },
    { field: 'createdAt', label: 'วันที่ลงทะเบียน', transform: 'DATE_TH' },
  ]);

  const [reportData, setReportData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [importError, setImportError] = useState<string | null>(null);

  useEffect(() => {
    loadPresets();
  }, []);

  async function loadPresets() {
    const res = await getPresetReportTemplatesAction();
    if (res.success) {
      setPresetTemplates(res.templates);
    }
  }

  function handleEntityChange(newEntity: string) {
    setSelectedEntity(newEntity);
    switch (newEntity) {
      case 'PATIENT':
        setColumns([
          { field: 'hn', label: 'HN' },
          { field: 'firstName', label: 'ชื่อ' },
          { field: 'lastName', label: 'นามสกุล' },
          { field: 'nationalId', label: 'เลขบัตรประชาชน', transform: 'MASK_CID' },
          { field: 'phone', label: 'เบอร์โทรศัพท์', transform: 'MASK_PHONE' },
          { field: 'createdAt', label: 'วันที่ลงทะเบียน', transform: 'DATE_TH' },
        ]);
        break;
      case 'INVOICE':
        setColumns([
          { field: 'invoiceNumber', label: 'เลขที่ใบเสร็จ' },
          { field: 'patient.hn', label: 'HN' },
          { field: 'netAmount', label: 'ยอดสุทธิ (บาท)', transform: 'CURRENCY' },
          { field: 'paymentMethod', label: 'วิธีชำระเงิน' },
          { field: 'createdAt', label: 'วันที่ออกใบเสร็จ', transform: 'DATE_TH' },
        ]);
        break;
      case 'CONTROLLED_DRUG':
        setColumns([
          { field: 'createdAt', label: 'วันที่/เวลา', transform: 'DATE_TH' },
          { field: 'medication.name', label: 'ชื่อยา' },
          { field: 'patient.hn', label: 'HN' },
          { field: 'quantity', label: 'จำนวน' },
          { field: 'balanceAfter', label: 'คงเหลือ' },
          { field: 'doctor.name', label: 'แพทย์ผู้สั่ง' },
        ]);
        break;
      default:
        break;
    }
  }

  function applyPreset(tpl: ReportTemplateDefinition) {
    setSelectedEntity(tpl.entity);
    setColumns(tpl.columns);
  }

  async function handleImportTemplate(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError(null);
    const text = await file.text();
    const res = await parseImportedReportTemplateAction(text);

    if (res.success && res.template) {
      applyPreset(res.template);
    } else {
      setImportError(res.error || 'ไม่สามารถนำเข้าเทมเพลตได้');
    }
  }

  async function handleGenerateReport() {
    setLoading(true);
    const res = await generateCustomReportAction(selectedEntity, columns, { startDate, endDate });
    if (res.success && res.data) {
      setReportData(res.data);
    }
    setLoading(false);
  }

  function exportToCSV() {
    if (reportData.length === 0) return;
    const headers = Object.keys(reportData[0]).join(',');
    const rows = reportData.map((row) => Object.values(row).map((val) => `"${val}"`).join(','));
    const csvContent = '\uFEFF' + [headers, ...rows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `tomvis_custom_report_${selectedEntity.toLowerCase()}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-2xl text-2xl">
              📊
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">ระบบสร้างและออกแบบรายงานอัจฉริยะ (Intelligent Report Builder)</h1>
              <p className="text-xs text-slate-400">Custom Dynamic Query Engine & Intelligent Template Importer</p>
            </div>
          </div>

          {/* Import Template Button */}
          <label className="cursor-pointer px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs rounded-xl flex items-center gap-2 transition-all">
            <span>📥 นำเข้าแม่แบบรายงาน (JSON Template)</span>
            <input type="file" accept=".json" onChange={handleImportTemplate} className="hidden" />
          </label>
        </div>

        {importError && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-300 rounded-2xl text-xs">
            ⚠️ {importError}
          </div>
        )}

        {/* Preset Templates */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
          <h2 className="text-sm font-bold text-slate-300">แม่แบบรายงานมาตรฐานทางการแพทย์ (Preset Templates)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {presetTemplates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => applyPreset(tpl)}
                className="text-left p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50 rounded-2xl transition-all group"
              >
                <span className="font-bold text-xs text-indigo-300 group-hover:text-indigo-200 block mb-1">
                  {tpl.name}
                </span>
                <p className="text-[11px] text-slate-400 line-clamp-2">{tpl.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Builder Controls */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
          <h2 className="text-sm font-bold text-slate-300">กำหนดเงื่อนไขและคอลัมน์รายงาน (Custom Filters & Columns)</h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-slate-400 block mb-1.5">เลือกประเภทข้อมูล (Entity Target)</label>
              <select
                value={selectedEntity}
                onChange={(e) => handleEntityChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              >
                <option value="PATIENT">ทะเบียนผู้ป่วย (Patient Master)</option>
                <option value="INVOICE">การเงินและใบเสร็จ (Invoices & Receipts)</option>
                <option value="CONTROLLED_DRUG">คุมวัตถุออกฤทธิ์ฯ (Controlled Drug Logs)</option>
                <option value="NCD_REGISTRY">คลินิกโรคเรื้อรัง (NCD Registry)</option>
                <option value="COLD_CHAIN">อุณหภูมิตู้เย็นคลังยา (Cold Chain Logs)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">ตั้งแต่วันที่</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs text-slate-400 block mb-1.5">ถึงวันที่</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <button
              onClick={handleGenerateReport}
              disabled={loading}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-900/30 flex items-center gap-2 transition-all"
            >
              {loading ? 'กำลังประมวลผลรายงาน...' : '⚡ ประมวลผลสร้างรายงาน (Generate Report)'}
            </button>

            {reportData.length > 0 && (
              <button
                onClick={exportToCSV}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-900/30 flex items-center gap-2 transition-all"
              >
                <span>💾 ส่งออกเป็น CSV / Excel</span>
              </button>
            )}
          </div>
        </div>

        {/* Report Preview Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-300">ตัวอย่างรายงานและผลลัพธ์ (Report Output Preview)</h2>
            <span className="text-xs text-slate-400">รวมทั้งหมด {reportData.length} แถว</span>
          </div>

          {reportData.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs border border-dashed border-slate-800 rounded-2xl">
              กดปุ่ม "ประมวลผลสร้างรายงาน" เพื่อแสดงผลลัพธ์ข้อมูลตามเงื่อนไขที่เลือก
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 sticky top-0">
                  <tr>
                    {Object.keys(reportData[0]).map((header) => (
                      <th key={header} className="p-3">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {reportData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                      {Object.values(row).map((val: any, cIdx) => (
                        <td key={cIdx} className="p-3">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
