'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCurrentSessionAction, logoutUserAction, UserSession } from '@/app/actions/auth';
import { OnlineUsersBadge } from '@/components/auth/OnlineUsersBadge';
import { Activity, Stethoscope, UserCheck, Pill, CreditCard, ShieldCheck, Package, Users, Menu, X, LogOut, User } from 'lucide-react';

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [session, setSession] = useState<UserSession | null>(null);
  const router = useRouter();

  useEffect(() => {
    getCurrentSessionAction().then((s) => setSession(s));
  }, []);

  const handleLogout = async () => {
    await logoutUserAction();
    router.push('/login');
    router.refresh();
  };

  const navLinks = [
    { href: '/booking', label: 'ซักประวัติ/จองคิว', icon: UserCheck, color: 'text-emerald-600' },
    { href: '/nurse/screening', label: 'พยาบาลคัดกรอง', icon: Activity, color: 'text-teal-600' },
    { href: '/doctor/consultation', label: 'ห้องตรวจแพทย์', icon: Stethoscope, color: 'text-cyan-600' },
    { href: '/pharmacy', label: 'จ่ายยา', icon: Pill, color: 'text-indigo-600' },
    { href: '/pharmacy/stock-card', label: 'คลังยา/สต๊อกการ์ด', icon: Package, color: 'text-indigo-600' },
    { href: '/pharmacy/cold-chain', label: 'คลังยาเย็น 2-8°C', icon: Package, color: 'text-blue-600' },
    { href: '/cashier', label: 'ชำระเงิน', icon: CreditCard, color: 'text-amber-600' },
    { href: '/admin/users', label: 'บุคลากร', icon: Users, color: 'text-purple-600' },
    { href: '/admin/audit-logs', label: 'Audit Logs', icon: ShieldCheck, color: 'text-rose-600' },
    { href: '/admin/backups', label: 'สำรองข้อมูล', icon: Package, color: 'text-emerald-600' },
    { href: '/admin/reports/builder', label: 'สร้างรายงาน', icon: Activity, color: 'text-indigo-600' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full glass-card border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text">Tomvis Clinic</span>
              <span className="text-[10px] font-semibold text-emerald-600 block -mt-1">Medical System</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-1 text-xs font-medium text-slate-700">
            {navLinks.slice(0, 8).map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 hover:text-emerald-600 transition"
                >
                  <Icon className={`w-3.5 h-3.5 ${link.color}`} />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Actions, Presence & Logout */}
          <div className="flex items-center gap-2">
            {/* Live Online Users Badge */}
            <OnlineUsersBadge />

            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-slate-900 text-emerald-400 border border-slate-700 hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm hidden sm:flex"
            >
              <span>🔑 หลังบ้าน (Admin)</span>
            </Link>

            {session ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden lg:flex flex-col text-right text-[11px]">
                  <span className="font-bold text-slate-800 leading-tight">{session.name}</span>
                  <span className="text-[9px] text-emerald-600 font-semibold uppercase">{session.role}</span>
                </div>
                <button
                  onClick={handleLogout}
                  title="ออกจากระบบ"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 transition border border-slate-200"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
              >
                เข้าสู่ระบบ
              </Link>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-white border-b border-slate-200 px-4 pt-2 pb-4 space-y-1 text-sm font-medium shadow-xl">
          {navLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition"
              >
                <Icon className={`w-4 h-4 ${link.color}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
          <div className="pt-2">
            <Link
              href="/pdpa/data-request"
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center text-xs font-semibold px-4 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              PDPA Portal ผู้ป่วย
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
