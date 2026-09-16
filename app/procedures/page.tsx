'use client';

import React, { useState, useEffect } from 'react';
import { ProcedureClinicalAlgorithm, EquipmentChecklistItem, Icd9ProcedureCode } from '@/lib/clinical/procedure-algorithm';
import { recordProcedureAction } from '@/app/actions/procedures';
import { maskNationalId } from '@/lib/security/masking';

export default function MinorProcedureRoomPage() {
  const [patientHn, setPatientHn] = useState('HN-690916-0001');
  const [patientWeight, setPatientWeight] = useState<number>(60);
  const [selectedIcd9, setSelectedIcd9] = useState<string>('86.59');
  const [anesthesiaType, setAnesthesiaType] = useState<'LOCAL' | 'NONE' | 'SEDATION'>('LOCAL');
  const [useAdrenaline, setUseAdrenaline] = useState<boolean>(false);
  const [isDirtyWound, setIsDirtyWound] = useState<boolean>(false);
  const [lastTetanusYears, setLastTetanusYears] = useState<number>(6);
  const [consentSigned, setConsentSigned] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('เย็บปิดบาดแผลฉีกขาดบริเวณแขนขวา 3 เข็ม ปลอดเชื้อเรียบร้อย');
  const [equipmentList, setEquipmentList] = useState<EquipmentChecklistItem[]>(ProcedureClinicalAlgorithm.STANDARD_EQUIPMENT_CHECKLIST);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const lidoCalc = ProcedureClinicalAlgorithm.calculateLidocaineMaxDose(patientWeight, useAdrenaline);
  const tetanusEval = ProcedureClinicalAlgorithm.evaluateTetanusRequirement(isDirtyWound, lastTetanusYears);
  const activeIcd9 = ProcedureClinicalAlgorithm.ICD9_PROCEDURE_CODES.find((c) => c.code === selectedIcd9);

  function toggleEquipmentItem(id: string) {
    setEquipmentList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, stockChecked: !item.stockChecked } : item))
    );
  }

  async function handleSaveProcedure(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);

    const res = await recordProcedureAction({
      patientHn,
      procedureCode: selectedIcd9,
      procedureName: activeIcd9?.nameTh || 'ทำแผลหัตถการ',
      anesthesiaType,
      consentSigned,
      notes: `${notes} [คำนวณขนาดยาชาสูงสุด: ${lidoCalc.maxMl} ml]`,
    });

    if (res.success && res.procedure) {
      setFeedback({ type: 'success', text: `บันทึกหัตถการสำเร็จ! รหัสบันทึก: ${res.procedure.id}` });
    } else {
      setFeedback({ type: 'error', text: res.error || 'ไม่สามารถบันทึกหัตถการได้' });
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl gap-4">
          <div className="flex items-center gap-3">
            <span className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-2xl text-2xl">
              🩹
            </span>
            <div>
              <h1 className="text-xl font-bold text-white">ห้องตรวจทำแผลและหัตถการเล็ก (Minor Procedure Room)</h1>
              <p className="text-xs text-slate-400">Integrated Clinical Algorithm, Lidocaine Safety & Sterile Equipment Checklist</p>
            </div>
          </div>
          <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-full text-xs font-mono">
            STERILE ROOM ACTIVE
          </span>
        </div>

        {feedback && (
          <div
            className={`p-4 rounded-2xl border text-xs font-medium flex items-center gap-2 ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-red-500/10 border-red-500/30 text-red-300'
            }`}
          >
            <span>{feedback.type === 'success' ? '✓' : '⚠️'}</span>
            <span>{feedback.text}</span>
          </div>
        )}

        <form onSubmit={handleSaveProcedure} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Columns: Procedure Clinical Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5">
              <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">
                1. ข้อมูลผู้ป่วยและรหัสหัตถการ (Procedure & Patient Target)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 block mb-1">HN ผู้ป่วย *</label>
                  <input
                    type="text"
                    value={patientHn}
                    onChange={(e) => setPatientHn(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 block mb-1">น้ำหนักผู้ป่วย (kg) — สำหรับคำนวณขนาดยาชา</label>
                  <input
                    type="number"
                    value={patientWeight}
                    onChange={(e) => setPatientWeight(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">เลือกรหัสหัตถการ (ICD-9-CM Standard Code)</label>
                <select
                  value={selectedIcd9}
                  onChange={(e) => setSelectedIcd9(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:border-rose-500 outline-none"
                >
                  {ProcedureClinicalAlgorithm.ICD9_PROCEDURE_CODES.map((c) => (
                    <option key={c.code} value={c.code}>
                      [{c.code}] {c.nameTh} ({c.nameEn})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Lidocaine Safe Dosage & Tetanus Clinical Algorithm Banner */}
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3">
                2. อัลกอริทึมคำนวณขนาดยาชาปลอดภัย & วัคซีนบาดพยัก (Safety Calculators)
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Lidocaine Calc Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-cyan-400">💉 ขนาดยาชา Lidocaine 2% สูงสุด</span>
                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useAdrenaline}
                        onChange={(e) => setUseAdrenaline(e.target.checked)}
                      />
                      <span>ผสม Adrenaline</span>
                    </label>
                  </div>
                  <div className="text-lg font-bold font-mono text-cyan-300">
                    ไม่เกิน {lidoCalc.maxMl} ml <span className="text-xs font-normal text-slate-400">({lidoCalc.maxMg} mg)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    คำนวณตามน้ำหนัก {patientWeight} kg (ไม่เกิน {useAdrenaline ? '7.0' : '4.5'} mg/kg) เพื่อป้องกันพิษจากยาชา (LAST)
                  </p>
                </div>

                {/* Tetanus Calc Card */}
                <div className="bg-slate-950 p-4 rounded-2xl border border-amber-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-400">🛡️ การประเมินวัคซีนบาดพยัก (Tetanus)</span>
                    <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDirtyWound}
                        onChange={(e) => setIsDirtyWound(e.target.checked)}
                      />
                      <span>แผลสกปรก</span>
                    </label>
                  </div>
                  <p className="text-[11px] text-slate-300 font-medium leading-relaxed">{tetanusEval.recommendation}</p>
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">บันทึกรายละเอียดหัตถการและคำแนะนำการดูแลแผล</label>
                <textarea
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentSigned}
                    onChange={(e) => setConsentSigned(e.target.checked)}
                  />
                  <span>ผู้ป่วยเซ็นใบยินยอมรับการยินยอมทำหัตถการ (Informed Consent Signed)</span>
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-900/30 transition-all"
                >
                  {loading ? 'กำลังบันทึก...' : '💾 บันทึกการทำหัตถการ'}
                </button>
              </div>
            </div>
          </div>

          {/* Right 1 Column: Sterile Equipment Checklist */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 border-b border-slate-800 pb-3 flex items-center justify-between">
              <span>รายการอุปกรณ์หัตถการ (Checklist)</span>
              <span className="text-xs font-normal text-emerald-400">Sterile Standard</span>
            </h2>

            <div className="space-y-2 text-xs">
              {equipmentList.map((item) => (
                <div
                  key={item.id}
                  onClick={() => toggleEquipmentItem(item.id)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                    item.stockChecked
                      ? 'bg-slate-950 border-emerald-500/40 text-slate-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-500 opacity-60'
                  }`}
                >
                  <span className={`text-base font-bold ${item.stockChecked ? 'text-emerald-400' : 'text-slate-600'}`}>
                    {item.stockChecked ? '✓' : '○'}
                  </span>
                  <div>
                    <span className="font-semibold block">{item.name}</span>
                    {item.lotNumber && (
                      <span className="text-[10px] font-mono text-cyan-400 block mt-0.5">Lot: {item.lotNumber}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
