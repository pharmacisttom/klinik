import React from 'react';
import Link from 'next/link';
import { Activity, Stethoscope, UserCheck, Pill, CreditCard, ShieldCheck, FileText, ArrowRight, HeartPulse, Sparkles } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-900 via-teal-950 to-slate-900 text-white py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/20 via-transparent to-transparent"></div>
        <div className="max-w-6xl mx-auto relative z-10 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>ระบบสารสนเทศคลินิกเวชกรรม ยุคใหม่ 2026</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            บริหารจัดการคลินิกอย่างมีประสิทธิภาพ <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              ปลอดภัย ปฏิบัติตามกฎหมาย PDPA 100%
            </span>
          </h1>

          <p className="max-w-3xl mx-auto text-lg text-slate-300">
            ระบบ Klinik รวมกระบวนการทำงานของคลินิกเวชกรรมไว้ในที่เดียว ตั้งแต่การลงทะเบียนคัดกรองพยาบาล 
            ห้องตรวจวินิจฉัยโรค (ICD-10) การสั่งและตัดสต๊อกคลังยาอัตโนมัติ ออกใบเสร็จรับเงิน และการคุ้มครองข้อมูลสุขภาพผู้ป่วย (PHI)
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/booking"
              className="px-6 py-3.5 rounded-xl gradient-bg text-white font-semibold hover:opacity-95 transition shadow-lg shadow-emerald-600/30 flex items-center gap-2"
            >
              <span>เริ่มต้นลงทะเบียนผู้ป่วย / จองคิว</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/doctor/consultation"
              className="px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold border border-slate-700 transition"
            >
              เข้าสู่ห้องตรวจแพทย์
            </Link>
          </div>
        </div>
      </section>

      {/* Role Workspaces Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900">พื้นที่ทำงานแยกตามบทบาท (Role Workspaces)</h2>
          <p className="text-slate-600 mt-2">คลิกเพื่อเข้าสู่ระบบงานตามสิทธิ์หน้าที่การทำงาน</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Triage & Nurse */}
          <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition group border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <UserCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">1. ซักประวัติ & คัดกรอง (Triage)</h3>
            <p className="text-sm text-slate-600 mb-4">
              สำหรับพยาบาลและเจ้าหน้าที่ต้อนรับ: ลงทะเบียนผู้ป่วย ตรวจสอบเลขบัตรประชาชน 13 หลัก บันทึกสัญญาณชีพ (BP, HR, Temp)
            </p>
            <Link
              href="/nurse/screening"
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700"
            >
              เข้าสู่ระบบคัดกรองพยาบาล <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 2: Doctor Consultation */}
          <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition group border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-cyan-100 text-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Stethoscope className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">2. ห้องตรวจวินิจฉัยแพทย์</h3>
            <p className="text-sm text-slate-600 mb-4">
              สำหรับแพทย์: ตรวจสอบอาการสำคัญ (Chief Complaint) ค้นหารหัสโรค ICD-10 สั่งจ่ายยา และบันทึกคำแนะนำการรักษา
            </p>
            <Link
              href="/doctor/consultation"
              className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:text-cyan-700"
            >
              เข้าสู่ห้องตรวจแพทย์ <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 3: Pharmacy */}
          <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition group border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Pill className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">3. ห้องยา & คลังยา (Pharmacy)</h3>
            <p className="text-sm text-slate-600 mb-4">
              สำหรับเภสัชกร: ตรวจสอบรายการยาในคิว ตัดสต๊อกยาอัตโนมัติ ตรวจเช็คยาหมดสต๊อก และพิมพ์ฉลากยา
            </p>
            <Link
              href="/pharmacy"
              className="inline-flex items-center gap-1 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              เข้าสู่คลังยาและจ่ายยา <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 4: Billing */}
          <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition group border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CreditCard className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">4. การเงิน & ออกใบเสร็จ</h3>
            <p className="text-sm text-slate-600 mb-4">
              สำหรับเจ้าหน้าที่การเงิน: คิดเงินค่ารักษา ออกใบเสร็จรับเงิน ชำระเงินด้วยเงินสด หรือสแกน QR PromptPay
            </p>
            <Link
              href="/cashier"
              className="inline-flex items-center gap-1 text-sm font-semibold text-amber-600 hover:text-amber-700"
            >
              เข้าสู่ระบบการเงิน <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 5: PDPA Data Access Request */}
          <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition group border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">5. พอร์ตัลใช้สิทธิ์ PDPA</h3>
            <p className="text-sm text-slate-600 mb-4">
              สำหรับผู้ป่วย: ยื่นคำขอดาวน์โหลดสำเนาประวัติการรักษาพยาบาล หรือขอให้ลบข้อมูลส่วนบุคคล (Legal Hold 10 ปี)
            </p>
            <Link
              href="/pdpa/data-request"
              className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 hover:text-rose-700"
            >
              เข้าสู่ศูนย์บริการสิทธิ์ PDPA <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Card 6: Audit Logs */}
          <div className="glass-card p-6 rounded-2xl hover:shadow-xl transition group border border-slate-200">
            <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">6. บันทึกประวัติการเข้าถึง (Audit Logs)</h3>
            <p className="text-sm text-slate-600 mb-4">
              สำหรับผู้ดูแลระบบ (Admin/DPO): ตรวจสอบ Audit Log การเปิดดู แก้ไข หรือส่งออกข้อมูลสุขภาพผู้ป่วย
            </p>
            <Link
              href="/admin/audit-logs"
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-700 hover:text-slate-900"
            >
              ดู Audit Logs ทั้งหมด <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Admin Backend Console Hub */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 text-white shadow-2xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                🔑 ADMIN BACKEND CONSOLE
              </div>
              <h2 className="text-2xl font-bold text-white">ศูนย์รวมเมนูการจัดการระบบหลังบ้าน (Backend Admin Hub)</h2>
              <p className="text-sm text-slate-400 mt-1">
                ช่องทางสำหรับผู้ดูแลระบบ (Admin) ในการบริหารจัดการฐานข้อมูล การสำรองข้อมูล และรายงานความปลอดภัย
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              href="/admin/audit-logs"
              className="p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition group"
            >
              <span className="text-2xl mb-2 block">🛡️</span>
              <h3 className="font-bold text-sm text-emerald-400 group-hover:text-emerald-300">1. ประวัติการเข้าถึง (Audit Logs)</h3>
              <p className="text-xs text-slate-400 mt-1">ตรวจสอบ HMAC-SHA256 WORM Log ป้องกันการแก้ไขประวัติการรักษา</p>
            </Link>

            <Link
              href="/admin/backups"
              className="p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition group"
            >
              <span className="text-2xl mb-2 block">💾</span>
              <h3 className="font-bold text-sm text-emerald-400 group-hover:text-emerald-300">2. สำรองข้อมูลปิดประจำวัน</h3>
              <p className="text-xs text-slate-400 mt-1">สำรองฐานข้อมูลปิดคลินิกอัตโนมัติ พร้อมระบบ Restore กู้คืนข้อมูล</p>
            </Link>

            <Link
              href="/admin/reports/builder"
              className="p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition group"
            >
              <span className="text-2xl mb-2 block">📊</span>
              <h3 className="font-bold text-sm text-emerald-400 group-hover:text-emerald-300">3. สร้างและออกแบบรายงาน</h3>
              <p className="text-xs text-slate-400 mt-1">สร้างรายงานไดนามิกและนำเข้าไฟล์แม่แบบ JSON รายงานทางการแพทย์</p>
            </Link>

            <Link
              href="/admin/exports"
              className="p-5 bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition group"
            >
              <span className="text-2xl mb-2 block">💊</span>
              <h3 className="font-bold text-sm text-emerald-400 group-hover:text-emerald-300">4. สรุปรายงาน อย.ส.4 / อย.ส.5</h3>
              <p className="text-xs text-slate-400 mt-1">ส่งออกไฟล์รายงานวัตถุออกฤทธิ์ต่อจิตและประสาทสำหรับส่งสำนักงาน อย.</p>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
