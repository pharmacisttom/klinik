import { prisma } from '@/lib/prisma';
import { Monitor, Volume2, UserCheck, Stethoscope } from 'lucide-react';

export const revalidate = 0;

export default async function TvQueueDisplayPage() {
  const waitingAppointments = await prisma.appointment.findMany({
    where: { status: { in: ['WAITING', 'IN_CONSULTATION'] } },
    include: { patient: true, doctor: true },
    orderBy: { scheduledAt: 'asc' },
    take: 20,
  });

  const currentlyCalling = waitingAppointments.filter((a) => a.status === 'IN_CONSULTATION');
  const waitingQueue = waitingAppointments.filter((a) => a.status === 'WAITING');

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans p-6">
      {/* Header */}
      <header className="flex justify-between items-center pb-6 border-b border-slate-800 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
            <Monitor className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">หน้าจอเรียกคิวผู้รับบริการ OPD</h1>
            <p className="text-xs text-slate-400">ทอมวิส คลินิกเวชกรรม (TOMVIS CLINIC)</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-4 py-2 rounded-xl text-slate-300 text-sm font-semibold">
          <Volume2 className="w-5 h-5 text-indigo-400 animate-pulse" />
          <span>ระบบเสียงประกาศคิวอัตโนมัติ (Active)</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Currently Calling Box */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider mb-4">
              <Stethoscope className="w-5 h-5" />
              <span>กำลังเชิญเข้าห้องตรวจ (NOW CALLING)</span>
            </div>

            {currentlyCalling.length === 0 ? (
              <div className="py-20 text-center text-slate-500 font-medium">
                ขณะนี้ไม่มีคิวที่กำลังเข้าห้องตรวจ
              </div>
            ) : (
              <div className="space-y-6">
                {currentlyCalling.map((appt) => (
                  <div key={appt.id} className="bg-gradient-to-r from-indigo-900/50 to-slate-900 border-2 border-indigo-500 p-6 rounded-2xl flex justify-between items-center shadow-lg">
                    <div>
                      <span className="text-xs font-bold text-indigo-300 bg-indigo-950 px-3 py-1 rounded-full border border-indigo-800">
                        HN: {appt.patient.hn}
                      </span>
                      <h2 className="text-3xl font-extrabold text-white mt-2">
                        {appt.patient.prefix}{appt.patient.firstName} {appt.patient.lastName}
                      </h2>
                      <p className="text-sm text-slate-400 mt-1">แพทย์: {appt.doctor.name}</p>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400 uppercase font-semibold">ห้องตรวจ</div>
                      <div className="text-4xl font-extrabold text-rose-400">ห้องตรวจ 1</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Waiting Queue List */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
            <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-sm uppercase tracking-wider">
              <UserCheck className="w-5 h-5" />
              <span>ลำดับคิวรอพบแพทย์ (WAITING QUEUE)</span>
            </div>
            <span className="bg-indigo-950 border border-indigo-800 text-indigo-300 text-xs font-bold px-3 py-1 rounded-full">
              รออยู่ {waitingQueue.length} คิว
            </span>
          </div>

          <div className="space-y-3">
            {waitingQueue.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-sm">
                ไม่มีผู้ป่วยรอในคิวขณะนี้
              </div>
            ) : (
              waitingQueue.map((appt, idx) => (
                <div key={appt.id} className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-slate-300 flex items-center justify-center font-bold text-sm">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="font-bold text-slate-200">{appt.patient.prefix}{appt.patient.firstName} {appt.patient.lastName}</div>
                      <div className="text-xs text-slate-500">HN: {appt.patient.hn}</div>
                    </div>
                  </div>

                  <span className="text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    รอเข้าห้องตรวจ
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
