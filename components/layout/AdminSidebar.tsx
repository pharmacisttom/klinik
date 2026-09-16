'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShieldCheck,
  Database,
  FileSpreadsheet,
  FileText,
  Users,
  Lock,
  Award,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Activity,
  Pill,
  CreditCard,
  Tv,
} from 'lucide-react';

export function AdminSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const adminMenuGroups = [
    {
      groupName: 'การบริหารจัดการหลังบ้าน (Backend Admin)',
      items: [
        { title: 'ภาพรวมระบบ (Dashboard)', href: '/admin/dashboard', icon: LayoutDashboard },
        { title: 'ประวัติเข้าถึง (Audit Logs)', href: '/admin/audit-logs', icon: ShieldCheck },
        { title: 'สำรองข้อมูล (Backup & Restore)', href: '/admin/backups', icon: Database },
        { title: 'ออกแบบรายงาน (Report Builder)', href: '/admin/reports/builder', icon: FileSpreadsheet },
        { title: 'รายงาน อย.ส.4 / อย.ส.5', href: '/admin/exports', icon: FileText },
        { title: 'จัดการบุคลากร (Users)', href: '/admin/users', icon: Users },
        { title: 'คำขอ PDPA ผู้ป่วย', href: '/pdpa/data-request', icon: Lock },
        { title: 'ลิขสิทธิ์ระบบ (License)', href: '/admin/license', icon: Award },
      ],
    },
    {
      groupName: 'คลินิก & บริการผู้ป่วย (Clinical Operations)',
      items: [
        { title: 'จุดคัดกรองพยาบาล (Triage)', href: '/nurse/screening', icon: Activity },
        { title: 'ห้องตรวจแพทย์ (Consultation)', href: '/doctor/consultation', icon: Stethoscope },
        { title: 'ห้องทำแผล & หัตถการ (Minor Procedure)', href: '/procedures', icon: Activity },
        { title: 'ห้องยาและจ่ายยา (Pharmacy)', href: '/pharmacy', icon: Pill },
        { title: 'การเงินแคชเชียร์ (Cashier)', href: '/cashier', icon: CreditCard },
        { title: 'หน้าจอคิว OPD Queue TV', href: '/queue/tv-display', icon: Tv },
      ],
    },
  ];

  return (
    <aside
      className={`bg-slate-900 border-r border-slate-800 text-slate-300 transition-all duration-300 flex flex-col justify-between shrink-0 ${
        collapsed ? 'w-16' : 'w-64'
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-sm">
              🔑
            </div>
            <div>
              <span className="font-bold text-xs text-white block">Tomvis Admin Hub</span>
              <span className="text-[10px] text-emerald-400 block -mt-0.5">Control Center</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition mx-auto"
          title={collapsed ? 'ขยายเมนู' : 'ย่อเมนู'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Nav Menu */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-6">
        {adminMenuGroups.map((grp, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                {grp.groupName}
              </h3>
            )}

            {grp.items.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== '/admin/dashboard' && pathname?.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 shadow-sm font-semibold'
                      : 'hover:bg-slate-800/60 hover:text-slate-100 text-slate-400'
                  } ${collapsed ? 'justify-center' : ''}`}
                  title={collapsed ? item.title : undefined}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {!collapsed && <span className="truncate">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Branding */}
      {!collapsed && (
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          Tomvis Medical Architecture v2.0
          <br />
          Decoupled FE/BE Specification
        </div>
      )}
    </aside>
  );
}
