'use client';

import React, { useState, useEffect } from 'react';
import { getTvQueueDataAction, callQueueAction, QueueItem } from '@/app/actions/queue';
import { Megaphone, Stethoscope, RefreshCw, CheckCircle2, UserCheck, Monitor } from 'lucide-react';
import Link from 'next/link';

export default function QueueCallerPage() {
  const [waitingQueue, setWaitingQueue] = useState<QueueItem[]>([]);
  const [currentlyCalling, setCurrentlyCalling] = useState<QueueItem[]>([]);
  const [selectedRoom, setSelectedRoom] = useState('ห้องตรวจ 1');
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchQueue = async () => {
    setLoading(true);
    const res = await getTvQueueDataAction();
    setLoading(false);
    if (res.success) {
      setWaitingQueue(res.waitingQueue);
      setCurrentlyCalling(res.currentlyCalling);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleCallPatient = async (appointmentId: string, patientName: string) => {
    setStatusMsg('');
    const res = await callQueueAction(appointmentId, selectedRoom);
    if (res.success) {
      setStatusMsg(`ส่งสัญญาณเรียกคิวคุณ ${patientName} เข้า ${selectedRoom} สำเร็จ!`);
      fetchQueue();
    } else {
      setStatusMsg(res.error || 'เกิดข้อผิดพลาดในการเรียกคิว');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">แผงควบคุมการเรียกคิวผู้ป่วย (Queue Caller Console)</h1>
            <p className="text-xs text-slate-500">กดเรียกคิวผู้ป่วยเพื่อแสดงบนหน้าจอ TV และส่งสัญญาณเสียงเรียกคิวอัตโนมัติ</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/queue/tv-display"
            target="_blank"
            className="px-3.5 py-2 bg-slate-900 text-emerald-400 font-semibold text-xs rounded-xl hover:bg-slate-800 transition flex items-center gap-1.5 shadow"
          >
            <Monitor className="w-4 h-4" /> เปิดหน้าจอ TV เรียกคิว
          </Link>
          <button
            onClick={fetchQueue}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition"
            title="รีเฟรชข้อมูลคิว"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Select Room Selector */}
      <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider block">เลือกห้องที่ต้องการเรียกเข้าใช้งาน:</span>
          <span className="text-xs text-indigo-700">ชื่อห้องนี้จะถูกนำไปประกาศผ่านเสียงและแสดงบนหน้าจอ TV</span>
        </div>
        <div className="flex gap-2">
          {['ห้องตรวจ 1', 'ห้องตรวจ 2', 'ห้องทำแผล/หัตถการ', 'ห้องจ่ายยา'].map((room) => (
            <button
              key={room}
              type="button"
              onClick={() => setSelectedRoom(room)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedRoom === room
                  ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              {room}
            </button>
          ))}
        </div>
      </div>

      {statusMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{statusMsg}</span>
        </div>
      )}

      {/* Currently Calling Patients */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Stethoscope className="w-5 h-5 text-rose-500" />
          <span>รายการคิวที่กำลังเข้าตรวจขณะนี้ ({currentlyCalling.length} รายการ)</span>
        </h2>

        {currentlyCalling.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">ไม่มีคิวที่กำลังเข้าตรวจในขณะนี้</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentlyCalling.map((item) => (
              <div key={item.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded font-mono">
                    HN: {item.hn}
                  </span>
                  <h3 className="font-bold text-slate-900 text-base mt-1">{item.patientName}</h3>
                  <p className="text-xs text-slate-500">{item.roomName}</p>
                </div>
                <button
                  onClick={() => handleCallPatient(item.id, item.patientName)}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-semibold text-xs shadow flex items-center gap-1"
                >
                  <Megaphone className="w-3.5 h-3.5" /> เรียกซ้ำ (Recall)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Waiting Queue Table */}
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-indigo-600" />
            <span>คิวรอพบแพทย์ ({waitingQueue.length} คิว)</span>
          </h2>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-100 text-xs text-slate-500 uppercase">
              <tr>
                <th className="px-4 py-3">ลำดับ</th>
                <th className="px-4 py-3">รหัส HN</th>
                <th className="px-4 py-3">ชื่อ-นามสกุล ผู้ป่วย</th>
                <th className="px-4 py-3">แพทย์ประจำห้อง</th>
                <th className="px-4 py-3 text-center">ดำเนินการเรียกคิว</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {waitingQueue.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    ไม่มีคิวรอรับบริการขณะนี้
                  </td>
                </tr>
              ) : (
                waitingQueue.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">{item.hn}</td>
                    <td className="px-4 py-3 font-bold text-slate-900">{item.patientName}</td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{item.doctorName}</td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleCallPatient(item.id, item.patientName)}
                        className="px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs rounded-lg shadow flex items-center gap-1.5 mx-auto transition"
                      >
                        <Megaphone className="w-3.5 h-3.5" /> กดเรียกเข้า {selectedRoom}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
