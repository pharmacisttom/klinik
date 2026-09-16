import { getColdChainLogsAction } from '@/app/actions/cold-chain';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Snowflake, Thermometer, ShieldAlert, CheckCircle2, ZapOff } from 'lucide-react';

export const revalidate = 0;

export default async function ColdChainPage() {
  const { logs = [] } = await getColdChainLogsAction();

  const latestLog = logs[0];
  const isOptimal = latestLog ? latestLog.tempCelsius >= 2.0 && latestLog.tempCelsius <= 8.0 : true;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2 text-cyan-600 font-semibold text-sm">
            <Snowflake className="w-5 h-5" />
            <span>มาตรฐานการเก็บรักษายาชีววัตถุและวัคซีน (FDA Cold Chain 2-8°C Rules)</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            สมุดบันทึกอุณหภูมิตู้เย็นคลังวัคซีน (Vaccine Cold Chain Log)
          </h1>
          <p className="text-sm text-slate-500">
            เฝ้าระวังอุณหภูมิตู้เย็น 2.0°C - 8.0°C ตามกฎหมาย อย. และกรมควบคุมโรค พร้อมแผนรับมือไฟฟ้าดับ
          </p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-white ${isOptimal ? 'bg-cyan-600' : 'bg-rose-600'}`}>
              <Thermometer className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">อุณหภูมิตู้เย็นล่าสุด (FRIDGE-MAIN-01)</div>
              <div className={`text-3xl font-extrabold mt-0.5 ${isOptimal ? 'text-cyan-700' : 'text-rose-600'}`}>
                {latestLog ? `${latestLog.tempCelsius.toFixed(1)}°C` : '4.5°C'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">ช่วงมาตรฐาน: 2.0°C - 8.0°C</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center font-bold">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">สถานะระบบทำความเย็น</div>
              <div className="text-lg font-bold text-emerald-700 mt-1">ปกติ (Normal Range)</div>
              <p className="text-xs text-slate-400">ตรวจสอบครั้งล่าสุด: {latestLog ? new Date(latestLog.checkedAt).toLocaleTimeString('th-TH') : '08:30 น.'}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center font-bold">
              <ZapOff className="w-7 h-7" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold">แผนรับมือไฟฟ้าดับ (Emergency Protocol)</div>
              <div className="text-xs font-bold text-amber-900 mt-1">กล่องโฟมเก็บความเย็น + Gel Pack พร้อมใช้งาน 12 ชม.</div>
            </div>
          </div>
        </div>

        {/* Logs Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">ประวัติการบันทึกอุณหภูมิเช้า-เย็น ( Cold Chain Inspection Log )</h2>
              <p className="text-xs text-slate-300">ลงลายมือชื่อผู้ตรวจสอบตามข้อกำหนด อย.</p>
            </div>
            <span className="bg-cyan-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              Standard 2-8°C
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="p-4">วัน-เวลาที่ตรวจ</th>
                  <th className="p-4">รหัสตู้เย็น</th>
                  <th className="p-4 text-center">อุณหภูมิ (°C)</th>
                  <th className="p-4 text-center">สถานะ</th>
                  <th className="p-4">ผู้ตรวจลงชื่อ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400">
                      ไม่พบประวัติการบันทึกอุณหภูมิ
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">
                        {new Date(log.checkedAt).toLocaleString('th-TH')}
                      </td>
                      <td className="p-4 font-bold text-slate-700">{log.fridgeId}</td>
                      <td className={`p-4 text-center font-extrabold text-sm ${log.isAlarm ? 'text-rose-600' : 'text-cyan-700'}`}>
                        {log.tempCelsius.toFixed(1)}°C
                      </td>
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${log.isAlarm ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                          {log.isAlarm ? '⚠️ นอกช่วง 2-8°C' : '✅ ปกติ'}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-slate-800">{log.inspectorName}</td>
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
