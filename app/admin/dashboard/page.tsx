'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAdminDashboardMetricsAction, SystemMetrics } from '@/app/actions/admin-dashboard';

export default function AdminMasterDashboardPage() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics();
  }, []);

  async function loadMetrics() {
    setLoading(true);
    const res = await getAdminDashboardMetricsAction();
    if (res.success && res.metrics) {
      setMetrics(res.metrics);
    }
    setLoading(false);
  }

  const systemModules = [
    {
      category: '🏥 ระบบงานเวชระเบียน & ตรวจรักษา (EMR & Clinical Core)',
      items: [
        { title: 'ซักประวัติ & จุดคัดกรองพยาบาล', desc: 'ลงทะเบียนผู้ป่วยใหม่ ตรวจสอบ CID 13 หลัก บันทึกสัญญาณชีพ (BP, HR, Temp)', href: '/nurse/screening', icon: '🩺', badge: 'Active' },
        { title: 'ห้องตรวจวินิจฉัยแพทย์', desc: 'ตรวจอาการ SOAP บันทึก ICD-10-TM สั่งยา และออกใบรับรองแพทย์ 5 โรค', href: '/doctor/consultation', icon: '👨‍⚕️', badge: 'Active' },
        { title: 'ทะเบียนผู้ป่วยโรคเรื้อรัง (NCD Registry)', desc: 'ติดตามระดับน้ำตาล HbA1c และความดันโลหิตผู้ป่วย DM/HT', href: '/clinical/ncd-registry', icon: '🫀', badge: 'Active' },
        { title: 'หน้าจอแสดงคิว OPD Queue TV', desc: 'หน้าจอเรียกคิวผู้ป่วยห้องรอตรวจ เซ็นเซอร์ชื่อตามกฎหมาย PDPA', href: '/queue/tv-display', icon: '📺', badge: 'Realtime' },
        { title: 'ระบบตรวจสอบใบรับรองแพทย์', desc: 'ตรวจสอบความถูกต้องใบรับรองแพทย์ DLT ผ่าน QR Code', href: '/verify/certificate/MC-2026-0001', icon: '📜', badge: 'Verified' },
      ],
    },
    {
      category: '💊 ระบบงานเภสัชกรรม & คลังยา (Pharmacy & Inventory)',
      items: [
        { title: 'ห้องจ่ายยาผู้ป่วยนอก (OPD Pharmacy)', desc: 'ตรวจสอบคิวจ่ายยา พิมพ์ฉลากยา GPP และแจ้งเตือนประวัติแพ้ยา', href: '/pharmacy', icon: '💊', badge: 'GPP' },
        { title: 'คลังยา & สต๊อกการ์ด (Stock Card)', desc: 'ติดตามการเคลื่อนไหวคลังยา ตัดสต๊อกยา FEFO และรหัส TMT 24 หลัก', href: '/pharmacy/stock-card', icon: '📦', badge: 'FEFO' },
        { title: 'คลังยาเย็น 2°C–8°C (Cold Chain Log)', desc: 'บันทึกอุณหภูมิตู้เย็นคลังยา พร้อมระบบแจ้งเตือน LINE Alert ทันที', href: '/pharmacy/cold-chain', icon: '❄️', badge: 'Alert On' },
        { title: 'รายงานวัตถุออกฤทธิ์ฯ (อย.ส.4 / อย.ส.5)', desc: 'สรุปรายงานส่งออกไฟล์ CSV ประจำเดือนส่งสำนักงานคณะกรรมการอาหารและยา', href: '/pharmacy/controlled-drugs', icon: '📋', badge: 'อย.ส.4/5' },
        { title: 'รายงานไม่พึงประสงค์จากยา (Naranjo ADR)', desc: 'คำนวณคะแนนความน่าจะเป็นของการแพ้ยาตามมาตรฐาน Naranjo Algorithm', href: '/pharmacy/adr-report', icon: '⚠️', badge: 'Vigibase' },
      ],
    },
    {
      category: '💳 ระบบการเงิน & ภาษีสรรพากร (Financials & Revenue)',
      items: [
        { title: 'ระบบแคชเชียร์คิดเงิน & ชำระเงิน', desc: 'ชำระเงินค่ารักษา ออกใบเสร็จรับเงิน และสแกน PromptPay QR', href: '/cashier', icon: '💳', badge: 'PromptPay' },
        { title: 'ส่งออกรายงานภาษีสรรพากร (ม.81)', desc: 'สรุปรายงานรายรับแยกค่ารักษาพยาบาล (ยกเว้น VAT) และเวชสำอาง (7% VAT)', href: '/admin/exports', icon: '🧾', badge: 'Section 81' },
      ],
    },
    {
      category: '🛡️ ระบบความปลอดภัย, PDPA & สำรองข้อมูล (Security & Governance)',
      items: [
        { title: 'บันทึกประวัติการเข้าถึง (Audit Logs)', desc: 'ตรวจสอบบันทึกความปลอดภัย HMAC-SHA256 WORM ป้องกันการแก้ไขประวัติ', href: '/admin/audit-logs', icon: '🛡️', badge: 'WORM HMAC' },
        { title: 'ระบบสำรองและกู้คืนข้อมูลปิดคลินิก', desc: 'สำรองข้อมูลประจำวันอัตโนมัติ พร้อมระบบ Restore กู้คืนข้อมูลเมื่อฉุกเฉิน', href: '/admin/backups', icon: '💾', badge: 'Daily Backup' },
        { title: 'ระบบสร้างรายงานอัจฉริยะ (Report Builder)', desc: 'สร้างรายงานไดนามิกและนำเข้าไฟล์แม่แบบ JSON รายงานทางการแพทย์', href: '/admin/reports/builder', icon: '📊', badge: 'Dynamic' },
        { title: 'ศูนย์บริการสิทธิ์ข้อมูลส่วนบุคคล (PDPA Portal)', desc: 'จัดการคำขอดาวน์โหลดสำเนาประวัติการรักษาพยาบาลของผู้ป่วย', href: '/pdpa/data-request', icon: '🔒', badge: 'PDPA 100%' },
        { title: 'การจัดการสิทธิ์บุคลากร (User Management)', desc: 'กำหนดสิทธิ์การเข้าถึงข้อมูลของ แพทย์ พยาบาล เภสัชกร และเจ้าหน้าที่', href: '/admin/users', icon: '👥', badge: 'RBAC' },
        { title: 'ระบบตรวจสอบลิขสิทธิ์ซอฟต์แวร์ (License Console)', desc: 'ตรวจสอบสถานะใบอนุญาตลิขสิทธิ์ Tomvis Enterprise Suite 2026', href: '/admin/license', icon: '📜', badge: 'Verified' },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
              🔑 MASTER BACKEND CONTROL CENTER
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">ศูนย์รวมการบริหารจัดการระบบหลังบ้าน Tomvis Clinic</h1>
            <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
              แผงควบคุมระบบหลังบ้านแบบรวมศูนย์ (Unified Dashboard) สามารถตรวจสอบสถานะการทำงาน ฐานข้อมูล
              รายงานความปลอดภัย และเข้าถึงทุกโมดูลของระบบได้ในที่เดียว
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              onClick={loadMetrics}
              disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-xl border border-slate-700 text-slate-200 transition flex items-center justify-center gap-2"
            >
              🔄 รีเฟรชสถานะระบบ
            </button>
            <Link
              href="/admin/backups"
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold rounded-xl text-white shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition"
            >
              💾 สำรองข้อมูลปิดคลินิก
            </Link>
          </div>
        </div>

        {/* Master KPIs & Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block">ผู้ป่วยในระบบทั้งหมด</span>
            <span className="text-2xl font-extrabold text-emerald-400">{metrics?.totalPatients ?? 0}</span>
            <span className="text-[11px] text-slate-500 block">✓ เข้ารหัส CID & Masking</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block">นัดหมายตรวจวันนี้</span>
            <span className="text-2xl font-extrabold text-cyan-400">{metrics?.appointmentsToday ?? 0}</span>
            <span className="text-[11px] text-slate-500 block">OPD Waiting Queue Active</span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block">อุณหภูมิตู้เย็นคลังยาเย็น</span>
            <span className={`text-2xl font-extrabold ${metrics?.fridgeAlarm ? 'text-red-400' : 'text-blue-400'}`}>
              {metrics?.latestFridgeTemp ?? 4.2}°C
            </span>
            <span className="text-[11px] text-slate-500 block">
              {metrics?.fridgeAlarm ? '⚠️ อยู่ นอกช่วง 2°C–8°C' : '✓ ปลอดภัย 2°C–8°C (LINE Alert)'}
            </span>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-1">
            <span className="text-xs text-slate-400 block">ความปลอดภัย Audit Logs</span>
            <span className="text-2xl font-extrabold text-amber-400">{metrics?.auditLogsCount ?? 0}</span>
            <span className="text-[11px] text-slate-500 block">
              {metrics?.auditChainIntegrity ? '✓ HMAC WORM Hash Valid' : '⚠️ Tampering Detected'}
            </span>
          </div>
        </div>

        {/* Categorized Modules Navigation Hub */}
        <div className="space-y-8">
          {systemModules.map((grp, gIdx) => (
            <div key={gIdx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3 flex items-center justify-between">
                <span>{grp.category}</span>
                <span className="text-xs font-normal text-slate-400">{grp.items.length} โมดูล</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {grp.items.map((item, iIdx) => (
                  <Link
                    key={iIdx}
                    href={item.href}
                    className="p-4 bg-slate-950 hover:bg-slate-850 border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl transition group flex flex-col justify-between space-y-3"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl">{item.icon}</span>
                        <span className="px-2.5 py-0.5 bg-slate-900 text-slate-400 border border-slate-800 rounded-full text-[10px] font-mono">
                          {item.badge}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-emerald-400 group-hover:text-emerald-300 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center gap-1 text-xs font-medium text-slate-500 group-hover:text-emerald-400 transition-colors">
                      <span>เข้าสู่โมดูลงาน</span>
                      <span>→</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
