import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm border-t border-slate-800 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold text-lg mb-2">Klinik EMR System</h3>
            <p className="text-xs text-slate-400">
              ระบบบริหารจัดการคลินิกเวชกรรมครบวงจร ปลอดภัยตามมาตรฐาน PDPA และกฎหมายสถานพยาบาล
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">บริการคลินิก</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/booking" className="hover:text-emerald-400 transition">ลงทะเบียนนัดหมาย</Link></li>
              <li><Link href="/nurse/screening" className="hover:text-emerald-400 transition">จุดคัดกรองพยาบาล</Link></li>
              <li><Link href="/doctor/consultation" className="hover:text-emerald-400 transition">ห้องตรวจวินิจฉัยโรค</Link></li>
              <li><Link href="/pharmacy" className="hover:text-emerald-400 transition">คลังยาและจ่ายยา</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">ข้อกำหนดและกฎหมาย (PDPA)</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/privacy" className="hover:text-emerald-400 transition">นโยบายความเป็นส่วนตัว (Privacy Policy)</Link></li>
              <li><Link href="/terms" className="hover:text-emerald-400 transition">ข้อตกลงการใช้บริการ (Terms of Service)</Link></li>
              <li><Link href="/pdpa/data-request" className="hover:text-emerald-400 transition">พอร์ตัลใช้สิทธิ์ข้อมูลส่วนบุคคล</Link></li>
              <li><Link href="/admin/license" className="hover:text-emerald-400 text-emerald-400 font-semibold transition flex items-center gap-1 mt-1"><span>📜 ใบอนุญาตลิขสิทธิ์ระบบ (System License)</span></Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">ติดต่อคลินิก</h4>
            <p className="text-xs text-slate-400">เปิดบริการ: จันทร์ - อาทิตย์ 08:00 - 20:00 น.</p>
            <p className="text-xs text-slate-400 mt-1">โทรศัพท์: 02-123-4567</p>
            <p className="text-xs text-slate-400">อีเมล: info@klinik.local</p>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} Tomvis Clinic Medical System. All rights reserved.</div>
          <div>
            <Link href="/admin/license" className="text-slate-400 hover:text-emerald-400 transition underline font-mono text-[11px]">
              Tomvis Enterprise License Verification Ref: MOPH-TH-PDPA-2026
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
