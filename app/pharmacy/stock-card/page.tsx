import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Layers, ArrowUpRight, ArrowDownLeft, FileSpreadsheet, PackageCheck } from 'lucide-react';

export const revalidate = 0;

export default async function StockCardPage() {
  const stockCards = await prisma.stockCard.findMany({
    include: { medication: true },
    orderBy: { createdAt: 'desc' },
    take: 100,
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        <div className="pb-6 border-b border-slate-200 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm">
              <Layers className="w-5 h-5" />
              <span>ระบบบริหารจัดการคลังยาตามระเบียบพัสดุ & FEFO Rules</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 mt-1">
              บัตรคลังยาอิเล็กทรอนิกส์ (Electronic Stock Card)
            </h1>
            <p className="text-sm text-slate-500">
              สมุดบัญชีคุมการรับ-จ่ายยา ตัดสต็อกยาหมดอายุก่อน (First-Expired, First-Out) และตรวจสอบยอดยกมา
            </p>
          </div>

          <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition">
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออกบัตรคลังยา (Stock Card PDF/Excel)</span>
          </button>
        </div>

        {/* Stock Movement Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-200 bg-slate-900 text-white flex justify-between items-center">
            <div>
              <h2 className="font-bold text-lg">ประวัติการเคลื่อนไหวคลังยา (Stock Movement Ledger)</h2>
              <p className="text-xs text-slate-300">แสดงการรับเข้า จ่ายออก ยอดยกมา พร้อมเลขที่เอกสารอ้างอิง</p>
            </div>
            <span className="bg-indigo-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              FEFO Automatic Selection
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-xs">
                <tr>
                  <th className="p-4">วัน-เวลาที่ทำรายการ</th>
                  <th className="p-4">รายการยา / TMT</th>
                  <th className="p-4">ประเภทรายการ</th>
                  <th className="p-4">เอกสารอ้างอิง</th>
                  <th className="p-4 text-center text-emerald-700">รับเข้า (+)</th>
                  <th className="p-4 text-center text-rose-600">จ่ายออก (-)</th>
                  <th className="p-4 text-center text-slate-900">คงเหลือ</th>
                  <th className="p-4">ผู้ทำรายการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-xs">
                {stockCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      ไม่พบรายการเคลื่อนไหวในบัตรคลังยา
                    </td>
                  </tr>
                ) : (
                  stockCards.map((card) => (
                    <tr key={card.id} className="hover:bg-slate-50">
                      <td className="p-4 font-medium text-slate-900">
                        {new Date(card.createdAt).toLocaleString('th-TH')}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{card.medication.name}</div>
                        <div className="text-[10px] text-slate-400">TMT: {card.medication.tmtCode || '-'}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800">
                        {card.movementType === 'RECEIVE_LOT' && <span className="text-emerald-700 flex items-center gap-1"><ArrowDownLeft className="w-4 h-4" /> รับเข้าคลัง</span>}
                        {card.movementType === 'DISPENSE_PRESCRIPTION' && <span className="text-rose-600 flex items-center gap-1"><ArrowUpRight className="w-4 h-4" /> จ่ายตามใบสั่งยา</span>}
                      </td>
                      <td className="p-4 font-mono text-slate-700">{card.referenceDoc}</td>
                      <td className="p-4 text-center font-bold text-emerald-700">
                        {card.inQty > 0 ? `+${card.inQty}` : '-'}
                      </td>
                      <td className="p-4 text-center font-bold text-rose-600">
                        {card.outQty > 0 ? `-${card.outQty}` : '-'}
                      </td>
                      <td className="p-4 text-center font-extrabold text-slate-900">
                        {card.balanceQty} {card.medication.unit}
                      </td>
                      <td className="p-4 font-medium text-slate-800">{card.operatorName}</td>
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
