'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { loginUserAction, getOnlineUsersAction, UserSession } from '@/app/actions/auth';
import { Activity, ShieldCheck, Lock, User, Eye, EyeOff, LogIn, CheckCircle2, AlertTriangle, Users } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  const [username, setUsername] = useState('doctor.somchai@klinik.local');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<UserSession[]>([]);

  useEffect(() => {
    // Fetch currently active online staff to show live presence right on login page
    getOnlineUsersAction().then((res) => {
      if (res.success && res.onlineUsers) {
        setOnlineUsers(res.onlineUsers);
      }
    });
  }, []);

  const handleQuickRoleSelect = (roleEmail: string) => {
    setUsername(roleEmail);
    setErrorMsg('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    try {
      const result = await loginUserAction({
        email: username,
        passKey: password || 'default_pass',
      });

      if (result.success && result.user) {
        setSuccessMsg(`เข้าสู่ระบบสำเร็จ ยินดีต้อนรับ ${result.user.name} (${result.user.role})`);
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 800);
      } else {
        setErrorMsg(result.error || 'การเข้าสู่ระบบไม่ถูกต้อง กรุณาตรวจสอบข้อมูล');
      }
    } catch (err: any) {
      setErrorMsg('เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };

  const presetRoles = [
    { label: 'แพทย์ (Doctor)', email: 'doctor.somchai@klinik.local', role: 'DOCTOR', icon: '👨‍⚕️' },
    { label: 'พยาบาล (Nurse)', email: 'nurse.suda@klinik.local', role: 'NURSE', icon: '👩‍⚕️' },
    { label: 'เภสัชกร (Pharm)', email: 'pharm.viroj@klinik.local', role: 'PHARMACIST', icon: '💊' },
    { label: 'ผู้ดูแลระบบ (Admin)', email: 'admin@klinik.local', role: 'ADMIN', icon: '🛡️' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between relative overflow-hidden text-slate-100">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
        <div className="w-full max-w-md bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          
          {/* Header & Logo */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-600 text-white shadow-lg shadow-emerald-500/20 mb-2">
              <Activity className="w-9 h-9" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Tomvis Clinic System</h1>
            <p className="text-xs text-slate-400 font-medium">กรุณาเข้าสู่ระบบเพื่อเข้าใช้งานระบบบริหารจัดการคลินิก</p>
          </div>

          {/* Quick Role Selection Preset Pills */}
          <div className="space-y-2">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              เลือกบทบาทสำหรับทดสอบเข้าใช้งาน Quick Role Select:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presetRoles.map((r) => (
                <button
                  key={r.role}
                  type="button"
                  onClick={() => handleQuickRoleSelect(r.email)}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                    username === r.email
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span>{r.icon}</span>
                  <span className="truncate">{r.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Alert Messages */}
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>ชื่อผู้ใช้งาน / อีเมล (Username or Email)</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="name@klinik.local"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>รหัสผ่าน (Password)</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/25 hover:from-emerald-400 hover:to-teal-500 active:scale-[0.99] transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>เข้าสู่ระบบ (Sign In)</span>
                </>
              )}
            </button>
          </form>

          {/* Live Online Presence Status Indicator */}
          <div className="pt-4 border-t border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
                <span>สถานะบุคลากรที่ Online อยู่ขณะนี้:</span>
              </span>
              <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                {onlineUsers.length} คน
              </span>
            </div>
            {onlineUsers.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {onlineUsers.map((u) => (
                  <span
                    key={u.userId}
                    className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-md bg-slate-950 border border-slate-800 text-slate-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="font-medium truncate max-w-[100px]">{u.name}</span>
                    <span className="text-[9px] text-slate-500">({u.role})</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 border-t border-slate-900 bg-slate-950/80 relative z-10 space-y-1">
        <p>© 2026 Tomvis Clinic System. All status logs cryptographically secured with HMAC-SHA256.</p>
        <div className="flex justify-center items-center gap-4 text-[11px] text-slate-400">
          <Link href="/admin/license" className="hover:text-emerald-400 transition underline decoration-dashed">
            ตรวจสอบสิทธิ์การใช้งาน (License Verification)
          </Link>
          <span>•</span>
          <Link href="/pdpa/data-request" className="hover:text-emerald-400 transition underline decoration-dashed">
            PDPA Portal ผู้ป่วย
          </Link>
        </div>
      </footer>
    </div>
  );
}
