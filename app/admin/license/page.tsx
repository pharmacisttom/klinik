'use client';

import React, { useState, useEffect } from 'react';
import { verifyLicenseLoginAction, getActiveLicenseAction, LicenseDetails } from '@/app/actions/license';

export default function LicensePage() {
  const [license, setLicense] = useState<LicenseDetails | null>(null);
  const [username, setUsername] = useState('');
  const [passKey, setPassKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadLicenseDetails();
  }, []);

  async function loadLicenseDetails() {
    const res = await getActiveLicenseAction();
    if (res.success && res.license) {
      setLicense(res.license);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const res = await verifyLicenseLoginAction({ username, passKey });
    if (res.success && res.license) {
      setIsAuthenticated(true);
      setLicense(res.license);
    } else {
      setErrorMsg(res.error || 'การยืนยันลิขสิทธิ์ล้มเหลว');
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col items-center justify-center">
      <div className="max-w-4xl w-full space-y-6">
        {/* Header Badge */}
        <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center text-3xl font-bold border border-emerald-500/30">
              📜
            </div>
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-semibold mb-1">
                AUTHENTIC SOFTWARE LICENSE
              </div>
              <h1 className="text-2xl font-extrabold text-white">ระบบตรวจสอบลิขสิทธิ์ Tomvis Clinic License</h1>
              <p className="text-xs text-slate-400">Official Software License & MOPH Certification Authority</p>
            </div>
          </div>

          <div className="text-center sm:text-right">
            <span className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono font-bold block">
              STATUS: VALID & LICENSED
            </span>
            <span className="text-[10px] text-slate-500 block mt-1">Ref ID: {license?.mophCertificationSeal}</span>
          </div>
        </div>

        {!isAuthenticated ? (
          /* Login Authorization Card */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl max-w-md mx-auto space-y-6">
            <div className="text-center">
              <h2 className="text-lg font-bold text-white mb-1">เข้าสู่ระบบยืนยันสิทธิ์ใบอนุญาต (License Verification)</h2>
              <p className="text-xs text-slate-400">กรุณากรอก Username และ Password ประจำใบอนุญาตของคุณ</p>
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-300 rounded-xl text-xs text-center">
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleVerify} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 block mb-1">ชื่อผู้ใช้ลิขสิทธิ์ (Username)</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="กรอกชื่อผู้ใช้ลิขสิทธิ์"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>

              <div>
                <label className="text-slate-300 block mb-1">รหัสผ่านใบอนุญาต (License Password)</label>
                <input
                  type="password"
                  value={passKey}
                  onChange={(e) => setPassKey(e.target.value)}
                  placeholder="••••••••••••••••"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 outline-none focus:border-emerald-500 text-sm font-mono"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-900/30 transition-all mt-2"
              >
                {loading ? 'กำลังตรวจสอบสิทธิ์...' : '🔑 ตรวจสอบสิทธิ์และเปิดใช้งาน (Verify License)'}
              </button>
            </form>
          </div>
        ) : (
          /* Full Authorized License View */
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs text-emerald-400 font-mono font-bold block mb-1">LICENSE KEY</span>
                <span className="text-xl font-bold font-mono text-cyan-300">{license?.licenseKey}</span>
              </div>
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-bold">
                ✓ VERIFIED LICENSED USER
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">องค์กรที่ได้รับสิทธิ์ (Organization)</span>
                <span className="font-bold text-slate-200">{license?.organizationName}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">ระดับใบอนุญาต (Tier)</span>
                <span className="font-bold text-amber-300">{license?.tierName}</span>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <span className="text-slate-400 block mb-1">วันหมดอายุ (Expiry Date)</span>
                <span className="font-bold text-emerald-400">{license?.expiryDate} (ใช้งานได้ยาวนาน 10 ปี)</span>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-300">โมดูลการทำงานที่ได้รับอนุญาต (Authorized System Modules):</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {license?.authorizedModules.map((m, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center gap-2 text-slate-300">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
              Tomvis Clinic License Authentication • Certified for MOPH Standards & PDPA B.E. 2562 Compliance
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
