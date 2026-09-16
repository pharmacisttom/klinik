import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldAlert, AlertCircle, FileCheck, ExternalLink } from 'lucide-react';

export const revalidate = 0;

export default async function AdrReportPage() {
  const reports = await prisma.adrReport.findMany({
    include: { patient: true, medication: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>ศูนย์เฝ้าระวังความปลอดภัยด้านผลิตภัณฑ์สุขภาพ (HPVC / Thai-Pv อย.)</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              รายงานอาการไม่พึงประสงค์จากการใช้ยา (ADR & Naranjo Causality)
            </h1>
            <p className="text-sm text-slate-500">
              ประเมินระดับความสัมพันธ์ของยากับการเกิดแพ้ยาตาม Naranjo Score และส่งออกไฟล์รายงาน Thai-Pv ส่ง อย.
            </p>
          </div>

          <button className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition">
            <ExternalLink className="w-4 h-4" />
            <span>ส่งออกรายงาน Thai-Pv (ส่ง อย.)</span>
          </button>
        </div>

        {/* ADR Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">รายการผู้ป่วยที่มีรายงานแพ้ยา/ADR (Adverse Drug Reactions)</h2>
              <p className="text-xs text-slate-300">แสดงคะแนน Naranjo Scale และระดับความรุนแรงของอาการ</p>
            </div>
            <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              HPVC Surveillance Active
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="p-4">วันที่รายงาน</th>
                  <th className="p-4">ผู้ป่วย (HN)</th>
                  <th className="p-4">ยาสงสัย (Suspected Drug)</th>
                  <th className="p-4">อาการไม่พึงประสงค์ (ADR Symptoms)</th>
                  <th className="p-4 text-center">Naranjo Score</th>
                  <th className="p-4 text-center">ระดับความสัมพันธ์ (Causality)</th>
                  <th className="p-4 text-center">สถานะรายงาน อย.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {reports.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      ไม่พบประวัติการรายงาน ADR ในระบบ
                    </td>
                  </tr>
                ) : (
                  reports.map((rep) => (
                    <tr key={rep.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">
                        {new Date(rep.createdAt).toLocaleDateString('th-TH')}
                      </td>
                      <td className="p-4 font-bold text-slate-800">
                        {rep.patient.prefix}{rep.patient.firstName} {rep.patient.lastName}
                        <div className="text-slate-400 font-normal">HN: {rep.patient.hn}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-rose-700">{rep.medication.name}</div>
                        <div className="text-[10px] text-slate-400">{rep.medication.genericName}</div>
                      </td>
                      <td className="p-4 font-medium text-slate-900">{rep.reactionDesc}</td>
                      <td className="p-4 text-center font-extrabold text-slate-900 text-sm">
                        {rep.naranjoScore} คะแนน
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-1 rounded text-[11px] font-bold ${
                          rep.causality === 'DEFINITE' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {rep.causality === 'DEFINITE' ? 'แน่นอน (Definite)' : 'ค่อนข้างแน่นอน (Probable)'}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>รายงาน อย.แล้ว</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
