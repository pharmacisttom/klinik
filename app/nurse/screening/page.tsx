'use client';

import React, { useState } from 'react';
import { Activity, Heart, Thermometer, Weight, ArrowRight, CheckCircle2 } from 'lucide-react';

export default function NurseScreeningPage() {
  const [hn, setHn] = useState('');
  const [bpSys, setBpSys] = useState('120');
  const [bpDia, setBpDia] = useState('80');
  const [pulse, setPulse] = useState('78');
  const [temp, setTemp] = useState('37.2');
  const [weight, setWeight] = useState('65');
  const [height, setHeight] = useState('170');
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [saved, setSaved] = useState(false);

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100">
          <div className="w-12 h-12 rounded-xl bg-teal-500 text-white flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">จุดคัดกรองพยาบาล (Nurse Screening & Vitals)</h1>
            <p className="text-slate-500 text-sm">บันทึกสัญญาณชีพ อาการสำคัญ และจัดคิวส่งต่อห้องตรวจแพทย์</p>
          </div>
        </div>

        {saved && (
          <div className="p-4 rounded-xl mb-6 bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-2 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 text-teal-600" />
            <span>บันทึกสัญญาณชีพเรียบร้อย! ส่งผู้ป่วยเข้าคิวห้องตรวจแพทย์แล้ว</span>
          </div>
        )}

        <form onSubmit={handleSaveVitals} className="space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-sm font-semibold text-slate-700 mb-1">
              ค้นหาด้วย รหัสประจำตัวผู้ป่วย (HN) หรือ เลขบัตรประชาชน
            </label>
            <input
              type="text"
              required
              value={hn}
              onChange={(e) => setHn(e.target.value)}
              placeholder="HN-690916-0001 หรือ 1100400123450"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none bg-white font-mono"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-4 h-4 text-rose-500" /> ความดันโลหิต (BP Systolic/Diastolic)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  required
                  value={bpSys}
                  onChange={(e) => setBpSys(e.target.value)}
                  placeholder="SYS (120)"
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
                <span className="self-center font-bold text-slate-400">/</span>
                <input
                  type="number"
                  required
                  value={bpDia}
                  onChange={(e) => setBpDia(e.target.value)}
                  placeholder="DIA (80)"
                  className="w-1/2 px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Activity className="w-4 h-4 text-teal-600" /> อัตราการเต้นของหัวใจ (Pulse)
              </label>
              <input
                type="number"
                required
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                placeholder="78 BPM"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-amber-500" /> อุณหภูมิร่างกาย (°C)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={temp}
                onChange={(e) => setTemp(e.target.value)}
                placeholder="37.2 °C"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Weight className="w-4 h-4 text-indigo-500" /> น้ำหนัก (kg)
              </label>
              <input
                type="number"
                step="0.1"
                required
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="65.0 kg"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ส่วนสูง (cm)</label>
              <input
                type="number"
                required
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170 cm"
                className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">ดัชนีมวลกาย (BMI คำนวณอัตโนมัติ)</label>
              <div className="w-full px-4 py-2 bg-slate-100 rounded-xl font-bold text-teal-700 border border-slate-200">
                {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)} kg/m²
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">อาการสำคัญ (Chief Complaint)</label>
            <textarea
              rows={3}
              required
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="มีไข้ ปวดศีรษะ เจ็บคอ มา 2 วัน..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl transition shadow-md shadow-teal-500/20 flex items-center justify-center gap-2"
          >
            <span>บันทึกสัญญาณชีพและส่งเข้าห้องตรวจแพทย์</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
