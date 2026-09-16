import { getControlledDrugLogsAction, getDrugLotsAction } from '@/app/actions/pharmacy-fda';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ShieldAlert, Calendar, FileSpreadsheet, Package } from 'lucide-react';

export default async function ControlledDrugsPage() {
  const { logs = [] } = await getControlledDrugLogsAction();
  const { lots = [] } = await getDrugLotsAction();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-rose-600 font-semibold text-sm">
              <ShieldAlert className="w-5 h-5" />
              <span>อย. Good Pharmacy Practice (GPP) Compliance</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              สมุดบัญชีควบคุมยาเสพติดและวัตถุออกฤทธิ์ฯ (ข.ด.9 / ข.ด.11)
            </h1>
            <p className="text-sm text-slate-500">
              รายงานการสั่งจ่ายยาควบคุมและตรวจสอบ Lot วันหมดอายุตามกฎหมายสำนักงานคณะกรรมการอาหารและยา
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-sm transition">
              <FileSpreadsheet className="w-4 h-4" />
              <span>ส่งออกรายงาน อย. (PDF / Excel)</span>
            </button>
          </div>
        </div>

        {/* Drug Lot Expiry Summary Cards */}
        <section className="mb-8">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-500" />
            <span>คลังยาล็อตปัจจุบัน & วันหมดอายุ (Drug Lot & Expiration)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lots.map((lot) => (
              <div key={lot.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                      {lot.medication.code}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">
                      เหลือ {lot.currentQuantity} {lot.medication.unit}
                    </span>
                  </div>
                  <h3 className="font-bold text-slate-900 mt-2">{lot.medication.name}</h3>
                  <p className="text-xs text-slate-500">Reg No: {lot.medication.fdaRegNo || '1A 123/45'}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-600">
                  <span>Lot: <strong className="text-slate-800">{lot.lotNumber}</strong></span>
                  <span className="flex items-center gap-1 text-rose-600 font-medium">
                    <Calendar className="w-3.5 h-3.5" />
                    Exp: {new Date(lot.expiryDate).toLocaleDateString('th-TH')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Controlled Drugs Logbook Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
            <div>
              <h2 className="text-lg font-bold">ทะเบียนบัญชีรับ-จ่ายยาควบคุม (ข.ด.9)</h2>
              <p className="text-xs text-slate-300">แสดงรายการจ่ายยาให้แก่ผู้ป่วยพร้อมเลขที่ใบสั่งยาและแพทย์ผู้สั่ง</p>
            </div>
            <span className="bg-rose-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              วัตถุออกฤทธิ์ประเภท 2-4
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 sm:p-4">วัน-เวลาที่จ่าย</th>
                  <th className="p-3 sm:p-4">รายการยา / Reg No</th>
                  <th className="p-3 sm:p-4">ชื่อผู้ป่วย (HN)</th>
                  <th className="p-3 sm:p-4">แพทย์ผู้สั่งจ่าย (ใบประกอบฯ)</th>
                  <th className="p-3 sm:p-4 text-center">จำนวนจ่าย</th>
                  <th className="p-3 sm:p-4 text-center">คงเหลือ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      ไม่พบประวัติการจ่ายยาควบคุมในระบบ
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-3 sm:p-4 text-xs font-medium">
                        {new Date(log.createdAt).toLocaleString('th-TH')}
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-semibold text-slate-900">{log.medication.name}</div>
                        <div className="text-xs text-slate-400">{log.medication.fdaRegNo || '2A 789/55'}</div>
                      </td>
                      <td className="p-3 sm:p-4">
                        <div className="font-medium text-slate-800">{log.patient.prefix}{log.patient.firstName} {log.patient.lastName}</div>
                        <div className="text-xs text-slate-400">HN: {log.patient.hn}</div>
                      </td>
                      <td className="p-3 sm:p-4 text-xs">
                        <div className="font-medium text-slate-800">{log.doctor.name}</div>
                        <div className="text-slate-400">ว. 45678</div>
                      </td>
                      <td className="p-3 sm:p-4 text-center font-bold text-rose-600">
                        -{log.quantity} {log.medication.unit}
                      </td>
                      <td className="p-3 sm:p-4 text-center font-bold text-slate-900">
                        {log.balanceAfter} {log.medication.unit}
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
