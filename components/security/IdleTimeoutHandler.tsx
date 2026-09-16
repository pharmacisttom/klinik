'use client';

import { useEffect, useRef } from 'react';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 Minutes Idle Timeout (ISO 27001 & HIPAA Requirement)

export function IdleTimeoutHandler() {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      // Auto-logout user on inactivity
      if (typeof window !== 'undefined') {
        alert('เซสชันหมดอายุเนื่องจากไม่มีการใช้งานเกิน 15 นาที ระบบจะนำคุณไปยังหน้าเข้าสู่ระบบเพื่อความปลอดภัย (ISO 27001)');
        window.location.href = '/';
      }
    }, IDLE_TIMEOUT_MS);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach((event) => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, []);

  return null;
}
