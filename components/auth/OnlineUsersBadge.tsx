'use client';

import React, { useState, useEffect } from 'react';
import { getOnlineUsersAction, UserSession } from '@/app/actions/auth';

export function OnlineUsersBadge() {
  const [onlineUsers, setOnlineUsers] = useState<UserSession[]>([]);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchOnlineUsers();
    const interval = setInterval(fetchOnlineUsers, 15000); // refresh every 15s
    return () => clearInterval(interval);
  }, []);

  async function fetchOnlineUsers() {
    const res = await getOnlineUsersAction();
    if (res.success && res.onlineUsers) {
      setOnlineUsers(res.onlineUsers);
    }
  }

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
    DOCTOR: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
    NURSE: 'bg-teal-500/20 text-teal-300 border-teal-500/30',
    PHARMACIST: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    PATIENT: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowModal(!showModal)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-xs font-semibold hover:bg-slate-800 transition shadow-sm"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
        <span className="text-slate-200">Online:</span>
        <span className="text-emerald-400 font-mono font-bold">{onlineUsers.length} คน</span>
      </button>

      {/* Online Staff Dropdown Modal */}
      {showModal && (
        <div className="absolute right-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50 text-xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <span className="font-bold text-slate-200">ผู้ใช้งานที่กำลังออนไลน์ (Online Now)</span>
            <span className="text-[10px] text-emerald-400 font-mono">LIVE</span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto">
            {onlineUsers.map((user) => (
              <div key={user.userId} className="p-2.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-slate-200 block">{user.name}</span>
                  <span className="text-[10px] text-slate-400 block">{user.email}</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${roleColors[user.role] || 'bg-slate-800 text-slate-300'}`}>
                  {user.role}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
