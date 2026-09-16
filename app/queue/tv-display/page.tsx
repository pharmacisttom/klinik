'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getTvQueueDataAction, QueueItem } from '@/app/actions/queue';
import { Monitor, Volume2, VolumeX, Maximize, Clock, Stethoscope, UserCheck, Sparkles, Megaphone } from 'lucide-react';

export default function TvQueueDisplayPage() {
  const [currentlyCalling, setCurrentlyCalling] = useState<QueueItem[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const [lastCalledId, setLastCalledId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Live Clock Update
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      );
      setCurrentDate(
        now.toLocaleDateString('th-TH', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
      );
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch Live Queue Data (Poll every 4s)
  useEffect(() => {
    const fetchQueue = async () => {
      const res = await getTvQueueDataAction();
      if (res.success) {
        setCurrentlyCalling(res.currentlyCalling);
        setWaitingQueue(res.waitingQueue);

        // Check if there is a newly called patient to trigger Voice Announcement
        if (res.currentlyCalling.length > 0) {
          const newest = res.currentlyCalling[0];
          if (newest.id !== lastCalledId) {
            setLastCalledId(newest.id);
            if (audioEnabled) {
              playChimeAndAnnounce(newest.patientName, newest.roomName);
            }
          }
        }
      }
    };

    fetchQueue();
    const poll = setInterval(fetchQueue, 4000);
    return () => clearInterval(poll);
  }, [audioEnabled, lastCalledId]);

  // Audio Speech & Chime Synthesizer
  const playChimeAndAnnounce = (name: string, room: string) => {
    try {
      // 1. Play Chime Sound using Web Audio API
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, ctx.currentTime + 0.3); // E5

        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
      }

      // 2. Speech Synthesis in Thai
      if ('speechSynthesis' in window) {
        setTimeout(() => {
          const text = `ขอเชิญคุณ ${name} เข้า ${room} ค่ะ`;
          const utterance = new SpeechSynthesisUtterance(text);
          utterance.lang = 'th-TH';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          window.speechSynthesis.speak(utterance);
        }, 650);
      }
    } catch (e) {
      console.error('Audio synthesis error:', e);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleEnableAudio = () => {
    setAudioEnabled(true);
    // Play test chime
    if (currentlyCalling.length > 0) {
      playChimeAndAnnounce(currentlyCalling[0].patientName, currentlyCalling[0].roomName);
    } else {
      playChimeAndAnnounce('ทดสอบระบบเสียง', 'ห้องตรวจที่ 1');
    }
  };

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans p-6 relative overflow-hidden select-none"
    >
      {/* Dynamic Glow Backgrounds */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Bar */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Monitor className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-extrabold tracking-tight text-white">ระบบเรียกคิวผู้รับบริการ OPD</h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> LIVE TV
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">TOMVIS CLINIC MEDICAL SYSTEM • ทอมวิส คลินิกเวชกรรม</p>
          </div>
        </div>

        {/* Right Controls & Clock */}
        <div className="flex items-center gap-4">
          {/* Live Date & Time */}
          <div className="text-right hidden sm:block bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-2xl">
            <div className="text-xl font-mono font-extrabold text-cyan-400 flex items-center gap-1.5 justify-end">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>{currentTime || '00:00:00'}</span>
            </div>
            <div className="text-[11px] text-slate-400">{currentDate}</div>
          </div>

          {/* Sound Toggle Button */}
          <button
            onClick={handleEnableAudio}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-semibold transition ${
              audioEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-900 text-amber-400 border-amber-500/40 animate-bounce'
            }`}
          >
            {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            <span>{audioEnabled ? 'ระบบเสียงอ่านคิว (เปิด)' : 'กดคลิกเปิดระบบเสียง'}</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-xl transition"
            title="ขยายเต็มหน้าจอ TV"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid Section */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: NOW CALLING (Large High-Contrast Card for TV) */}
        <div className="lg:col-span-7 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5 text-rose-400 font-black text-lg tracking-wider uppercase">
                <Megaphone className="w-6 h-6 animate-pulse" />
                <span>กำลังเชิญเข้าห้องตรวจ / รับบริการ (NOW CALLING)</span>
              </div>
              <span className="text-xs font-mono text-slate-500">AUTO SPEECH READY</span>
            </div>

            {currentlyCalling.length === 0 ? (
              <div className="py-24 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center mx-auto text-slate-600">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div className="text-slate-400 text-lg font-medium">ขณะนี้ยังไม่มีคิวที่กำลังเรียกเข้าห้องตรวจ</div>
                <p className="text-xs text-slate-600">กรุณานั่งรอในพื้นที่พักคอย แพทย์กำลังเตรียมพร้อมให้บริการ</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentlyCalling.map((item, index) => (
                  <div
                    key={item.id}
                    className={`p-6 rounded-2xl border-2 transition-all shadow-xl flex items-center justify-between ${
                      index === 0
                        ? 'bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-cyan-400 ring-4 ring-cyan-500/20 scale-[1.01]'
                        : 'bg-slate-950 border-slate-800 opacity-90'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950 px-3 py-1 rounded-full border border-cyan-800">
                          HN: {item.hn}
                        </span>
                        {index === 0 && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500 text-white animate-pulse">
                            กำลังเรียกคิวนี้
                          </span>
                        )}
                      </div>
                      <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        {item.patientName}
                      </h2>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <Stethoscope className="w-3.5 h-3.5 text-cyan-400" />
                        <span>ผู้ตรวจ: {item.doctorName}</span>
                      </p>
                    </div>

                    <div className="text-right pl-4">
                      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">สถานที่ติดต่อ</div>
                      <div className="text-3xl sm:text-4xl font-black text-rose-400 bg-rose-950/40 px-4 py-2 rounded-2xl border border-rose-800/50 shadow-inner">
                        {item.roomName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Banner News Ticker */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="truncate">
              ข้อแนะนำ: โปรดเตรียมบัตรประชาชนหรือบัตรทอง/สิทธิการรักษาไว้สำหรับการรับยาและชำระเงิน
            </span>
          </div>
        </div>

        {/* Right Column: WAITING QUEUE LIST */}
        <div className="lg:col-span-5 bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-base uppercase tracking-wider">
                <UserCheck className="w-5 h-5" />
                <span>คิวรอรับบริการ (WAITING QUEUE)</span>
              </div>
              <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full font-mono">
                รออยู่ {waitingQueue.length} คิว
              </span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {waitingQueue.length === 0 ? (
                <div className="py-16 text-center text-slate-500 text-sm font-medium">
                  ไม่มีผู้ป่วยรอคิวในระบบขณะนี้
                </div>
              ) : (
                waitingQueue.map((item, idx) => (
                  <div
                    key={item.id}
                    className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between hover:border-slate-700 transition"
                  >
                    <div className="flex items-center gap-3.5">
                      <span className="w-9 h-9 rounded-xl bg-slate-800 text-slate-200 flex items-center justify-center font-bold text-sm font-mono border border-slate-700">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-bold text-slate-100 text-sm">{item.patientName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">HN: {item.hn}</div>
                      </div>
                    </div>

                    <span className="text-xs font-semibold px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      รอเข้าตรวจ
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800 text-center text-[11px] text-slate-500">
            ระบบเรียกคิวอัตโนมัติ Tomvis Clinic • อัปเดตข้อมูลสดทุก 4 วินาที
          </div>
        </div>
      </div>
    </div>
  );
}
