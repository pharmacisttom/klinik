import { generateMoph43Export } from '@/lib/exporters/moph-43-exporter';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Database, Download, FileText, CheckCircle2, ShieldCheck } from 'lucide-react';

export default async function AdminExportsPage() {
  const exportData = await generateMoph43Export();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200 mb-6">
          <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
            <Database className="w-5 h-5" />
            <span>กระทรวงสาธารณสุข & สปสช. Interoperability Hub</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
            ศูนย์ส่งออกข้อมูลมาตรฐาน 43 แฟ้ม & e-Claim
          </h1>
          <p className="text-sm text-slate-500">
            ส่งออกไฟล์ข้อมูลมาตรฐานสาธารณสุขเพื่อรายงาน HDC, 506 Surveillance และประกอบการเบิกจ่าย e-Claim
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">จำนวนระเบียนข้อมูลพร้อมส่งออก</div>
            <div className="text-3xl font-extrabold text-indigo-600 mt-2">{exportData.totalRecords}</div>
            <p className="text-xs text-slate-400 mt-1">ครอบคลุม PERSON, SERVICE, DIAGNOSIS, DRUG</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">สถานะมาตรฐานข้อมูล (MOPH Standard)</div>
            <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-lg mt-2">
              <CheckCircle2 className="w-5 h-5" />
              <span>43 แฟ้ม (โครงสร้าง พ.ศ. 2566)</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">รูปแบบ Pipe-delimited UTF-8 Text</p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="text-slate-500 text-xs font-semibold">การรักษาความปลอดภัย (PDPA Security)</div>
            <div className="flex items-center gap-1.5 text-slate-800 font-bold text-lg mt-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              <span>ผ่านการบันทึก Audit Log</span>
            </div>
            <p className="text-xs text-slate-400 mt-1">เข้ารหัสก่อนการจัดส่ง</p>
          </div>
        </div>

        {/* 43 Files Preview & Export Boxes */}
        <section className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                <FileText className="w-5 h-5 text-indigo-600" />
                <span>แฟ้มประวัติผู้รับบริการ (PERSON.txt)</span>
              </div>
              <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด PERSON.txt</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto font-mono">
              {exportData.personTxt}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>แฟ้มวินิจฉัยโรคผู้ป่วยนอก (DIAGNOSIS_OPD.txt)</span>
              </div>
              <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด DIAGNOSIS_OPD.txt</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto font-mono">
              {exportData.diagnosisOpdTxt}
            </pre>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-lg">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>แฟ้มประวัติการจ่ายยาผู้ป่วยนอก (DRUG_OPD.txt)</span>
              </div>
              <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition">
                <Download className="w-4 h-4" />
                <span>ดาวน์โหลด DRUG_OPD.txt</span>
              </button>
            </div>
            <pre className="bg-slate-900 text-slate-200 p-4 rounded-xl text-xs overflow-x-auto font-mono">
              {exportData.drugOpdTxt}
            </pre>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
