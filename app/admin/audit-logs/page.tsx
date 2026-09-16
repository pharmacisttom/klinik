import React from 'react';
import { ShieldCheck, Eye, Lock, FileSpreadsheet } from 'lucide-react';
import { formatThaiDateTime } from '@/lib/utils/formatters';

export default function AuditLogsPage() {
  const mockAuditLogs = [
    {
      id: 'log-001',
      user: 'Dr. Somchai Jaidee (DOCTOR)',
      action: 'VIEW_PATIENT_RECORD',
      resource: 'Patient:HN-690916-0001 (นายประณีต สุขใจ)',
      ip: '192.168.1.105',
      time: new Date(),
    },
    {
      id: 'log-002',
      user: 'Nurse Suda Care (NURSE)',
      action: 'CREATE_PATIENT',
      resource: 'Patient:HN-690916-0001',
      ip: '192.168.1.102',
      time: new Date(Date.now() - 15 * 60 * 1000),
    },
    {
      id: 'log-003',
      user: 'Pharm. Manoch Rx (PHARMACIST)',
      action: 'DISPENSE_MEDICATION',
      resource: 'Prescription:RX-9901 (Paracetamol, Amoxicillin)',
      ip: '192.168.1.108',
      time: new Date(Date.now() - 45 * 60 * 1000),
    },
    {
      id: 'log-004',
      user: 'Patient Self-Service (PATIENT)',
      action: 'EXPORT_PDPA_DATA',
      resource: 'PatientData:1100400123450',
      ip: '127.0.0.1',
      time: new Date(Date.now() - 2 * 3600 * 1000),
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">ประวัติการเข้าถึงข้อมูลผู้ป่วย (PDPA Audit Logs)</h1>
              <p className="text-slate-500 text-sm">ตรวจสอบประวัติการเปิดดู บันทึก และส่งออกข้อมูล PHI เพื่อความโปร่งใสตามกฎหมาย</p>
            </div>
          </div>
          <button
            onClick={() => alert('กำลังส่งออกไฟล์ Audit Log (.CSV)...')}
            className="px-4 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> ส่งออกไฟล์ Audit Report
          </button>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">วัน-เวลา</th>
                <th className="px-4 py-3">ผู้ใช้งาน (User & Role)</th>
                <th className="px-4 py-3">การกระทำ (Action)</th>
                <th className="px-4 py-3">ทรัพยากรข้อมูล (Resource Target)</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {mockAuditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-slate-500 font-sans">{formatThaiDateTime(log.time)}</td>
                  <td className="px-4 py-3 font-bold text-slate-900 font-sans">{log.user}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded font-semibold ${
                        log.action.includes('EXPORT')
                          ? 'bg-rose-100 text-rose-800'
                          : log.action.includes('CREATE')
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}
                    >
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-700 font-sans">{log.resource}</td>
                  <td className="px-4 py-3 text-slate-500">{log.ip}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
