'use client';

import React, { useEffect, useState } from 'react';
import { getAuditLogsAction } from '@/app/actions/clinical';
import { ShieldCheck, FileSpreadsheet, Search, RefreshCw } from 'lucide-react';

interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  resource: string;
  ipAddress: string | null;
  createdAt: Date | string;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchLogs = async (searchQuery?: string) => {
    setLoading(true);
    const res = await getAuditLogsAction(searchQuery);
    setLoading(false);

    if (res.success && res.logs) {
      setLogs(res.logs as any);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchLogs(query);
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;

    const headers = ['ID', 'CreatedAt', 'UserId', 'Action', 'Resource', 'IPAddress'];
    const rows = logs.map((log) => [
      log.id,
      new Date(log.createdAt).toISOString(),
      log.userId,
      log.action,
      log.resource,
      log.ipAddress || 'N/A',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pdpa_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            type="button"
            onClick={handleExportCSV}
            className="px-4 py-2 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-xl border border-emerald-200 transition flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-4 h-4" /> ส่งออกไฟล์ Audit Report (.CSV)
          </button>
        </div>

        {/* Filter & Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ค้นหาด้วย Action (e.g. CREATE_PATIENT, DISPENSE_MEDICATION), User ID หรือ Resource..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-slate-900 outline-none text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 text-white font-semibold text-sm rounded-xl hover:bg-slate-800 transition flex items-center gap-1"
          >
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'ค้นหา'}
          </button>
        </form>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">วัน-เวลา</th>
                <th className="px-4 py-3">ผู้ใช้งาน (User ID)</th>
                <th className="px-4 py-3">การกระทำ (Action)</th>
                <th className="px-4 py-3">ทรัพยากรข้อมูล (Resource Target)</th>
                <th className="px-4 py-3">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-mono text-xs">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400 font-sans">
                    ไม่พบบันทึกประวัติ Audit Log
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-slate-500 font-sans">
                      {new Date(log.createdAt).toLocaleString('th-TH')}
                    </td>
                    <td className="px-4 py-3 font-bold text-slate-900 font-sans">{log.userId}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded font-semibold ${
                          log.action.includes('EXPORT') || log.action.includes('ERASURE')
                            ? 'bg-rose-100 text-rose-800'
                            : log.action.includes('CREATE') || log.action.includes('RECORD')
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.action.includes('DISPENSE') || log.action.includes('DOCTOR')
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-700 font-sans">{log.resource}</td>
                    <td className="px-4 py-3 text-slate-500">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
