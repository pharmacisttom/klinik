import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { HeartPulse, CalendarCheck, AlertTriangle, Eye, Footprints, Activity } from 'lucide-react';

export const revalidate = 0;

export default async function NcdRegistryPage() {
  const registries = await prisma.chronicRegistry.findMany({
    include: { patient: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
            <HeartPulse className="w-5 h-5" />
            <span>สปสช. NCD Quality Framework & MOPH Standard</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            ทะเบียนผู้ป่วยโรคเรื้อรัง DM / HT (NCD Registry Dashboard)
          </h1>
          <p className="text-sm text-slate-500">
            ติดตามการตรวจประเมินภาวะแทรกซ้อนประจำปี (HbA1c, Lipid, EGFR, ตรวจตา, ตรวจเท้า) ตามมาตรฐาน สปสช.
          </p>
        </div>

        {/* NCD Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center font-bold">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">ผู้ป่วยเบาหวาน/ความดันในระบบ</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{registries.length} คน</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center font-bold">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">อัตราการตรวจ HbA1c ครบตามกำหนด</div>
              <div className="text-2xl font-extrabold text-emerald-600 mt-0.5">85%</div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">ครบกำหนดตรวจประเมินตา/เท้าปีนี้</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-0.5">3 คน</div>
            </div>
          </div>
        </div>

        {/* Patient NCD Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">รายชื่อผู้ป่วยในทะเบียน NCD</h2>
              <p className="text-xs text-slate-300">แสดงผลตรวจแล็บและประวัติคัดกรองภาวะแทรกซ้อน</p>
            </div>
            <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              NCD Clinic Target
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="p-4">ผู้ป่วย (HN)</th>
                  <th className="p-4">โรคเรื้อรัง (ICD-10-TM)</th>
                  <th className="p-4 text-center">HbA1c ล่าสุด</th>
                  <th className="p-4 text-center">eGFR ล่าสุด</th>
                  <th className="p-4 text-center">ตรวจตาประจำปี</th>
                  <th className="p-4 text-center">ตรวจเท้าประจำปี</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {registries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      ไม่พบผู้ป่วยในทะเบียนโรคเรื้อรัง
                    </td>
                  </tr>
                ) : (
                  registries.map((reg) => (
                    <tr key={reg.id} className="hover:bg-slate-50">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{reg.patient.prefix}{reg.patient.firstName} {reg.patient.lastName}</div>
                        <div className="text-slate-400">HN: {reg.patient.hn}</div>
                      </td>
                      <td className="p-4">
                        <span className="font-semibold text-slate-800">{reg.diseaseCode}</span>
                        <div className="text-slate-500 text-[11px]">{reg.diseaseName}</div>
                      </td>
                      <td className="p-4 text-center font-bold text-emerald-600">
                        {reg.lastHbA1cVal ? `${reg.lastHbA1cVal}%` : 'ยังไม่ได้ตรวจ'}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-800">
                        {reg.lastEgfrVal ? `${reg.lastEgfrVal} ml/min` : '-'}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                          <Eye className="w-3.5 h-3.5" />
                          <span>ตรวจแล้ว</span>
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2 py-1 rounded">
                          <Footprints className="w-3.5 h-3.5" />
                          <span>ตรวจแล้ว</span>
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
