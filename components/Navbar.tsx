'use client';

import React from 'react';
import Link from 'next/link';
import { Activity, Stethoscope, UserCheck, Pill, CreditCard, ShieldCheck, FileText } from 'lucide-react';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full glass-card border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">Klinik</span>
              <span className="text-xs font-semibold text-emerald-600 block -mt-1">Medical System</span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center space-x-1 text-sm font-medium text-slate-700">
            <Link
              href="/booking"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition"
            >
              <UserCheck className="w-4 h-4 text-emerald-600" />
              <span>ซักประวัติ/จองคิว</span>
            </Link>
            <Link
              href="/nurse/screening"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-teal-600 transition"
            >
              <Activity className="w-4 h-4 text-teal-600" />
              <span>พยาบาลคัดกรอง</span>
            </Link>
            <Link
              href="/doctor/consultation"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-cyan-600 transition"
            >
              <Stethoscope className="w-4 h-4 text-cyan-600" />
              <span>ห้องตรวจแพทย์</span>
            </Link>
            <Link
              href="/pharmacy"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-indigo-600 transition"
            >
              <Pill className="w-4 h-4 text-indigo-600" />
              <span>ห้องห้องยา</span>
            </Link>
            <Link
              href="/cashier"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-amber-600 transition"
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>การเงิน/ชำระเงิน</span>
            </Link>
            <Link
              href="/admin/audit-logs"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-slate-100 hover:text-rose-600 transition"
            >
              <ShieldCheck className="w-4 h-4 text-rose-600" />
              <span>Audit Logs (PDPA)</span>
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/pdpa/data-request"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              PDPA Portal
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
