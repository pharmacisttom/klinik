'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('klinik_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    }
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem('klinik_cookie_consent', JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setShowBanner(false);
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem('klinik_cookie_consent', JSON.stringify({ accepted: 'necessary_only', date: new Date().toISOString() }));
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 text-white p-4 shadow-2xl border-t border-slate-700">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-sm text-slate-300">
          <p className="font-semibold text-white mb-1">การใช้งานคุกกี้ (Cookie Policy)</p>
          เราใช้คุกกี้เพื่อเพิ่มประสิทธิภาพและประสบการณ์ที่ดีในการใช้งานเว็บไซต์ คุณสามารถศึกษารายละเอียดเพิ่มเติมได้ที่{' '}
          <Link href="/privacy" className="text-emerald-400 underline hover:text-emerald-300">
            นโยบายความเป็นส่วนตัว
          </Link>
        </div>
        <div className="flex gap-3 shrink-0">
          <button
            onClick={handleNecessaryOnly}
            className="px-4 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-600 transition"
          >
            เฉพาะคุกกี้จำเป็น
          </button>
          <button
            onClick={handleAcceptAll}
            className="px-4 py-2 text-xs font-medium bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition shadow"
          >
            ยอมรับทั้งหมด
          </button>
        </div>
      </div>
    </div>
  );
}
